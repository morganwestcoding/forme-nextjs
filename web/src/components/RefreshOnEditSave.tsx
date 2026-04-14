'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// After an edit flow saves, we set a sessionStorage flag and call
// router.back(). When the target page (Discover, listing, profile, shop)
// mounts, this component detects the flag and triggers a router.refresh()
// scoped to THAT page — which is the only thing that actually invalidates
// its client-side Router Cache entry. revalidatePath on the server handles
// the Data Cache; this handles the client cache.
//
// Using pathname as the effect dependency means we re-check on every
// client-side navigation, so the flag works regardless of which target
// page the user lands on.
export default function RefreshOnEditSave() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('editFlowJustSaved')) {
      sessionStorage.removeItem('editFlowJustSaved');
      router.refresh();
    }
  }, [pathname, router]);

  return null;
}
