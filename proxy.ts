import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/dashboard/projects/(.*)/quotation(.*)",
  "/dashboard/invoices/(.*)/print(.*)",
  "/quotation(.*)",
  "/invoice(.*)",
]);
const isAdminRoute = createRouteMatcher([
  "/dashboard/users(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) {
    return;
  }

  const session = await auth();

  // Ensure authenticated session
  if (!session.userId) {
    return session.redirectToSignIn();
  }

  // Check admin & manager routes for user management
  if (isAdminRoute(request)) {
    const role = (session.sessionClaims?.metadata as { role?: string } | undefined)?.role;
    // Both admin and manager can access user directory (with role-based feature gating)
    const isUserRoute = request.nextUrl.pathname.startsWith("/dashboard/users");
    const isAllowed = role === "admin" || (isUserRoute && role === "manager");

    if (role && !isAllowed) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden: Elevated privileges required" },
          { status: 403 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
