'use client';

import { useEffect, useState } from 'react';
import Container from "@/components/Container";
import ShopHead from "@/components/shop/ShopHead";
import EmptyState from "@/components/EmptyState";
import { SafeProduct, SafeShop, SafeUser, SafePost } from "@/app/types";

const SK = "rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60";

interface ShopData {
  shop: SafeShop & {
    user: SafeUser;
    products: SafeProduct[];
    employees?: any[];
    storeHours?: any[];
  };
  relatedShops: SafeShop[];
}

interface ShopClientProps {
  shopId?: string;
  currentUser?: SafeUser | null;
}

const ShopClient: React.FC<ShopClientProps> = ({ shopId, currentUser }) => {
  const [data, setData] = useState<ShopData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shopId) return;

    let cancelled = false;

    Promise.all([
      fetch(`/api/shops/${shopId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/shops`).then(r => r.ok ? r.json() : []),
    ]).then(([shop, allShops]) => {
      if (cancelled) return;
      if (!shop) { setNotFound(true); return; }
      const relatedShops = (allShops || [])
        .filter((s: any) => s.id !== shop.id && s.category === shop.category)
        .slice(0, 10);
      setData({ shop, relatedShops });
    }).catch(() => { if (!cancelled) setNotFound(true); });

    return () => { cancelled = true; };
  }, [shopId]);

  if (notFound) {
    return (
      <EmptyState
        title="Shop not found"
        subtitle="This shop does not exist or was removed."
      />
    );
  }

  if (!data) {
    return (
      <Container>
        <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8 md:h-[calc(100vh-2rem)] md:overflow-hidden">
          {/* ===== LEFT COLUMN - Shop Card ===== */}
          <div className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
            <div className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900">
              {/* Hero */}
              <div className="relative pt-8 pb-5 px-6 text-center">
                <div className={`absolute top-3 left-3 h-8 w-8 rounded-full ${SK}`} />
                <div className={`absolute top-3 right-3 h-8 w-8 rounded-full ${SK}`} />
                <div className={`h-24 w-24 mx-auto rounded-2xl ${SK}`} />
                <div className="mt-3 flex flex-col items-center">
                  <div className={`h-5 w-40 mb-2 ${SK}`} />
                  <div className={`h-3 w-32 mb-2 ${SK}`} />
                  <div className={`h-3 w-48 ${SK}`} />
                </div>
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-3.5 w-3.5 ${SK}`} />
                  ))}
                  <div className={`h-3 w-6 ml-1.5 ${SK}`} />
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between text-center">
                  <div className="flex-1 flex flex-col items-center">
                    <div className={`h-5 w-8 mb-1 ${SK}`} />
                    <div className={`h-2.5 w-14 ${SK}`} />
                  </div>
                  <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                  <div className="flex-1 flex flex-col items-center">
                    <div className={`h-5 w-8 mb-1 ${SK}`} />
                    <div className={`h-2.5 w-14 ${SK}`} />
                  </div>
                  <div className="w-px h-10 bg-stone-100 dark:bg-stone-800" />
                  <div className="flex-1 flex flex-col items-center">
                    <div className={`h-5 w-8 mb-1 ${SK}`} />
                    <div className={`h-2.5 w-10 ${SK}`} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-6 py-5">
                <div className={`h-3 w-full mb-2 ${SK}`} />
                <div className={`h-3 w-full mb-2 ${SK}`} />
                <div className={`h-3 w-full mb-2 ${SK}`} />
                <div className={`h-3 w-2/3 ${SK}`} />
                {/* Heart + Share */}
                <div className="flex items-center justify-center gap-4 mt-6 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-4 w-4 rounded-sm ${SK}`} />
                    <div className={`h-3 w-8 ${SK}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`h-4 w-4 rounded-sm ${SK}`} />
                    <div className={`h-3 w-10 ${SK}`} />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-5">
                <div className="flex gap-2.5">
                  <div className={`flex-1 h-12 rounded-xl ${SK}`} />
                  <div className={`flex-1 h-12 rounded-xl ${SK}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="flex-1 min-w-0 md:overflow-y-auto md:py-14">
            {/* Mobile header */}
            <div className="md:hidden mb-6">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 shrink-0 rounded-xl ${SK}`} />
                <div className="flex-1 min-w-0">
                  <div className={`h-5 w-40 mb-1.5 ${SK}`} />
                  <div className={`h-3 w-28 ${SK}`} />
                </div>
                <div className={`h-8 w-8 rounded-full ${SK}`} />
              </div>
            </div>

            <div className="space-y-12">
              {/* Products — grid-cols-2 sm:3 lg:5 gap-0.5 rounded-xl, ProductCard aspect-[5/6] */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-24 ${SK}`} />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 overflow-hidden rounded-xl">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse"
                      style={{ aspectRatio: '5 / 6', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)' }}
                    />
                  ))}
                </div>
              </section>

              {/* Professionals — WorkerCard solidBackground compact with avatar */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-36 ${SK}`} />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative group rounded-2xl overflow-visible">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
                      <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 pointer-events-none" />
                      <div className="relative z-10 h-[180px]">
                        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
                          <div className="absolute -right-2 -top-4 h-20 w-16 rounded animate-pulse bg-stone-100/60 dark:bg-stone-800/40" />
                          <div className="relative flex flex-col h-full p-5">
                            <div className="mb-3">
                              <div className="w-12 h-12 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            </div>
                            <div className={`h-4 w-3/4 ${SK}`} style={{ marginBottom: '6px' }} />
                            <div className={`h-2.5 w-20 ${SK}`} />
                            <div className="flex-1" />
                            <div className="flex items-end justify-between">
                              <div className={`h-7 w-10 ${SK}`} />
                              <div className={`h-5 w-5 ${SK} mb-1`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Gallery — mix of aspect-square images + aspect-[5/6] PostCards */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-20 ${SK}`} />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`img-${i}`} className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse aspect-square" />
                  ))}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`post-${i}`}
                      className="overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse"
                      style={{ aspectRatio: '5 / 6', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)' }}
                    />
                  ))}
                </div>
              </section>

              {/* Hours — 7 day-blocks */}
              <section>
                <div className="flex items-center gap-4 mb-5">
                  <div className={`h-6 w-16 ${SK}`} />
                </div>
                <div className="max-w-[480px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-4 w-36 ${SK}`} />
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center py-3 rounded-xl bg-stone-50 dark:bg-stone-900 gap-1"
                      >
                        <div className={`h-2.5 w-7 ${SK}`} />
                        <div className={`h-2 w-8 ${SK}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const { shop, relatedShops } = data;

  return (
    <Container>
      <ShopHead
        key={`${shop.id}-${(shop as any).coverImage}-${((shop as any).galleryImages || []).join('|')}`}
        shop={shop}
        currentUser={currentUser}
        Products={shop.products}
        posts={[]}
        categories={[]}
      />
    </Container>
  );
};

export default ShopClient;
