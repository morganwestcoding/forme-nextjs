// app/settings/page.tsx
import ClientOnly from "@/components/ClientOnly";
import SettingsClient from "./SettingsClient";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Settings',
  description: 'Account, notifications and preferences',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <ClientOnly>
      <SettingsClient currentUser={currentUser} />
    </ClientOnly>
  );
}
