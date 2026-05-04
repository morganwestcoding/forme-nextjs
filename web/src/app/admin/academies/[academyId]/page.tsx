import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { getAcademyById } from "@/app/actions/getAcademies";
import Container from "@/components/Container";
import AcademyDetailClient from "./AcademyDetailClient";


interface PageProps {
  params: { academyId: string };
  searchParams: { stripe_connect?: string };
}

export default async function AdminAcademyDetailPage({ params, searchParams }: PageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) {
    redirect("/");
  }

  const academy = await getAcademyById(params.academyId);

  if (!academy) {
    notFound();
  }

  const stripeReturnedSuccess = searchParams.stripe_connect === "success";

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link
            href="/admin/academies"
            className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← All academies
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            {academy.name}
          </h1>
          {academy.description && (
            <p className="text-[14px] text-stone-400 mt-1">{academy.description}</p>
          )}
        </div>

        <AcademyDetailClient academy={academy} stripeReturnedSuccess={stripeReturnedSuccess} />
      </div>
    </Container>
  );
}
