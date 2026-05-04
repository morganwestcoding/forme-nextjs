import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";
import ReservationsClient from "./ReservationsClient";


export default async function ReservationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/');

  return <ReservationsClient currentUser={currentUser} />;
}
