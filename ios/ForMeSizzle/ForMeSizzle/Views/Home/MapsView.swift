import SwiftUI
import MapKit

struct MapsView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var position: MapCameraPosition = .automatic
    @State private var showMessages = false

    var body: some View {
        ZStack(alignment: .top) {
            Map(position: $position) {
            }
            .ignoresSafeArea()

            // Header
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Maps")
                        .font(.largeTitle.bold())
                        .foregroundColor(ForMe.textPrimary)

                    Text("Explore nearby")
                        .font(.subheadline)
                        .foregroundColor(ForMe.textSecondary)
                }

                Spacer()

                HStack(spacing: 12) {
                    HeaderIconButton(icon: "AlertBell") {
                        // TODO: alerts
                    }

                    HeaderIconButton(icon: "HeaderChat") {
                        showMessages = true
                    }

                    Button {
                        appState.selectedTab = .profile
                    } label: {
                        DynamicAvatar(
                            name: authViewModel.currentUser?.name ?? "User",
                            imageUrl: authViewModel.currentUser?.image,
                            size: .smallMedium
                        )
                    }
                }
            }
            .padding(.horizontal)
            .padding(.top, 8)
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showMessages) {
            NavigationStack {
                MessagesListView()
            }
        }
    }
}

#Preview {
    MapsView()
}
