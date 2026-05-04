// app/subscription/page.tsx
import ClientOnly from "@/components/ClientOnly";
import SubscriptionClient from "./SubscriptionClient";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import dynamicImport from "next/dynamic";

export const metadata = {
  title: 'Subscription',
  description: 'Manage your ForMe plan',
  robots: { index: false, follow: false },
};

const SubscriptionSuccess = dynamicImport(
  () => import("@/components/subscription/SubscriptionSuccess"),
  { ssr: false }
);

export default async function SubscriptionPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  return (
    <ClientOnly>
      {/* This component confirms the session on return from Stripe and forces a refresh */}
      <SubscriptionSuccess />
      <SubscriptionClient currentUser={currentUser} />
    </ClientOnly>
  );
}
