import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import KitchenSinkClient from "./KitchenSinkClient";


export default async function KitchenSinkPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) {
    redirect("/");
  }

  return <KitchenSinkClient />;
}
