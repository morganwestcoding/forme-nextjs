// components/subscription/SubscriptionSuccess.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

/**
 * Ensures the user's subscription is updated immediately after Stripe returns.
 * - If status=success & session_id is present → POST /api/subscription/confirm
 * - Idempotent on the server; safe to call once per page load.
 */
export default function SubscriptionSuccess() {
  const params = useSearchParams();
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    const status = params?.get("status");
    const sessionId = params?.get("session_id");

    if (status === "success" && sessionId) {
      ranRef.current = true;
      (async () => {
        try {
          await axios.post("/api/subscription/confirm", { sessionId });
          toast.success("Subscription activated!");
          // Force a server refetch so currentUser reflects the new tier
          router.replace("/subscription");
          router.refresh();
        } catch (e: any) {
          // If webhook already wrote, this might still be fine. We'll refresh anyway.
          console.error("Confirm error:", e?.response?.data || e?.message);
          router.replace("/subscription");
          router.refresh();
        }
      })();
    } else if (status === "cancelled") {
      toast("Checkout canceled.");
    }
  }, [params, router]);

  return null;
}
