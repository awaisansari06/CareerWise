import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import { db } from "./prisma";

export const checkUser = cache(async () => {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      include: { resume: true },
    });

    // A normal page visit needs only the verified session and local account.
    // Fetch the remote Clerk profile only to provision or repair a legacy name.
    if (loggedInUser && !loggedInUser.name?.includes("null")) return loggedInUser;
    const user = await currentUser();
    if (!user) return null;

    // Build clean display name without literal "null" or "undefined"
    const nameParts = [user.firstName, user.lastName]
      .filter((part) => typeof part === "string" && part.trim().length > 0 && part !== "null" && part !== "undefined");
    const cleanName = nameParts.length > 0
      ? nameParts.join(" ").trim()
      : (user.username || user.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User");

    if (loggedInUser) {
      // If existing user's name was corrupted with "null", clean it up
      if (loggedInUser.name && loggedInUser.name.includes("null") && cleanName !== loggedInUser.name) {
        return await db.user.update({
          where: { id: loggedInUser.id },
          data: { name: cleanName },
          include: { resume: true },
        });
      }
      return loggedInUser;
    }

    const newUser = await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name: cleanName,
        imageUrl: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
      },
      include: { resume: true },
    });
    return newUser;
  } catch (error) {
    // Preserve Next.js request-rendering signals instead of treating them as auth failures.
    unstable_rethrow(error);
    if (error?.message?.includes("clerkMiddleware")) {
      // Expected when static assets or 404 routes bypass Clerk middleware
      return null;
    }
    console.error("[checkUser Error]:", error?.code || error?.name);
    return null;
  }
});
