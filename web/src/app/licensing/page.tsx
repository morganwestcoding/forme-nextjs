// app/licensing/page.tsx
import ClientOnly from "@/components/ClientOnly";
import LicensingClient from "./LicensingClient";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import Container from "@/components/Container";

export default async function LicensingPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/");
  }

  return (
    <ClientOnly>
      <Container>
        <LicensingClient currentUser={currentUser} />
      </Container>
    </ClientOnly>
  );
}