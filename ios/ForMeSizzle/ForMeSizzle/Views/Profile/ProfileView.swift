import SwiftUI

struct ProfileView: View {
    var userId: String? = nil  // nil = current user
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = ProfileViewModel()
    @State private var showEditProfile = false
    @State private var showSettings = false

    private var user: User? {
        viewModel.user ?? (userId == nil ? authViewModel.currentUser : nil)
    }

    private var isCurrentUser: Bool {
        userId == nil || userId == authViewModel.currentUser?.id
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                Color.clear.frame(height: 20)
                profileCard
                contentSections
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
        .task {
            if let id = userId {
                await viewModel.loadProfile(userId: id)
            } else if let id = authViewModel.currentUser?.id {
                await viewModel.loadProfile(userId: id)
            }
        }
    }

    private var topBar: some View {
        HStack {
            Button {
                dismiss()
            } label: {
                HugeIcon(paths: HugeIcon.arrowLeftPaths, size: 20, color: ForMe.stone500)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(ForMe.stone100))
                    .overlay(Circle().stroke(ForMe.stone200, lineWidth: 1))
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
                        Task { await viewModel.toggleFollow() }
                    } label: {
                        Label(viewModel.isFollowing ? "Following" : "Follow",
                              systemImage: "person.badge.plus")
                    }
                    Button {
                        // TODO: open message
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
                    .background(Circle().fill(ForMe.stone100))
                    .overlay(Circle().stroke(ForMe.stone200, lineWidth: 1))
            }
            .menuOrder(.fixed)
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12)
        .padding(.top, 8)
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

// MARK: - Profile Card (matches listing detail business card)

private extension ProfileView {
    var profileCard: some View {
        VStack(spacing: 0) {
            // Avatar — same white 3pt ring + soft shadow the listing's
            // business card uses on its hero, just clipped to a circle here.
            // Bottom padding gives the name/title below room to breathe.
            DynamicAvatar(
                name: user?.name ?? "User",
                imageUrl: user?.image ?? user?.imageSrc,
                size: .large,
                showBorder: false
            )
            .overlay(Circle().stroke(.white, lineWidth: 3))
            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
            .padding(.bottom, 12)

            // Name + verification
            HStack(spacing: 6) {
                Text(user?.name ?? "User")
                    .font(.system(size: 20, weight: .semibold))
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
                    .font(.system(size: 11, weight: .medium))
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
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(ForMe.textTertiary)
                    .padding(.top, 2)
            }

            // Location
            if let location = user?.location {
                Text(location)
                    .font(.system(size: 13))
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
                    .font(.system(size: 13))
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
                .font(.system(size: 12))
                .foregroundColor(ForMe.stone400)
                .padding(.leading, 6)
        }
    }

    var statsRow: some View {
        HStack(spacing: 0) {
            statItem(value: "\(viewModel.services.count)", label: "services")
            Divider().frame(height: 32)
            statItem(value: "\(user?.followers?.count ?? 0)", label: "followers")
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
                .font(.system(size: 12))
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
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }
        } else {
            HStack(spacing: 10) {
                Button {
                    if let first = viewModel.services.first, let listingId = first.listingId {
                        appState.navigationPath.append(ListingIdRoute(id: listingId))
                    }
                } label: {
                    Text("Reserve")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(ForMe.stone900)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                }

                Button {
                    Task { await viewModel.toggleFollow() }
                } label: {
                    Text(viewModel.isFollowing ? "Following" : "Follow")
                        .font(.system(size: 13, weight: .semibold))
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

            // Tapping a service routes to its parent listing — the booking
            // sheet lives there and already supports preselecting employee +
            // service. We push via appState.navigationPath instead of
            // wrapping in NavigationLink because ServiceRow itself is a
            // Button, and nesting Buttons inside NavigationLink eats the tap.
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 10),
                GridItem(.flexible(), spacing: 10)
            ], spacing: 10) {
                ForEach(Array(viewModel.services.enumerated()), id: \.element.id) { index, service in
                    ServiceRow(service: service) {
                        if let listingId = service.listingId {
                            appState.navigationPath.append(ListingIdRoute(id: listingId))
                        }
                    }
                    .staggeredFadeIn(index: index)
                }
            }
        }
    }

    var postsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            sectionTitle("Posts")

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(viewModel.posts.prefix(10)) { post in
                        PostCard(post: post)
                    }
                }
            }
        }
    }

    var listingsSection: some View {
        VStack(alignment: .leading, spacing: ForMe.space3) {
            sectionTitle("Listings")

            VStack(spacing: 4) {
                ForEach(viewModel.listings.prefix(5)) { listing in
                    NavigationLink(value: listing) {
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
                    AsyncImage(url: URL(string: url)) { phase in
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
            .font(.system(size: 17, weight: .semibold))
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
                    imageUrl: review.user?.image,
                    size: .small
                )
                VStack(alignment: .leading, spacing: 2) {
                    Text(review.user?.name ?? "User")
                        .font(.system(size: 13, weight: .semibold))
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
                    .font(.system(size: 13))
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
