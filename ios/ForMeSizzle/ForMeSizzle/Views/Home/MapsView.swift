import SwiftUI
import MapKit

struct MapsView: View {
    @State private var position: MapCameraPosition = .automatic

    var body: some View {
        Map(position: $position) {
        }
        .ignoresSafeArea()
        .navigationBarHidden(true)
    }
}

#Preview {
    MapsView()
}
