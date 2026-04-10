"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Link01Icon,
  StarIcon,
  ShieldUserIcon,
  Certificate01Icon,
} from "hugeicons-react";
import { Plus } from "lucide-react";
import { SafeUser } from "@/app/types";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { useAcademies } from "@/app/hooks/useAcademies";

interface LicensingClientProps {
  currentUser: SafeUser | null;
}

const LicensingClient = ({ currentUser }: LicensingClientProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'training'>('upload');
  const [licensingImage, setLicensingImage] = useState(currentUser?.licensingImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState<string>('');
  const { academies: partnerAcademies, isLoading: academiesLoading, error: academiesError } = useAcademies();

  const verificationStatus = currentUser?.verificationStatus || 'none';
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') return new URLSearchParams(window.location.search);
    return new URLSearchParams();
  });
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const handleSave = async () => {
    if (!licensingImage) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Documents submitted for verification!');
      if (isOnboarding) router.push('/subscription?onboarding=true');
    }, 1500);
  };

  const handleSkip = () => {
    if (isOnboarding) router.push('/subscription?onboarding=true');
    else if (currentUser?.id) router.push(`/profile/${currentUser.id}`);
    else router.push('/');
  };

  return (
    <Container>
      <PageHeader currentUser={currentUser} currentPage="Licensing" />

      <div className="mt-8">
        {/* Header */}
        <div className="mb-8">
          {isOnboarding && <p className="text-[12px] text-stone-400 mb-2">Step 1 of 2</p>}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Licensing &amp; Verification</h1>
              <p className="text-[14px] text-stone-400 mt-1">Prove your expertise, win more clients</p>
            </div>
            {verificationStatus !== 'none' && (
              <div className="flex-shrink-0">
                {verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <CheckmarkCircle02Icon size={14} strokeWidth={1.5} /> Verified
                  </span>
                )}
                {verificationStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                    <Clock01Icon size={14} strokeWidth={1.5} /> Pending
                  </span>
                )}
                {verificationStatus === 'rejected' && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                    <CheckmarkCircle02Icon size={14} strokeWidth={1.5} /> Failed
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap border ${
              activeTab === 'upload'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border-stone-200/60'
            }`}
          >
            I Have a License
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap border ${
              activeTab === 'training'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border-stone-200/60'
            }`}
          >
            Need Training
          </button>
        </div>

        {/* ─── Upload Tab ─── */}
        {activeTab === 'upload' && (
          <div>
            {/* Hero upload card — full width, two halves */}
            <div className="rounded-2xl border border-stone-200/60 bg-white overflow-hidden mb-6">
              <div className="flex flex-col md:flex-row">
                {/* Left half — upload zone */}
                <div className="md:w-[240px] flex-shrink-0 border-b md:border-b-0 md:border-r border-stone-100">
                  <div className="h-[200px] p-5">
                    {licensingImage ? (
                      <div className="w-full h-full rounded-xl bg-stone-900 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-stone-800" onClick={() => setLicensingImage('')}>
                        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center mb-2">
                          <Certificate01Icon size={22} color="#fff" strokeWidth={1.5} />
                        </div>
                        <p className="text-[13px] font-medium text-white">Ready</p>
                        <p className="text-[11px] text-stone-500 group-hover:text-stone-400 transition-colors mt-0.5">Click to replace</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLicensingImage('mock-image-url')}
                        className="group w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 text-center hover:border-gray-900 hover:bg-gray-100 transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm group-hover:border-gray-300 transition-all">
                          <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                        <span className="text-[13px] font-medium text-gray-600">Add file</span>
                        <span className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right half — context + actions */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-[15px] font-semibold text-stone-900 tracking-tight mb-1.5">Upload your credentials</h2>
                    <p className="text-[13px] text-stone-400 leading-relaxed mb-4">
                      We accept professional licenses, industry certifications, educational diplomas, and insurance certificates. All documents are encrypted.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {['State licenses', 'Certifications', 'Diplomas', 'Insurance'].map((tag) => (
                        <span key={tag} className="text-[11px] text-stone-500 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isLoading || !licensingImage}
                      className="py-2.5 px-5 bg-stone-900 text-white rounded-xl font-medium text-[13px] hover:bg-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                      style={!isLoading && licensingImage ? { boxShadow: '0 2px 8px rgba(0,0,0,0.12)' } : undefined}
                    >
                      {isLoading ? 'Submitting...' : 'Submit for Verification'}
                      {!isLoading && <ArrowRight01Icon size={14} strokeWidth={1.5} />}
                    </button>
                    <button
                      onClick={handleSkip}
                      className="py-2.5 px-4 text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {isOnboarding ? "Skip" : "Back"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* How it works — preserved */}
            <div className="rounded-2xl border border-stone-200/60 bg-white p-6 mb-6">
              <h3 className="text-[12px] text-stone-400 mb-4">How it works</h3>
              <div className="flex items-start">
                {[
                  { num: '01', title: 'Upload', desc: 'Add your license or certification' },
                  { num: '02', title: 'Review', desc: 'Our team verifies in 24-48h' },
                  { num: '03', title: 'Verified', desc: 'Badge appears on your profile' },
                ].map((step, idx) => (
                  <div key={step.num} className="flex-1 flex items-start gap-3">
                    {idx > 0 && <div className="w-px h-10 bg-stone-100 flex-shrink-0 -ml-px mr-3" />}
                    <div>
                      <p className="text-[18px] font-bold text-stone-200 leading-none mb-1.5">{step.num}</p>
                      <p className="text-[13px] font-medium text-stone-900 mb-0.5">{step.title}</p>
                      <p className="text-[11px] text-stone-400 leading-snug">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy footer */}
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <ShieldUserIcon size={12} color="#a8a29e" strokeWidth={1.5} />
              Documents are encrypted and never shared publicly.
            </div>
          </div>
        )}

        {/* ─── Training Tab ─── */}
        {activeTab === 'training' && (
          <div>
            {/* Intro */}
            <div className="mb-8">
              <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight mb-2">Choose from our handpicked academies</h2>
              <p className="text-[13px] text-stone-400 leading-relaxed max-w-xl">
                Start training with an accredited partner while building your client base on ForMe as an apprentice. Complete your program, get verified instantly, and transition straight into a full professional account.
              </p>
            </div>

            {/* Programs grid — 2 col */}
            {academiesLoading ? (
              <div className="text-[13px] text-stone-400 py-8">Loading academies…</div>
            ) : academiesError ? (
              <div className="text-[13px] text-red-500 py-8">Could not load academies. {academiesError}</div>
            ) : partnerAcademies.length === 0 ? (
              <div className="text-[13px] text-stone-400 py-8">No partner academies available yet.</div>
            ) : (
            <div className="grid md:grid-cols-2 gap-5 pb-8">
              {partnerAcademies.map((academy) => {
                const isSelected = selectedAcademy === academy.id;
                return (
                  <div
                    key={academy.id}
                    onClick={() => setSelectedAcademy(isSelected ? '' : academy.id)}
                    className={`group relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 border-stone-800 shadow-xl'
                        : 'bg-white border-stone-200/60 hover:border-stone-300 hover:-translate-y-0.5 hover:shadow-lg'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-stone-700 text-white px-4 py-1 rounded-full text-[10px] font-medium tracking-wide">Selected</span>
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="text-[12px] text-stone-400 mb-3">{academy.name}</h3>
                      {academy.priceLabel && (
                        <div className="mb-1">
                          <span className={`text-[32px] font-bold tracking-tight ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                            {academy.priceLabel}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-[12px] text-stone-400">
                        {academy.duration && (
                          <span className="flex items-center gap-1">
                            <Clock01Icon size={12} strokeWidth={1.5} />
                            {academy.duration}
                          </span>
                        )}
                        {academy.rating != null && (
                          <span className="flex items-center gap-1">
                            <StarIcon size={12} strokeWidth={1.5} />
                            {academy.rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {academy.description && (
                      <p className={`text-[13px] mb-5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {academy.description}
                      </p>
                    )}

                    {/* Courses */}
                    <ul className="space-y-2.5 mb-6">
                      {academy.courses.map((course, i) => (
                        <li key={i} className={`flex items-start text-[13px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          <CheckmarkCircle02Icon size={14} color="#a8a29e" className="mr-2.5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          {course}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={(e) => { e.stopPropagation(); if (academy.website) window.open(academy.website, '_blank'); }}
                      className={`w-full py-3 px-5 rounded-xl font-medium text-[13px] transition-all duration-200 flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-white text-stone-900 hover:bg-stone-50'
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    >
                      View Program <ArrowRight01Icon size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
            )}

            {/* Trust bar */}
            <div className="pt-8 border-t border-stone-100">
              <div className="flex items-center gap-6 text-[12px] text-stone-400">
                <span className="flex items-center gap-1.5">
                  <CheckmarkCircle02Icon size={13} color="#a8a29e" strokeWidth={1.5} />
                  Accredited partners
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckmarkCircle02Icon size={13} color="#a8a29e" strokeWidth={1.5} />
                  Instant verification on completion
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckmarkCircle02Icon size={13} color="#a8a29e" strokeWidth={1.5} />
                  Member discounts available
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default LicensingClient;
