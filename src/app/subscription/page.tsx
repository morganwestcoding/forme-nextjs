// app/subscription/page.tsx
import ClientOnly from "@/components/ClientOnly";
import SubscriptionClient from "./SubscriptionClient";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import Container from "@/components/Container";

export default async function SubscriptionPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <ClientOnly>
        <Container>
      <SubscriptionClient currentUser={currentUser} />
      </Container>
    </ClientOnly>
  );
}
