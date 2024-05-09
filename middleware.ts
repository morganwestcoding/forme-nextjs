import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
    matcher: ["/trips",
    "/reservations",
    "properties",
    "/favorites"],
}