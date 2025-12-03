"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  SchoolIcon,
  Link01Icon,
  BookOpen02Icon,
  StarIcon,
  Upload01Icon,
  ShieldUserIcon,
  TimeScheduleIcon
} from "hugeicons-react";
import { SafeUser } from "@/app/types";

interface LicensingClientProps {
  currentUser: SafeUser | null;
}

// Mock data for partner academies
const partnerAcademies = [
  {
    id: '1',
    name: 'Beauty Pro Academy',
    description: 'Licensed cosmetology and esthetician programs',
    courses: ['Cosmetology License', 'Esthetician Certification', 'Nail Technician'],
    duration: '6-12 months',
    price: 'From $3,500',
    rating: 4.8,
    verified: true
  },
  {
    id: '2',
    name: 'Wellness Institute',
    description: 'Massage therapy and holistic wellness certifications',
    courses: ['Licensed Massage Therapist', 'Reiki Master', 'Aromatherapy'],
    duration: '3-9 months',
    price: 'From $2,800',
    rating: 4.9,
    verified: true
  },
  {
    id: '3',
    name: 'Fitness Certification Hub',
    description: 'Personal training and fitness specialist programs',
    courses: ['CPT Certification', 'Nutrition Coach', 'Yoga Instructor'],
    duration: '2-6 months',
    price: 'From $1,200',
    rating: 4.7,
    verified: true
  },
  {
    id: '4',
    name: 'Medical Aesthetics School',
    description: 'Advanced aesthetic and medical spa training',
    courses: ['Laser Technician', 'Microblading', 'Botox Certification'],
    duration: '1-4 months',
    price: 'From $1,800',
    rating: 4.9,
    verified: true
  }
];

const LicensingClient = ({ currentUser }: LicensingClientProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'training'>('upload');
  const [licensingImage, setLicensingImage] = useState(currentUser?.licensingImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState<string>('');

  const verificationStatus = currentUser?.verificationStatus || 'none';
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const handleSave = async () => {
    if (!licensingImage) {
      alert('Please upload a document first');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Documents submitted for verification!');

      // If onboarding, redirect to subscription page
      if (isOnboarding) {
        router.push('/subscription?onboarding=true');
      }
    }, 1500);
  };

  const handleBackToProfile = () => {
    if (isOnboarding) {
      // If onboarding, skip to subscription
      router.push('/subscription?onboarding=true');
    } else if (currentUser?.id) {
      router.push(`/profile/${currentUser.id}`);
    } else {
      router.push('/');
    }
  };

  const handleViewProgramDetails = () => {
    // Open program details in new tab or modal
    window.open('https://example.com/program-details', '_blank');
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <CheckmarkCircle02Icon size={16} />
            <span className="font-medium text-sm">Verified Professional</span>
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200">
            <Clock01Icon size={16} />
            <span className="font-medium text-sm">Verification Pending</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200">
            <CheckmarkCircle02Icon size={16} />
            <span className="font-medium text-sm">Verification Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 pt-16 pb-16">
          <div className="text-center max-w-2xl mx-auto">
            {isOnboarding && (
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-6">Step 1 of 2</p>
            )}
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-4">
              Professional Verification
            </h1>
            <p className="text-base text-gray-500 mb-8">
              Build trust with clients by verifying your credentials
            </p>
            {getStatusBadge()}
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mt-12">
            <div className="relative inline-flex items-center bg-gray-50 rounded-lg p-1 gap-1">
              <div
                className={`absolute top-1 bottom-1 bg-gray-900 rounded-md transition-all duration-300 ease-out ${
                  activeTab === 'upload' ? 'left-1' : 'left-[calc(50%)]'
                }`}
                style={{
                  width: 'calc(50% - 4px)',
                }}
              />

              <button
                onClick={() => setActiveTab('upload')}
                className={`relative z-10 px-12 py-2.5 text-sm font-medium transition-colors duration-200 flex items-center gap-2 rounded-md ${
                  activeTab === 'upload'
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Upload01Icon size={16} strokeWidth={2} color={activeTab === 'upload' ? 'white' : 'currentColor'} />
                I Have a License
              </button>
              <button
                onClick={() => setActiveTab('training')}
                className={`relative z-10 px-12 py-2.5 text-sm font-medium transition-colors duration-200 flex items-center gap-2 rounded-md ${
                  activeTab === 'training'
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <SchoolIcon size={16} strokeWidth={2} color={activeTab === 'training' ? 'white' : 'currentColor'} />
                Need Training
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
          {/* Status Messages */}
          {verificationStatus === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4 mb-8">
              <Clock01Icon size={20} color="#a16207" className="mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1 text-sm">
                  Your documents are being reviewed
                </h3>
                <p className="text-[13px] text-yellow-700">
                  Our verification team is reviewing your credentials. You&apos;ll receive an email notification within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4 mb-8">
              <CheckmarkCircle02Icon size={20} color="#15803d" className="mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1 text-sm">
                  You&apos;re verified!
                </h3>
                <p className="text-[13px] text-green-700">
                  Your credentials have been verified. The verified badge now appears on your profile.
                </p>
              </div>
            </div>
          )}

          {verificationStatus === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4 mb-8">
              <CheckmarkCircle02Icon size={20} color="#b91c1c" className="mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1 text-sm">
                  Verification was not approved
                </h3>
                <p className="text-[13px] text-red-700">
                  Your submitted documents could not be verified. Please upload different credentials or contact support.
                </p>
              </div>
            </div>
          )}

          {/* Benefits Grid - Matching subscription card style */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
              <div className="mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                  Build Trust
                </h3>
                <div className="mb-4">
                  <ShieldUserIcon size={26} color="#6b7280" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-gray-600">
                  Verified badge increases booking rates by 3x
                </p>
              </div>
            </div>

            <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
              <div className="mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                  Stand Out
                </h3>
                <div className="mb-4">
                  <StarIcon size={26} color="#6b7280" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-gray-600">
                  Appear higher in search results and recommendations
                </p>
              </div>
            </div>

            <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
              <div className="mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                  Fast Process
                </h3>
                <div className="mb-4">
                  <TimeScheduleIcon size={26} color="#6b7280" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-gray-600">
                  Reviewed within 24-48 hours of submission
                </p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 tracking-tight">
              Upload Your Credentials
            </h2>
            <p className="text-[13px] text-gray-500 mb-8">
              Upload professional licenses, certifications, diplomas, or any official document that verifies your expertise
            </p>

            {/* Image Upload Placeholder */}
            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all mb-8 ${
              licensingImage
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
            }`}>
              {licensingImage ? (
                <div className="space-y-4">
                  <CheckmarkCircle02Icon size={48} color="#60A5FA" className="mx-auto" strokeWidth={2} />
                  <p className="text-gray-900 font-semibold">Document uploaded successfully</p>
                  <button
                    onClick={() => setLicensingImage('')}
                    className="text-[13px] text-gray-600 hover:text-gray-900 underline font-medium"
                  >
                    Upload different document
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload01Icon size={48} color="#9ca3af" className="mx-auto" strokeWidth={2} />
                  <div>
                    <p className="text-gray-900 font-semibold mb-1">Click to upload or drag and drop</p>
                    <p className="text-[13px] text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <button
                    onClick={() => setLicensingImage('mock-image-url')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg text-[13px] font-semibold tracking-tight hover:bg-black transition-all"
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm tracking-tight">
                  <BookOpen02Icon size={16} color="#60A5FA" strokeWidth={2} />
                  Acceptable Documents
                </h3>
                <ul className="text-[13px] text-gray-600 space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <CheckmarkCircle02Icon size={14} color="#60A5FA" className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    Professional licenses (state or national)
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckmarkCircle02Icon size={14} color="#60A5FA" className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    Industry certifications
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckmarkCircle02Icon size={14} color="#60A5FA" className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    Educational diplomas or degrees
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckmarkCircle02Icon size={14} color="#60A5FA" className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    Liability insurance certificates
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm tracking-tight">
                  <Clock01Icon size={16} color="#60A5FA" strokeWidth={2} />
                  Verification Timeline
                </h3>
                <div className="text-[13px] text-gray-600 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#60A5FA] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">1</div>
                    <div>
                      <p className="font-semibold text-gray-900">Upload documents</p>
                      <p className="text-xs text-gray-500">Less than 1 minute</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#60A5FA] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">2</div>
                    <div>
                      <p className="font-semibold text-gray-900">Team review</p>
                      <p className="text-xs text-gray-500">24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#60A5FA] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">3</div>
                    <div>
                      <p className="font-semibold text-gray-900">Get verified!</p>
                      <p className="text-xs text-gray-500">Email notification sent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBackToProfile}
              disabled={isLoading}
              className="flex-1 py-3 px-6 border border-gray-200 rounded-xl font-semibold text-[13px] tracking-tight text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              {isOnboarding ? "I'll do this later" : "Back to Profile"}
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading || !licensingImage}
              className="flex-1 py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold text-[13px] tracking-tight hover:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                "Uploading..."
              ) : (
                <>
                  {verificationStatus === 'none' ? 'Submit for Verification' : 'Update Documents'}
                  <ArrowRight01Icon size={14} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
          {/* Hero Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-200">
                <SchoolIcon size={20} color="#60A5FA" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 tracking-tight text-gray-900">Get Verified Through Our Trusted Partners</h2>
                <p className="text-gray-600 mb-4 text-[13px]">
                  Don&apos;t have a license? No problem! Partner with accredited institutions to get certified and verified on our platform.
                </p>
                <div className="flex flex-wrap gap-2 text-[13px]">
                  <div className="flex items-center gap-2 bg-white border border-blue-200 text-gray-700 px-3 py-1.5 rounded-full">
                    <CheckmarkCircle02Icon size={14} color="#60A5FA" />
                    <span>Accredited Programs</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-blue-200 text-gray-700 px-3 py-1.5 rounded-full">
                    <StarIcon size={14} color="#60A5FA" />
                    <span>Direct Verification</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-blue-200 text-gray-700 px-3 py-1.5 rounded-full">
                    <CheckmarkCircle02Icon size={14} color="#60A5FA" />
                    <span>Special Discounts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Academies Grid - Matching subscription card style */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {partnerAcademies.map((academy) => {
              const isSelected = selectedAcademy === academy.id;

              return (
                <div
                  key={academy.id}
                  className={`group relative rounded-2xl border p-8 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl scale-[1.02]"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedAcademy(isSelected ? '' : academy.id)}
                >
                  {isSelected && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-1.5 rounded-full text-[10px] font-medium tracking-wide uppercase shadow-lg">
                        Selected
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                      {academy.name}
                    </h3>
                    <p className={`text-[13px] ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>{academy.description}</p>
                  </div>

                  <div className={`space-y-2 mb-4 text-[13px] ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock01Icon size={14} strokeWidth={2} />
                        <span>{academy.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarIcon size={14} color={isSelected ? '#d1d5db' : '#9ca3af'} />
                        <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{academy.rating}</span>
                      </div>
                    </div>
                    <div className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{academy.price}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {academy.courses.map((course, idx) => (
                      <li key={idx} className={`flex items-start text-[13px] ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                        <CheckmarkCircle02Icon size={14} color={isSelected ? '#d1d5db' : '#9ca3af'} className="mr-2.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        {course}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProgramDetails();
                    }}
                    className={`w-full py-3 px-5 rounded-lg font-medium text-[13px] transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    View Program Details
                    <Link01Icon size={14} strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Why Choose Section - Matching subscription card style */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                Instant Verification
              </h3>
              <div className="mb-4">
                <CheckmarkCircle02Icon size={22} color="#6b7280" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-gray-600">
                Get verified immediately upon course completion
              </p>
            </div>

            <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                Special Pricing
              </h3>
              <div className="mb-4">
                <StarIcon size={22} color="#6b7280" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-gray-600">
                Exclusive discounts for our community members
              </p>
            </div>

            <div className="group relative rounded-2xl border p-8 transition-all duration-300 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-400">
                Flexible Learning
              </h3>
              <div className="mb-4">
                <BookOpen02Icon size={22} color="#6b7280" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-gray-600">
                Online, in-person, and hybrid options available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShieldUserIcon size={20} color="#60A5FA" strokeWidth={2} />
              <h4 className="font-semibold text-gray-900 tracking-tight">Your Privacy is Protected</h4>
            </div>
            <p className="text-gray-600 text-[13px] max-w-2xl mx-auto">
              All documents are encrypted and only reviewed by our verification team. They will never be publicly displayed or shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensingClient;
