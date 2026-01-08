import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
    matcher: [
        "/trips",
        "/reservations",
        "/properties",
        "/properties/:path*",
        "/favorites",
        "/bookings",
        "/bookings/:path*",
        "/profile/:path*/edit",
    ],
}