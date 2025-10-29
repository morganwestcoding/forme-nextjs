"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, X, ArrowRight, AlertCircle, GraduationCap, ChevronDown, ExternalLink, BookOpen, Star } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState('upload');
  const [licensingImage, setLicensingImage] = useState(currentUser?.licensingImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [showAcademyDropdown, setShowAcademyDropdown] = useState(false);

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
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Verified Professional</span>
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-medium text-sm">Verification Pending</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200">
            <X className="w-4 h-4" />
            <span className="font-medium text-sm">Verification Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          {isOnboarding && (
            <p className="text-sm text-[#60A5FA] font-medium mb-2">Step 1 of 2</p>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Professional Verification
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Build trust with clients by verifying your credentials
          </p>
          {getStatusBadge()}
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-300">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M18.7088 3.49534C16.8165 2.55382 14.5009 2 12 2C9.4991 2 7.1835 2.55382 5.29116 3.49534C4.36318 3.95706 3.89919 4.18792 3.4496 4.91378C3 5.63965 3 6.34248 3 7.74814V11.2371C3 16.9205 7.54236 20.0804 10.173 21.4338C10.9067 21.8113 11.2735 22 12 22C12.7265 22 13.0933 21.8113 13.8269 21.4338C16.4576 20.0804 21 16.9205 21 11.2371L21 7.74814C21 6.34249 21 5.63966 20.5504 4.91378C20.1008 4.18791 19.6368 3.95706 18.7088 3.49534Z" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 14.4984C8.5 12.5654 10.067 10.9984 12 10.9984C13.933 10.9984 15.5 12.5654 15.5 14.4984M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Build Trust</h3>
            <p className="text-gray-600 text-sm">
              Verified badge increases booking rates by 3x
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-300">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M4.5 9.5C4.5 13.6421 7.85786 17 12 17C16.1421 17 19.5 13.6421 19.5 9.5C19.5 5.35786 16.1421 2 12 2C7.85786 2 4.5 5.35786 4.5 9.5Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 10.1667C9 10.1667 9.75 10.1667 10.5 11.5C10.5 11.5 12.8824 8.16667 15 7.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.8825 15L17.5527 18.2099C17.9833 20.2723 18.1986 21.3035 17.7563 21.7923C17.3141 22.281 16.546 21.8606 15.0099 21.0198L12.7364 19.7753C12.3734 19.5766 12.1919 19.4773 12 19.4773C11.8081 19.4773 11.6266 19.5766 11.2636 19.7753L8.99008 21.0198C7.45397 21.8606 6.68592 22.281 6.24365 21.7923C5.80139 21.3035 6.01669 20.2723 6.44731 18.2099L7.11752 15" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Stand Out</h3>
            <p className="text-gray-600 text-sm">
              Appear higher in search results and recommendations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-300">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M15 2.5V4C15 5.41421 15 6.12132 15.4393 6.56066C15.8787 7 16.5858 7 18 7H19.5" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14.1716C14.5803 2 14.7847 2 14.9685 2.07612C15.1522 2.15224 15.2968 2.29676 15.5858 2.58579L19.4142 6.41421C19.7032 6.70324 19.8478 6.84776 19.9239 7.03153C20 7.2153 20 7.41968 20 7.82843V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16Z" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 11H16M8 14H16M8 17H12.1708" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Secure Process</h3>
            <p className="text-gray-600 text-sm">
              Encrypted documents reviewed only by our team
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white p-2 rounded-lg mb-8 max-w-md mx-auto border border-gray-300">
          <button
            onClick={() => setActiveTab('upload')}
            className={`w-1/2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            I Have a License
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`w-1/2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'training'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Need Training
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Status Messages */}
            {verificationStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Your documents are being reviewed
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Our verification team is reviewing your credentials. You&apos;ll receive an email 
                    notification within 24-48 hours.
                  </p>
                </div>
              </div>
            )}

            {verificationStatus === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    You&apos;re verified!
                  </h3>
                  <p className="text-sm text-green-800">
                    Your credentials have been verified. The verified badge now appears on your profile.
                  </p>
                </div>
              </div>
            )}

            {verificationStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">
                    Verification was not approved
                  </h3>
                  <p className="text-sm text-red-800">
                    Your submitted documents could not be verified. Please upload different credentials or contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="bg-white rounded-xl border border-gray-300 p-8">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                Upload Your Credentials
              </h2>
              <p className="text-gray-600 mb-8">
                Upload professional licenses, certifications, diplomas, or any official
                document that verifies your expertise
              </p>

              {/* Image Upload Placeholder */}
              <div className="mb-6">
                <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  licensingImage 
                    ? 'border-[#60A5FA] bg-blue-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}>
                  {licensingImage ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-12 h-12 text-[#60A5FA] mx-auto" />
                      <p className="text-[#60A5FA] font-medium">Document uploaded successfully!</p>
                      <button
                        onClick={() => setLicensingImage('')}
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Upload different document
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" className="mx-auto">
                        <path d="M15 2.5V4C15 5.41421 15 6.12132 15.4393 6.56066C15.8787 7 16.5858 7 18 7H19.5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14.1716C14.5803 2 14.7847 2 14.9685 2.07612C15.1522 2.15224 15.2968 2.29676 15.5858 2.58579L19.4142 6.41421C19.7032 6.70324 19.8478 6.84776 19.9239 7.03153C20 7.2153 20 7.41968 20 7.82843V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16Z" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 11H16M8 14H16M8 17H12.1708" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
                      </div>
                      <button
                        onClick={() => setLicensingImage('mock-image-url')}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
                      >
                        Select File
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Boxes */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#60A5FA]" />
                    Acceptable Documents
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Professional licenses (state or national)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Industry certifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Educational diplomas or degrees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      Liability insurance certificates
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Verification Timeline
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">1</div>
                      <div>
                        <p className="font-medium">Upload documents</p>
                        <p className="text-xs text-gray-600">Less than 1 minute</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">2</div>
                      <div>
                        <p className="font-medium">Team review</p>
                        <p className="text-xs text-gray-600">24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">3</div>
                      <div>
                        <p className="font-medium">Get verified!</p>
                        <p className="text-xs text-gray-600">Email notification sent</p>
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
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {isOnboarding ? "I'll do this later" : "Back to Profile"}
              </button>

              <button
                onClick={handleSave}
                disabled={isLoading || !licensingImage}
                className="flex-1 py-3 px-6 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  "Uploading..."
                ) : (
                  <>
                    {verificationStatus === 'none' ? 'Submit for Verification' : 'Update Documents'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-[#60A5FA] rounded-xl p-8 text-white">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Get Verified Through Our Trusted Partners</h2>
                  <p className="text-white/90 mb-4">
                    Don&apos;t have a license? No problem! Partner with accredited institutions to get certified and verified on our platform.
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span>Accredited Programs</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4" />
                      <span>Direct Verification</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
                        <path d="M4.5 9.5C4.5 13.6421 7.85786 17 12 17C16.1421 17 19.5 13.6421 19.5 9.5C19.5 5.35786 16.1421 2 12 2C7.85786 2 4.5 5.35786 4.5 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 10.1667C9 10.1667 9.75 10.1667 10.5 11.5C10.5 11.5 12.8824 8.16667 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.8825 15L17.5527 18.2099C17.9833 20.2723 18.1986 21.3035 17.7563 21.7923C17.3141 22.281 16.546 21.8606 15.0099 21.0198L12.7364 19.7753C12.3734 19.5766 12.1919 19.4773 12 19.4773C11.8081 19.4773 11.6266 19.5766 11.2636 19.7753L8.99008 21.0198C7.45397 21.8606 6.68592 22.281 6.24365 21.7923C5.80139 21.3035 6.01669 20.2723 6.44731 18.2099L7.11752 15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                      <span>Special Discounts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academy Selector */}
            <div className="bg-white rounded-xl border border-gray-300 p-8">
              <h3 className="text-xl font-bold mb-2 text-gray-900">Choose Your Training Partner</h3>
              <p className="text-gray-600 mb-6">
                Select an academy to view their programs and get started on your certification journey
              </p>

              {/* Dropdown */}
              <div className="relative mb-6">
                <button
                  onClick={() => setShowAcademyDropdown(!showAcademyDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg hover:border-gray-400 transition-all"
                >
                  <span className="text-gray-700">
                    {selectedAcademy ? partnerAcademies.find(a => a.id === selectedAcademy)?.name : 'Select an academy...'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showAcademyDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showAcademyDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
                    {partnerAcademies.map((academy) => (
                      <button
                        key={academy.id}
                        onClick={() => {
                          setSelectedAcademy(academy.id);
                          setShowAcademyDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{academy.name}</h4>
                              {academy.verified && (
                                <CheckCircle className="w-4 h-4 text-[#60A5FA]" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{academy.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {academy.rating}
                              </span>
                              <span>•</span>
                              <span>{academy.duration}</span>
                              <span>•</span>
                              <span className="font-semibold text-[#60A5FA]">{academy.price}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Academy Details */}
              {selectedAcademy && (() => {
                const academy = partnerAcademies.find(a => a.id === selectedAcademy);
                
                // Add null check for academy
                if (!academy) return null;
                
                return (
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{academy.name}</h4>
                        <p className="text-gray-600 text-sm">{academy.description}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span className="font-semibold text-yellow-700 text-sm">{academy.rating}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3 text-sm">Available Programs</h5>
                        <ul className="space-y-2">
                          {academy.courses.map((course, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              {course}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-semibold text-gray-700 mb-3 text-sm">Program Details</h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-xs text-gray-500">Duration</p>
                              <p className="text-sm font-semibold text-gray-900">{academy.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                              <path d="M4.5 9.5C4.5 13.6421 7.85786 17 12 17C16.1421 17 19.5 13.6421 19.5 9.5C19.5 5.35786 16.1421 2 12 2C7.85786 2 4.5 5.35786 4.5 9.5Z" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M9 10.1667C9 10.1667 9.75 10.1667 10.5 11.5C10.5 11.5 12.8824 8.16667 15 7.5" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M16.8825 15L17.5527 18.2099C17.9833 20.2723 18.1986 21.3035 17.7563 21.7923C17.3141 22.281 16.546 21.8606 15.0099 21.0198L12.7364 19.7753C12.3734 19.5766 12.1919 19.4773 12 19.4773C11.8081 19.4773 11.6266 19.5766 11.2636 19.7753L8.99008 21.0198C7.45397 21.8606 6.68592 22.281 6.24365 21.7923C5.80139 21.3035 6.01669 20.2723 6.44731 18.2099L7.11752 15" stroke="#9333ea" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-500">Investment</p>
                              <p className="text-sm font-semibold text-gray-900">{academy.price}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#60A5FA] text-white rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold mb-1 text-sm">Automatic Verification</p>
                          <p className="text-sm text-blue-100">
                            Upon completion, you&apos;ll be automatically verified on our platform with no additional paperwork needed!
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleViewProgramDetails}
                      className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      View Program Details
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-xl border border-gray-300 p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Why Choose Partner Training?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Instant Verification</h4>
                    <p className="text-sm text-gray-600">Get verified immediately upon course completion</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <path d="M4.5 9.5C4.5 13.6421 7.85786 17 12 17C16.1421 17 19.5 13.6421 19.5 9.5C19.5 5.35786 16.1421 2 12 2C7.85786 2 4.5 5.35786 4.5 9.5Z" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 10.1667C9 10.1667 9.75 10.1667 10.5 11.5C10.5 11.5 12.8824 8.16667 15 7.5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M16.8825 15L17.5527 18.2099C17.9833 20.2723 18.1986 21.3035 17.7563 21.7923C17.3141 22.281 16.546 21.8606 15.0099 21.0198L12.7364 19.7753C12.3734 19.5766 12.1919 19.4773 12 19.4773C11.8081 19.4773 11.6266 19.5766 11.2636 19.7753L8.99008 21.0198C7.45397 21.8606 6.68592 22.281 6.24365 21.7923C5.80139 21.3035 6.01669 20.2723 6.44731 18.2099L7.11752 15" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Accredited Programs</h4>
                    <p className="text-sm text-gray-600">All partners are licensed and industry-recognized</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Special Pricing</h4>
                    <p className="text-sm text-gray-600">Exclusive discounts for our community members</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Flexible Learning</h4>
                    <p className="text-sm text-gray-600">Online, in-person, and hybrid options available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-gray-300 rounded-xl p-6 mt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path d="M18.7088 3.49534C16.8165 2.55382 14.5009 2 12 2C9.4991 2 7.1835 2.55382 5.29116 3.49534C4.36318 3.95706 3.89919 4.18792 3.4496 4.91378C3 5.63965 3 6.34248 3 7.74814V11.2371C3 16.9205 7.54236 20.0804 10.173 21.4338C10.9067 21.8113 11.2735 22 12 22C12.7265 22 13.0933 21.8113 13.8269 21.4338C16.4576 20.0804 21 16.9205 21 11.2371L21 7.74814C21 6.34249 21 5.63966 20.5504 4.91378C20.1008 4.18791 19.6368 3.95706 18.7088 3.49534Z" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.5 14.4984C8.5 12.5654 10.067 10.9984 12 10.9984C13.933 10.9984 15.5 12.5654 15.5 14.4984M14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="font-semibold text-gray-900">Your Privacy is Protected</h4>
          </div>
          <p className="text-gray-600 text-sm">
            All documents are encrypted and only reviewed by our verification team.
            They will never be publicly displayed or shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicensingClient;