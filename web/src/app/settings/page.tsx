// app/settings/page.tsx
import ClientOnly from "@/components/ClientOnly";
import SettingsClient from "./SettingsClient";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import prisma from "@/app/libs/prismadb";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  // Check if user is an employee (can receive payments)
  const employeeRecord = await prisma.employee.findFirst({
    where: { userId: currentUser.id, isActive: true },
  });

  const isEmployee = !!employeeRecord;

  return (
    <ClientOnly>
      <Container>
        <SettingsClient currentUser={currentUser} isEmployee={isEmployee} />
      </Container>
    </ClientOnly>
  );
}
