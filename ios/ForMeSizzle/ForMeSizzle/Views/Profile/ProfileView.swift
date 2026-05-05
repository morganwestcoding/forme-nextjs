import SwiftUI

struct ProfileView: View {
    var userId: String? = nil  // nil = current user
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = ProfileViewModel()
    @ObservedObject private var followStore = FollowStore.shared
    @State private var showEditProfile = false
    @State private var showSettings = false
    @State private var showReserveFlow = false
    @State private var pendingConversation: Conversation?
    @State private var startConversationError: String?
    // Direct-book context when a service is tapped from this profile's grid.
    // Carries listing + service + the profile owner as fixedEmployee so the
    // BookingView skips the provider picker — we already know who you want.
    @State private var directBooking: DirectBookingContext?
    // TikTok-style feed launched from a tapped post on this profile. The
    // feed shows this profile's posts first, then keeps scrolling into the
    // global feed once they run out — `feedExtraPosts` is loaded lazily in
    // the background so the transition feels seamless.
    @State private var showFeed = false
    @State private var feedStartIndex = 0
    @State private var feedExtraPosts: [Post] = []

    private var user: User? {
        viewModel.user ?? (userId == nil ? authViewModel.currentUser : nil)
    }

    private var isCurrentUser: Bool {
        userId == nil || userId == authViewModel.currentUser?.id
    }

    // Follow state + counter both come from FollowStore so any toggle —
    // here, on a listing detail, or in a future row — instantly flips the
    // button and shifts the count without a refetch.
    private var isFollowing: Bool {
        guard let id = user?.id else { return false }
        return followStore.isFollowing(id: id, target: .user)
    }

    private var followerCount: Int {
        let base = user?.followers?.count ?? 0
        guard let id = user?.id else { return base }
        return followStore.count(base: base, for: id)
    }

    // Profile's posts come first; once they're exhausted the feed continues
    // into globally-loaded posts. We dedupe so a post that's both on the
    // profile and in the global feed doesn't appear twice.
    private var feedPosts: [Post] {
        let profileIds = Set(viewModel.posts.map(\.id))
        return viewModel.posts + feedExtraPosts.filter { !profileIds.contains($0.id) }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                Color.clear.frame(height: 20)
                if user != nil {
                    profileCard
                    contentSections
                } else {
                    ProgressView()
                        .padding(.top, 120)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.bottom, 100)
        }
        .background(ForMe.background)
        // Mirror the new ListingDetailView chrome: hide the system nav bar
        // entirely and render a custom overlay top bar so the back button +
        // 3-dot menu sit in pill-shaped chrome that we fully control.
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
        .overlay(alignment: .top) {
            topBar
        }
        .sheet(isPresented: $showEditProfile) {
            EditProfileView()
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
        .sheet(item: $directBooking) { ctx in
            BookingView(listing: ctx.listing, initialService: ctx.service, fixedEmployee: ctx.employee)
        }
        .fullScreenCover(isPresented: $showFeed) {
            FeedView(posts: feedPosts, startIndex: feedStartIndex)
        }
        .sheet(isPresented: $showReserveFlow) {
            if let user = user {
                ProfileReserveFlow(
                    profileUser: user,
                    listings: viewModel.listings,
                    services: viewModel.services
                )
            }
        }
        .sheet(item: $pendingConversation) { convo in
            NavigationStack {
                ChatView(conversation: convo)
            }
        }
        .alert("Couldn't open chat", isPresented: .init(
            get: { startConversationError != nil },
            set: { if !$0 { startConversationError = nil } }
        )) {
            Button("OK") { startConversationError = nil }
        } message: {
            Text(startConversationError ?? "")
        }
        .task {
            if let id = userId {
                await viewModel.loadProfile(userId: id, currentUser: authViewModel.currentUser)
            } else if let id = authViewModel.currentUser?.id {
                await viewModel.loadProfile(userId: id, currentUser: authViewModel.currentUser)
            }
            // Pre-load global feed posts in the background so the TikTok-style
            // feed can keep scrolling after the profile's own posts. Failure is
            // non-critical — the feed just stops at the end of profile posts.
            if feedExtraPosts.isEmpty {
                if let extra = try? await APIService.shared.getFeed() {
                    feedExtraPosts = extra
                }
            }
        }
        .refreshable {
            let id = userId ?? authViewModel.currentUser?.id
            if let id { await viewModel.loadProfile(userId: id, currentUser: authViewModel.currentUser) }
        }
    }

    private var topBar: some View {
        HStack {
            Button {
                dismiss()
            } label: {
                HugeIcon(paths: HugeIcon.arrowLeftPaths, size: 20, color: ForMe.stone500)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(.ultraThinMaterial))
                    .overlay(Circle().stroke(ForMe.stone200.opacity(0.6), lineWidth: 1))
                    .elevation(.level1)
            }
            .buttonStyle(.plain)

            Spacer()

            Menu {
                if isCurrentUser {
                    Button { showSettings = true } label: {
                        Label("Settings", systemImage: "gearshape")
                    }
                    Button { showEditProfile = true } label: {
                        Label("Edit Profile", systemImage: "pencil")
                    }
                } else {
                    Button {
                        if let id = user?.id {
                            Task { await followStore.toggle(id: id, target: .user) }
                        }
                    } label: {
                        Label(isFollowing ? "Following" : "Follow",
                              systemImage: "person.badge.plus")
                    }
                    Button {
                        Task { await startMessage() }
                    } label: {
                        Label("Message", systemImage: "bubble.left")
                    }
                }
                Divider()
                Button { shareProfile() } label: {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
            } label: {
                HugeMoreVertical(size: 20, color: ForMe.stone500)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(.ultraThinMaterial))
                    .overlay(Circle().stroke(ForMe.stone200.opacity(0.6), lineWidth: 1))
                    .elevation(.level1)
            }
            .menuOrder(.fixed)
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12)
        .padding(.top, 8)
    }

    private func startMessage() async {
        guard let targetId = user?.id, !isCurrentUser else { return }
        do {
            let convo = try await APIService.shared.startConversation(userId: targetId)
            pendingConversation = convo
        } catch {
            startConversationError = error.localizedDescription
        }
    }

    private func shareProfile() {
        let name = user?.name ?? "Profile"
        let text = "\(name) on ForMe"
        let activityVC = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let root = scene.windows.first?.rootViewController {
            root.present(activityVC, animated: true)
        }
    }
}

// Identifiable so .sheet(item:) treats a fresh tap as a fresh presentation —
// rebuilds BookingView with the right listing/service/employee each time.
private struct DirectBookingContext: Identifiable {
    let listing: Listing
    let service: Service
    let employee: Employee
    var id: String { "\(listing.id)|\(service.id)|\(employee.id)" }
}

// MARK: - Profile Card (matches listing detail business card)

private extension ProfileView {
    var profileCard: some View {
        VStack(spacing: 0) {
            // Avatar — same white 3pt ring + soft shadow the listing's
            // business card uses on its hero, just clipped to a circle here.
            // Bottom padding gives the name/title below room to breathe.
            DynamicAvatar(
                name: user?.name ?? "User",
                imageUrl: user?.avatarURL,
                size: .large,
                showBorder: false
            )
            .overlay(Circle().stroke(.white, lineWidth: 3))
            .elevation(.level2)
            .padding(.bottom, 12)

            // Name + verification
            HStack(spacing: 6) {
                Text(user?.name ?? "User")
                    .font(ForMe.font(.semibold, size: 20))
                    .foregroundColor(ForMe.textPrimary)

                if user?.isVerified == true {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 16))
                        .foregroundColor(ForMe.accent)
                }
            }
            .padding(.top, ForMe.space2)

            // Student badge
            if user?.isStudent == true, let academy = user?.academyName {
                Text("Student at \(academy)")
                    .font(ForMe.font(.medium, size: 11))
                    .foregroundColor(Color(red: 0.71, green: 0.45, blue: 0.05))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(Color(red: 1.0, green: 0.97, blue: 0.92))
                    )
                    .overlay(
                        Capsule()
                            .stroke(Color(red: 0.99, green: 0.90, blue: 0.71), lineWidth: 1)
                    )
                    .padding(.top, 6)
            }

            // Job title (shop role) — sits directly under the name like the
            // listing's category line. Falls back to `role` so older accounts
            // still surface something.
            if let title = jobTitleText {
                Text(title)
                    .font(ForMe.font(.medium, size: 13))
                    .foregroundColor(ForMe.textTertiary)
                    .padding(.top, 2)
            }

            // Location
            if let location = user?.location {
                Text(location)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone400)
                    .padding(.top, 2)
            }

            // Rating — same web-style 14pt stars used on ListingDetailView,
            // driven off the unified review stats from /users/[id]/profile.
            ratingView
                .padding(.top, ForMe.space3)
                .padding(.bottom, ForMe.space2)

            // Stats row
            statsRow
                .padding(.top, ForMe.space4)

            // Bio — same vertical rhythm as the listing's description: 28pt
            // above and below so the Save/Share row sits in the same place.
            if let bio = user?.bio, !bio.isEmpty {
                Text(bio)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone500)
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, 28)
                    .lineLimit(4)
            }

            // Action buttons
            actionButtons
                .padding(.top, 28)
                .padding(.horizontal)
        }
        .padding(.bottom, ForMe.space4)
    }

    // Mirrors web's ProfileHead jobTitle resolver: prefer the per-listing
    // Employee.jobTitle (more specific — e.g. "Senior Barber" at this shop),
    // then fall back to the user's global jobTitle, then "Member" / "Student".
    var jobTitleText: String? {
        guard let uid = user?.id else { return nil }
        for listing in viewModel.listings {
            if let emp = listing.employees?.first(where: { $0.userId == uid }),
               let title = emp.jobTitle, !title.isEmpty {
                return title
            }
        }
        if let t = user?.jobTitle, !t.isEmpty { return t }
        if user?.isStudent == true { return "Student" }
        return "Member"
    }

    var ratingView: some View {
        // Match ListingDetailView's rating row exactly: 14pt stars, same SVG
        // path filled gold for filled positions / #e5e7eb for empty.
        HStack(spacing: 4) {
            let avg = Int((viewModel.reviewStats?.averageRating ?? 0).rounded())
            ForEach(0..<5, id: \.self) { i in
                if i < avg {
                    GoldStar(size: 14)
                } else {
                    GoldStar(size: 14, fillColor: Color(hex: "e5e7eb"))
                }
            }
            Text("\(viewModel.reviewStats?.totalCount ?? 0)")
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone400)
                .padding(.leading, 6)
        }
    }

    var statsRow: some View {
        HStack(spacing: 0) {
            statItem(value: "\(viewModel.services.count)", label: "services")
            Divider().frame(height: 32)
            statItem(value: "\(followerCount)", label: "followers")
            Divider().frame(height: 32)
            statItem(value: "\(viewModel.reviewStats?.totalCount ?? user?.following?.count ?? 0)",
                     label: "reviews")
        }
        .padding(.horizontal, ForMe.space6)
    }

    func statItem(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 18, weight: .bold, design: .rounded))
                .foregroundColor(ForMe.textPrimary)
            Text(label)
                .font(ForMe.font(.regular, size: 12))
                .foregroundColor(ForMe.stone400)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    var actionButtons: some View {
        if isCurrentUser {
            Button {
                showEditProfile = true
            } label: {
                Text("Edit Profile")
                    .font(ForMe.font(.semibold, size: 13))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }
        } else {
            HStack(spacing: 10) {
                Button {
                    showReserveFlow = true
                } label: {
                    Text("Reserve")
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(ForMe.stone900)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                }

                Button {
                    if let id = user?.id {
                        Haptics.confirm()
                        Task { await followStore.toggle(id: id, target: .user) }
                    }
                } label: {
                    Text(isFollowing ? "Following" : "Follow")
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(ForMe.stone700)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(ForMe.stone50)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(ForMe.stone200, lineWidth: 1)
                        )
                }
            }
        }
    }
}

// MARK: - Content Sections

private extension ProfileView {
    var contentSections: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Services this user can perform — mirrors the listing detail's
            // "Book A Service" grid so the booking entry point is identical
            // whether you arrive via a listing or via the user's profile.
            if !viewModel.services.isEmpty {
                servicesSection
            }

            // Posts
            if !viewModel.posts.isEmpty {
                postsSection
            }

            // Listings
            if !viewModel.listings.isEmpty {
                listingsSection
            }

            // Reviews
            if !viewModel.reviews.isEmpty {
                reviewsSection
            }

            // Gallery
            if let gallery = user?.galleryImages, !gallery.isEmpty {
                gallerySection(images: gallery)
            }
        }
        .padding(.horizontal)
        .padding(.top, ForMe.space4)
    }

    var servicesSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            sectionTitle("Book A Service")

            // Tapping a service from a profile means "book THIS person for
            // THAT service" — open BookingView directly with fixedEmployee
            // set to the profile owner so the provider picker is skipped.
            // Falls back to navigating to the listing if we don't yet have
            // enough loaded data to do the direct hand-off.
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 10),
                GridItem(.flexible(), spacing: 10)
            ], spacing: 10) {
                ForEach(Array(viewModel.services.enumerated()), id: \.element.id) { index, service in
                    ServiceRow(service: service) {
                        bookService(service)
                    }
                    .staggeredFadeIn(index: index)
                }
            }
        }
    }

    private func bookService(_ service: Service) {
        guard let listingId = service.listingId else { return }
        let listing = viewModel.listings.first { $0.id == listingId }
        let employee = listing?.employees?.first { $0.userId == user?.id }
        if let listing, let employee {
            directBooking = DirectBookingContext(listing: listing, service: service, employee: employee)
        } else {
            // No listing/employee in scope yet — fall back to the listing page
            // so the user can still complete the booking from there.
            appState.navigationPath.append(ListingIdRoute(id: listingId))
        }
    }

    var postsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            sectionTitle("Posts")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    // Tap → open the TikTok-style feed positioned on the
                    // tapped post. Index is computed against the combined
                    // feedPosts so once the user scrolls past the profile's
                    // own posts, the global feed continues seamlessly.
                    ForEach(Array(viewModel.posts.prefix(10).enumerated()), id: \.element.id) { index, post in
                        PostCard(post: post)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                feedStartIndex = index
                                showFeed = true
                            }
                    }
                }
            }
        }
    }

    var listingsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            sectionTitle("Listings")

            // Tap a listing row → push the listing detail. Explicit Button +
            // path append (instead of NavigationLink) so the row itself
            // navigates cleanly without colliding with ListingRow's internal
            // 3-dot menu. This is NOT the reserve flow — that lives behind
            // the "Reserve" button at the top of the profile card.
            VStack(spacing: 4) {
                ForEach(viewModel.listings.prefix(5)) { listing in
                    Button {
                        appState.navigationPath.append(listing)
                    } label: {
                        ListingRow(listing: listing)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    var reviewsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            sectionTitle("Reviews")

            VStack(spacing: 12) {
                ForEach(viewModel.reviews.prefix(5)) { review in
                    ReviewRow(review: review)
                }
            }
        }
    }

    func gallerySection(images: [String]) -> some View {
        VStack(spacing: ForMe.space3) {
            sectionTitle("Gallery")
                .frame(maxWidth: .infinity, alignment: .leading)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 1), count: 3), spacing: 1) {
                ForEach(images, id: \.self) { url in
                    AsyncImage(url: AssetURL.resolve(url)) { phase in
                        switch phase {
                        case .success(let image):
                            image.resizable().aspectRatio(contentMode: .fill)
                        default:
                            Rectangle().fill(ForMe.stone100)
                        }
                    }
                    .frame(minHeight: 0)
                    .aspectRatio(1, contentMode: .fill)
                    .clipped()
                }
            }
        }
        .padding(.horizontal, -ForMe.space4)
    }

    func sectionTitle(_ text: String) -> some View {
        Text(text)
            .font(ForMe.font(.semibold, size: 17))
            .foregroundColor(ForMe.textPrimary)
    }
}

// MARK: - Review Row

struct ReviewRow: View {
    let review: Review

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                DynamicAvatar(
                    name: review.user?.name ?? "User",
                    imageUrl: review.user?.avatarURL,
                    size: .small
                )
                VStack(alignment: .leading, spacing: 2) {
                    Text(review.user?.name ?? "User")
                        .font(ForMe.font(.semibold, size: 13))
                        .foregroundColor(ForMe.textPrimary)

                    HStack(spacing: 2) {
                        ForEach(0..<5, id: \.self) { i in
                            if i < Int(review.rating) {
                                GoldStar(size: 10)
                            } else {
                                Image(systemName: "star")
                                    .font(.system(size: 10))
                                    .foregroundColor(ForMe.stone200)
                            }
                        }
                    }
                }
                Spacer()
            }

            if let comment = review.comment, !comment.isEmpty {
                Text(comment)
                    .font(ForMe.font(.regular, size: 13))
                    .foregroundColor(ForMe.stone600)
                    .lineSpacing(3)
            }
        }
        .padding(ForMe.space4)
        .background(ForMe.surface)
        .clipShape(RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: ForMe.radius2XL, style: .continuous)
                .stroke(ForMe.borderLight, lineWidth: 1)
        )
    }
}

// MARK: - Previews

#Preview("Current User") {
    NavigationStack {
        let vm = AuthViewModel()
        var user = User(id: "1")
        user.name = "Marcus Johnson"
        user.bio = "Barber & stylist based in Long Beach. 10+ years crafting fresh cuts."
        user.location = "Long Beach, CA"
        user.role = "Barber"
        user.followers = ["a", "b", "c", "d"]
        user.following = ["a", "b"]
        vm.currentUser = user

        return ProfileView()
            .environmentObject(vm)
            .environmentObject(AppState())
    }
}

#Preview("Other User") {
    NavigationStack {
        ProfileView(userId: "other-user-id")
            .environmentObject(AuthViewModel())
            .environmentObject(AppState())
    }
}
