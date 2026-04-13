import SwiftUI

struct ProfileView: View {
    var userId: String? = nil  // nil = current user
    @EnvironmentObject var authViewModel: AuthViewModel
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
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if isCurrentUser {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button { showSettings = true } label: {
                        Image(systemName: "gearshape")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(ForMe.textPrimary)
                    }
                }
            }
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
}

// MARK: - Profile Card (matches listing detail business card)

private extension ProfileView {
    var profileCard: some View {
        VStack(spacing: 0) {
            // Avatar
            DynamicAvatar(
                name: user?.name ?? "User",
                imageUrl: user?.image ?? user?.imageSrc,
                size: .large
            )

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

            // Location
            if let location = user?.location {
                Text(location)
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone400)
                    .padding(.top, 2)
            }

            // Role/title
            if let role = user?.role, !role.isEmpty, role != "user" {
                Text(role.capitalized)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(ForMe.textTertiary)
                    .padding(.top, 4)
            }

            // Stats row
            statsRow
                .padding(.top, ForMe.space4)

            // Bio
            if let bio = user?.bio, !bio.isEmpty {
                Text(bio)
                    .font(.system(size: 13))
                    .foregroundColor(ForMe.stone500)
                    .lineSpacing(5)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, ForMe.space6)
                    .padding(.top, ForMe.space4)
                    .lineLimit(4)
            }

            // Action buttons
            actionButtons
                .padding(.top, ForMe.space4)
                .padding(.horizontal)
        }
        .padding(.bottom, ForMe.space4)
    }

    var statsRow: some View {
        HStack(spacing: 0) {
            statItem(value: "\(viewModel.posts.count)", label: "posts")
            Divider().frame(height: 32)
            statItem(value: "\(user?.followers?.count ?? 0)", label: "followers")
            Divider().frame(height: 32)
            statItem(value: "\(user?.following?.count ?? 0)", label: "following")
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
                    .padding(.vertical, 13)
                    .background(ForMe.stone900)
                    .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
            }
        } else {
            HStack(spacing: 10) {
                Button {
                    Task { await viewModel.toggleFollow() }
                } label: {
                    Text(viewModel.isFollowing ? "Following" : "Follow")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(viewModel.isFollowing ? ForMe.textPrimary : .white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 13)
                        .background(viewModel.isFollowing ? ForMe.stone50 : ForMe.stone900)
                        .clipShape(RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: ForMe.radiusXL, style: .continuous)
                                .stroke(viewModel.isFollowing ? ForMe.stone200 : .clear, lineWidth: 1)
                        )
                }

                Button {
                    // TODO: open message
                } label: {
                    Text("Message")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(ForMe.textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 13)
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

            VStack(spacing: 16) {
                ForEach(viewModel.listings.prefix(5)) { listing in
                    NavigationLink(value: listing) {
                        ListingFullWidthCard(listing: listing)
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
    }
}

#Preview("Other User") {
    NavigationStack {
        ProfileView(userId: "other-user-id")
            .environmentObject(AuthViewModel())
    }
}
