"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { categories as canonicalCategories } from "@/components/Categories";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  joinedAt: string;
}

interface AcademyService {
  id: string;
  serviceName: string;
  price: number;
  category: string;
}

interface AcademyDetail {
  id: string;
  name: string;
  description: string | null;
  contactEmail: string | null;
  defaultPayType: string | null;
  defaultSplitPercent: number | null;
  defaultRentalAmount: number | null;
  defaultRentalFrequency: string | null;
  stripeConnectAccountId: string | null;
  stripeConnectOnboardingComplete: boolean;
  stripeConnectChargesEnabled: boolean;
  stripeConnectPayoutsEnabled: boolean;
  studentCount: number;
  students: Student[];
  services: AcademyService[];
}

interface Props {
  academy: AcademyDetail;
  stripeReturnedSuccess: boolean;
}

const CATEGORY_LABELS = canonicalCategories.map((c) => c.label);

export default function AcademyDetailClient({ academy, stripeReturnedSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  // Services state — kept locally so add/edit/delete reflect without a page reload.
  const [services, setServices] = useState<AcademyService[]>(academy.services);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceCategory, setServiceCategory] = useState(CATEGORY_LABELS[0] ?? "");
  const [serviceSaving, setServiceSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setServiceName("");
    setServicePrice("");
    setServiceCategory(CATEGORY_LABELS[0] ?? "");
  };

  const startAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  const startEdit = (svc: AcademyService) => {
    setEditingId(svc.id);
    setShowAddForm(false);
    setServiceName(svc.serviceName);
    setServicePrice(String(svc.price));
    setServiceCategory(svc.category);
  };

  const saveService = async () => {
    const priceNum = Number(servicePrice);
    if (!serviceName.trim() || !serviceCategory.trim() || Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Name, valid price, and category are required");
      return;
    }
    setServiceSaving(true);
    try {
      if (editingId) {
        const res = await axios.patch(
          `/api/academies/${academy.id}/services/${editingId}`,
          { serviceName: serviceName.trim(), price: priceNum, category: serviceCategory }
        );
        setServices((prev) =>
          prev
            .map((s) => (s.id === editingId ? res.data : s))
            .sort((a, b) => a.serviceName.localeCompare(b.serviceName))
        );
        toast.success("Service updated");
      } else {
        const res = await axios.post(
          `/api/academies/${academy.id}/services`,
          { serviceName: serviceName.trim(), price: priceNum, category: serviceCategory }
        );
        setServices((prev) =>
          [...prev, res.data].sort((a, b) => a.serviceName.localeCompare(b.serviceName))
        );
        toast.success("Service added");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save service");
    } finally {
      setServiceSaving(false);
    }
  };

  const deleteService = async (svc: AcademyService) => {
    if (!confirm(`Delete "${svc.serviceName}"? This removes it from all enrolled students.`)) return;
    try {
      await axios.delete(`/api/academies/${academy.id}/services/${svc.id}`);
      setServices((prev) => prev.filter((s) => s.id !== svc.id));
      toast.success("Service deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete service");
    }
  };

  const handleOnboard = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`/api/academies/${academy.id}/stripe-connect/onboard`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to start onboarding");
        setIsLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to start onboarding");
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      await axios.get(`/api/academies/${academy.id}/stripe-connect/status`);
      window.location.reload();
    } catch (err: any) {
      toast.error("Failed to refresh status");
    }
  };

  const connected = academy.stripeConnectChargesEnabled === true;
  const pending = !!academy.stripeConnectAccountId && !connected;

  return (
    <>
      {stripeReturnedSuccess && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] text-emerald-800">
          Returned from Stripe. Click &quot;Refresh status&quot; below to sync the latest onboarding state.
        </div>
      )}

      {/* Stripe Connect card */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100">Stripe Connect</h2>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-1">
              The academy&apos;s Connect account receives all student bookings.
            </p>
          </div>
          {connected && (
            <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-1 rounded-full">
              Ready
            </span>
          )}
          {pending && (
            <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 ring-1 ring-amber-200 px-2.5 py-1 rounded-full">
              Onboarding incomplete
            </span>
          )}
          {!academy.stripeConnectAccountId && (
            <span className="inline-flex items-center text-[11px] font-medium text-stone-500 dark:text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200 px-2.5 py-1 rounded-full">
              Not connected
            </span>
          )}
        </div>

        {academy.stripeConnectAccountId && (
          <p className="text-[12px] text-stone-400 dark:text-stone-500 font-mono mb-4">
            {academy.stripeConnectAccountId}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleOnboard}
            loading={isLoading}
          >
            {isLoading
              ? "Loading…"
              : academy.stripeConnectAccountId
              ? "Continue onboarding"
              : "Onboard with Stripe"}
          </Button>
          {academy.stripeConnectAccountId && (
            <button
              type="button"
              onClick={refreshStatus}
              className="py-2.5 px-4 text-[13px] text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
            >
              Refresh status
            </button>
          )}
        </div>

        {connected && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${academy.stripeConnectChargesEnabled ? "bg-emerald-500" : "bg-stone-300"}`} />
              <span className="text-stone-500 dark:text-stone-400 dark:text-stone-500">Charges enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${academy.stripeConnectPayoutsEnabled ? "bg-emerald-500" : "bg-stone-300"}`} />
              <span className="text-stone-500 dark:text-stone-400 dark:text-stone-500">Payouts enabled</span>
            </div>
          </div>
        )}
      </Card>

      {/* Default pay split card */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 mb-1">Default student pay split</h2>
        <p className="text-[13px] text-stone-400 dark:text-stone-500 mb-4">
          Applied to new students at registration. Existing students keep their current PayAgreement.
        </p>

        {academy.defaultPayType === "commission" ? (
          <p className="text-[14px] text-stone-700 dark:text-stone-200">
            Students earn <span className="font-semibold">{academy.defaultSplitPercent ?? 0}%</span> commission
            <span className="text-stone-400 dark:text-stone-500"> · academy keeps the rest</span>
          </p>
        ) : academy.defaultPayType === "chair_rental" ? (
          <p className="text-[14px] text-stone-700 dark:text-stone-200">
            ${academy.defaultRentalAmount ?? 0}{" "}
            <span className="text-stone-400 dark:text-stone-500">per {academy.defaultRentalFrequency ?? "period"}</span>
          </p>
        ) : (
          <p className="text-[14px] text-stone-400 dark:text-stone-500">No default configured (students default to 0% commission)</p>
        )}

        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-4">
          Editing the default still requires a script — UI editing comes in Phase 7b.
        </p>
      </Card>

      {/* Services card */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100">
              Services <span className="text-stone-400 dark:text-stone-500 font-normal">· {services.length}</span>
            </h2>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-1">
              Every active student at this academy automatically inherits these services.
            </p>
          </div>
          {!showAddForm && !editingId && (
            <Button type="button" onClick={startAdd} className="flex-shrink-0">
              Add service
            </Button>
          )}
        </div>

        {(showAddForm || editingId) && (
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] text-stone-500 dark:text-stone-400 dark:text-stone-500 mb-1">Service name</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Haircut"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 dark:text-stone-400 dark:text-stone-500 mb-1">Price (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] text-stone-500 dark:text-stone-400 dark:text-stone-500 mb-1">Category</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 focus:outline-none focus:border-stone-400"
                >
                  {CATEGORY_LABELS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={saveService} loading={serviceSaving} size="sm">
                {serviceSaving ? "Saving…" : editingId ? "Save changes" : "Add"}
              </Button>
              <button
                type="button"
                onClick={resetForm}
                className="py-2 px-4 text-[13px] text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {services.length === 0 && !showAddForm ? (
          <p className="text-[13px] text-stone-400 dark:text-stone-500">No services yet. Add the first one above.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-900 dark:text-stone-100 truncate">{svc.serviceName}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate">{svc.category}</p>
                </div>
                <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100 tabular-nums flex-shrink-0">
                  ${svc.price}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(svc)}
                    className="text-[12px] text-stone-500 dark:text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 px-2 py-1 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteService(svc)}
                    className="text-[12px] text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Students list */}
      <Card padding="lg">
        <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 mb-1">
          Enrolled students <span className="text-stone-400 dark:text-stone-500 font-normal">· {academy.studentCount}</span>
        </h2>

        {academy.students.length === 0 ? (
          <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-4">No students enrolled yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-stone-100">
            {academy.students.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden flex-shrink-0">
                  {s.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={s.name ?? "Student"} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-900 dark:text-stone-100 truncate">{s.name ?? "Unnamed"}</p>
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate">{s.email}</p>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 flex-shrink-0">
                  Joined {new Date(s.joinedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
