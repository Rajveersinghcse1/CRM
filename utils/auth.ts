import { cache } from "react";
import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type CrmRole = "admin" | "manager" | "sales" | "employee" | "viewer";

export const VALID_ROLES: readonly CrmRole[] = [
  "admin",
  "manager",
  "sales",
  "employee",
  "viewer",
] as const;

export function isValidRole(role: unknown): role is CrmRole {
  return typeof role === "string" && VALID_ROLES.includes(role as CrmRole);
}

// Request-scoped deduplicated Clerk user fetch (at most 1 network call per render pass)
export const getCurrentUser = cache(async () => {
  try {
    return await currentUser();
  } catch (err: unknown) {
    const error = err as { digest?: string; message?: string };
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.warn("Clerk currentUser fetch failed:", err);
    return null;
  }
});

// Request-scoped deduplicated role check — checks local JWT claims first (0ms), falls back to cached currentUser
export const getCurrentUserRole = cache(async (): Promise<CrmRole | null> => {
  // Fast Path 1: Check session claims directly from the JWT (0ms network cost)
  try {
    const session = await auth();
    if (!session.userId) return null;
    const metadataRole = (session.sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (isValidRole(metadataRole)) {
      return metadataRole;
    }
  } catch {
    // auth() may fail in some edge runtime contexts, continue to fallback
  }

  // Fast Path 2: Use request-cached user
  const user = await getCurrentUser();
  if (!user) return null;

  const rawRole = user.publicMetadata?.role;
  if (isValidRole(rawRole)) {
    return rawRole;
  }

  // Primary administrator email fallback (only exact primary accounts)
  const userEmail = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const ADMIN_EMAILS = [
    "namansingh4680@gmail.com",
    "1.rajveersinghcse@gmail.com",
  ];
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return "admin";
  }

  // Default safely to "employee"
  return "employee";
});

export const requireAuth = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
});

export const requireRole = cache(async (allowedRoles: CrmRole | CrmRole[]) => {
  const user = await requireAuth();
  const role = (await getCurrentUserRole()) || "employee";

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!allowed.includes(role)) {
    redirect("/dashboard");
  }

  return { user, role };
});

export const hasRole = cache(async (allowedRoles: CrmRole | CrmRole[]): Promise<boolean> => {
  const role = await getCurrentUserRole();
  if (!role) return false;
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return allowed.includes(role);
});

// Granular permission helpers
export function canViewUsers(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager";
}

export function canManageUsers(role: CrmRole | null): boolean {
  return role === "admin";
}

export function canMutateSales(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager" || role === "sales";
}

export function canMutateProjects(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager";
}

export function canMutateTasks(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager" || role === "sales" || role === "employee";
}

export function canMutateVendors(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager";
}

export function canMutateInvoices(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager" || role === "sales";
}

export function canLogExpenses(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager" || role === "sales" || role === "employee";
}

export function canManageFinances(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager" || role === "sales";
}

export function canEditProjects(role: CrmRole | null): boolean {
  return role === "admin" || role === "manager";
}

export function canViewAuditLogs(role: CrmRole | null): boolean {
  return role === "admin";
}

export function isReadOnly(role: CrmRole | null): boolean {
  return role === "viewer";
}

export const getUserRole = getCurrentUserRole;

export function getUserDisplayName(user: any): string {
  if (!user) return "System";

  if (typeof user === "string") {
    if (user.includes("@")) {
      const localPart = user.split("@")[0].replace(/^[0-9]+[._-]?/, "");
      const words = localPart
        .replace(/cse$/i, "")
        .split(/[._-]/)
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      if (words.length > 0) return words.join(" ");
      return user.split("@")[0];
    }
    return user;
  }

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) return fullName;

  if (user.username && !user.username.includes("@")) {
    return user.username;
  }

  const rawEmail = user.emailAddresses?.[0]?.emailAddress;
  if (rawEmail) {
    const localPart = rawEmail.split("@")[0].replace(/^[0-9]+[._-]?/, "");
    const words = localPart
      .replace(/cse$/i, "")
      .split(/[._-]/)
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    if (words.length > 0) {
      return words.join(" ");
    }
    return rawEmail.split("@")[0];
  }

  if (user.id) {
    return `User (${user.id.slice(-6)})`;
  }

  return "User";
}

