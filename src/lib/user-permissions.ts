import { Session } from "next-auth";
import { isAdminEmail } from "./auth";

// Plan limits
export const PLAN_LIMITS = {
  free: {
    minutesPerMonth: 30,
    maxQuality: "720p",
    hasWatermark: true,
    priorityProcessing: false,
  },
  creator: {
    minutesPerMonth: 150,
    maxQuality: "1080p",
    hasWatermark: false,
    priorityProcessing: true,
  },
  pro: {
    minutesPerMonth: 500,
    maxQuality: "4k",
    hasWatermark: false,
    priorityProcessing: true,
  },
  agency: {
    minutesPerMonth: 2000,
    maxQuality: "4k",
    hasWatermark: false,
    priorityProcessing: true,
  },
  admin: {
    minutesPerMonth: Infinity,
    maxQuality: "4k",
    hasWatermark: false,
    priorityProcessing: true,
  },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

export interface UserPermissions {
  isAdmin: boolean;
  plan: PlanId;
  minutesPerMonth: number;
  minutesUsed: number;
  minutesRemaining: number;
  hasWatermark: boolean;
  maxQuality: string;
  priorityProcessing: boolean;
  canCreateClip: boolean;
  isUnlimited: boolean;
}

/**
 * Get user permissions based on their session and plan
 * Admins get unlimited clips without watermark
 */
export function getUserPermissions(
  session: Session | null,
  userPlan: PlanId = "free",
  minutesUsed: number = 0
): UserPermissions {
  const email = session?.user?.email;
  const isAdmin = isAdminEmail(email);

  // Admins get full unlimited access
  if (isAdmin) {
    return {
      isAdmin: true,
      plan: "admin",
      minutesPerMonth: Infinity,
      minutesUsed: 0,
      minutesRemaining: Infinity,
      hasWatermark: false,
      maxQuality: "4k",
      priorityProcessing: true,
      canCreateClip: true,
      isUnlimited: true,
    };
  }

  const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const minutesRemaining = Math.max(0, planLimits.minutesPerMonth - minutesUsed);

  return {
    isAdmin: false,
    plan: userPlan,
    minutesPerMonth: planLimits.minutesPerMonth,
    minutesUsed,
    minutesRemaining,
    hasWatermark: planLimits.hasWatermark,
    maxQuality: planLimits.maxQuality,
    priorityProcessing: planLimits.priorityProcessing,
    canCreateClip: minutesRemaining > 0,
    isUnlimited: false,
  };
}

/**
 * Check if user can process a video of given duration
 */
export function canProcessVideo(
  permissions: UserPermissions,
  videoDurationMinutes: number
): { allowed: boolean; reason?: string } {
  if (permissions.isUnlimited) {
    return { allowed: true };
  }

  if (videoDurationMinutes > permissions.minutesRemaining) {
    return {
      allowed: false,
      reason: `Video is ${videoDurationMinutes} minutes but you only have ${permissions.minutesRemaining} minutes remaining this month.`,
    };
  }

  return { allowed: true };
}

/**
 * Get the watermark setting for a clip export
 */
export function shouldAddWatermark(permissions: UserPermissions): boolean {
  return permissions.hasWatermark;
}
