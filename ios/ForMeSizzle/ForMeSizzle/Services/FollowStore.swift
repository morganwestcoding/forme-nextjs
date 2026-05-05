import SwiftUI
import Combine

// Centralised follow state so any view in the app — profile, listing detail,
// rows, headers, counters — stays in sync the instant a follow toggles.
//
// Each entity type (user / listing / shop) gets its own membership set: a
// userId is in `followedUsers` iff currentUser follows them, and similarly
// for listings/shops. Counters are kept consistent via per-entity deltas:
// the view computes `displayedCount = baseFromModel + store.delta(for: id)`,
// so a follow on Profile updates the counter on a ListingDetail row that
// happens to show the same user's stats.
//
// All mutations are optimistic + rollback on API failure.
@MainActor
final class FollowStore: ObservableObject {
    static let shared = FollowStore()

    enum Target {
        case user, listing, shop

        var apiTypeParam: String? {
            switch self {
            case .user: return nil      // server defaults to "user"
            case .listing: return "listing"
            case .shop: return "shop"
            }
        }
    }

    @Published private(set) var followedUsers: Set<String> = []
    @Published private(set) var followedListings: Set<String> = []
    @Published private(set) var followedShops: Set<String> = []
    @Published private(set) var deltas: [String: Int] = [:]

    private let api = APIService.shared

    private init() {}

    // MARK: - Hydration
    //
    // Call from the source of truth whenever fresh data arrives:
    //   - hydrateFromCurrentUser when /profile resolves
    //   - register(listing:) / register(shop:) / register(user:) from detail
    //     view models when a fresh entity arrives over the wire
    //
    // Hydration is "the server is the truth" — membership snaps to whatever
    // the server says, and any optimistic delta for that entity is cleared.
    // Without the reset, a follow that's already persisted would be counted
    // twice on the next view re-render: base (server, includes me) + delta
    // (still +1 from the original tap) = +2.

    func hydrateFromCurrentUser(_ user: User?) {
        guard let user else { return }
        followedUsers = Set(user.following ?? [])
    }

    func register(listing: Listing, currentUserId: String?) {
        let following = currentUserId.map { listing.followers?.contains($0) == true } ?? false
        if following {
            followedListings.insert(listing.id)
        } else {
            followedListings.remove(listing.id)
        }
        deltas[listing.id] = 0
    }

    func register(shop: Shop, currentUserId: String?) {
        let following = currentUserId.map { shop.followers?.contains($0) == true } ?? false
        if following {
            followedShops.insert(shop.id)
        } else {
            followedShops.remove(shop.id)
        }
        deltas[shop.id] = 0
    }

    /// User profiles need the delta reset too — `hydrateFromCurrentUser`
    /// updates membership (am I following them?) but doesn't know which
    /// users' counters are currently being displayed.
    func registerUserProfile(id: String) {
        deltas[id] = 0
    }

    // MARK: - Reads

    func isFollowing(id: String, target: Target) -> Bool {
        switch target {
        case .user: return followedUsers.contains(id)
        case .listing: return followedListings.contains(id)
        case .shop: return followedShops.contains(id)
        }
    }

    /// Resolved follower count to display: model's known count + any delta
    /// from in-flight or already-applied toggles in this session.
    func count(base: Int, for id: String) -> Int {
        max(0, base + (deltas[id] ?? 0))
    }

    // MARK: - Mutation

    func toggle(id: String, target: Target) async {
        let wasFollowing = isFollowing(id: id, target: target)
        applyMembership(id: id, target: target, follow: !wasFollowing)
        deltas[id, default: 0] += wasFollowing ? -1 : 1

        do {
            try await api.toggleFollow(id: id, type: target.apiTypeParam)
        } catch {
            // Rollback both membership and the counter delta so the UI reflects
            // the real server state instead of pretending success.
            applyMembership(id: id, target: target, follow: wasFollowing)
            deltas[id, default: 0] -= wasFollowing ? -1 : 1
        }
    }

    private func applyMembership(id: String, target: Target, follow: Bool) {
        switch target {
        case .user:
            if follow { followedUsers.insert(id) } else { followedUsers.remove(id) }
        case .listing:
            if follow { followedListings.insert(id) } else { followedListings.remove(id) }
        case .shop:
            if follow { followedShops.insert(id) } else { followedShops.remove(id) }
        }
    }
}
