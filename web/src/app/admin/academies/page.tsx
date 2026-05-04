import Link from "next/link";
import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAcademies from "@/app/actions/getAcademies";
import Container from "@/components/Container";

export const metadata = {
  title: 'Academies — Admin',
  description: 'Manage partner academies',
  robots: { index: false, follow: false },
};

export default async function AdminAcademiesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) {
    redirect("/");
  }

  const academies = await getAcademies();

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link
            href="/"
            className="text-xs text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
          >
            ← Back to ForMe
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-1">Master admin</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Partner academies
          </h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
            Manage academy partners, Stripe Connect onboarding, and student pay defaults
          </p>
        </div>

        <div className="grid gap-3">
          {academies.length === 0 ? (
            <div className="text-sm text-stone-400 dark:text-stone-500 py-8 text-center">
              No academies found. Run the seed script to populate.
            </div>
          ) : (
            academies.map((a) => {
              const connected = a.stripeConnectChargesEnabled === true;
              const pending =
                !!a.stripeConnectAccountId && !a.stripeConnectChargesEnabled;
              return (
                <Link
                  key={a.id}
                  href={`/admin/academies/${a.id}`}
                  className="rounded-2xl border border-stone-200/60 bg-white dark:bg-stone-900 p-5 hover:border-stone-300 dark:border-stone-700 hover:shadow-elevation-1 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {a.name}
                      </h3>
                      {a.description && (
                        <p className="text-sm text-stone-500  dark:text-stone-500 mt-1 line-clamp-2">
                          {a.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-stone-400 dark:text-stone-500">
                        <span>{a.studentCount} students</span>
                        <span>•</span>
                        <span>{a.listingCount} listings</span>
                        {a.defaultPayType && (
                          <>
                            <span>•</span>
                            <span>
                              {a.defaultPayType === "commission"
                                ? `${a.defaultSplitPercent ?? 0}% to student`
                                : `$${a.defaultRentalAmount ?? 0} ${a.defaultRentalFrequency ?? ""} rental`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {connected && (
                        <span className="inline-flex items-center text-xs font-medium text-success-soft-foreground bg-success-soft ring-1 ring-success-soft px-2.5 py-1 rounded-full">
                          Stripe ready
                        </span>
                      )}
                      {pending && (
                        <span className="inline-flex items-center text-xs font-medium text-warning-soft-foreground bg-warning-soft ring-1 ring-warning-soft px-2.5 py-1 rounded-full">
                          Onboarding incomplete
                        </span>
                      )}
                      {!a.stripeConnectAccountId && (
                        <span className="inline-flex items-center text-xs font-medium text-stone-500  dark:text-stone-500 bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200 px-2.5 py-1 rounded-full">
                          Not connected
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
}
