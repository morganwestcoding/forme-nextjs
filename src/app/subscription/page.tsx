// app/subscription/page.tsx
import ClientOnly from "@/components/ClientOnly";
import SubscriptionClient from "./SubscriptionClient";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import dynamicImport from "next/dynamic";

const SubscriptionSuccess = dynamicImport(
  () => import("@/components/subscription/SubscriptionSuccess"),
  { ssr: false }
);

export default async function SubscriptionPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/");

  return (
    <ClientOnly>
      <Container>
        {/* This component confirms the session on return from Stripe and forces a refresh */}
        <SubscriptionSuccess />
        <SubscriptionClient currentUser={currentUser} />
      </Container>
    </ClientOnly>
  );
}
