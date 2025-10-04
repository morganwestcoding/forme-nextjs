"use client";
import { useState } from "react";
import { Shield, Award, FileCheck, Clock, CheckCircle, X, ArrowRight, AlertCircle, GraduationCap, ChevronDown, ExternalLink, BookOpen, Star } from "lucide-react";

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

const LicensingClient = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [licensingImage, setLicensingImage] = useState(currentUser?.licensingImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [showAcademyDropdown, setShowAcademyDropdown] = useState(false);
  
  const verificationStatus = currentUser?.verificationStatus || 'none';
  const isOnboarding = false;

  const handleSave = async () => {
    if (!licensingImage) {
      alert('Please upload a document first');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Documents submitted for verification!');
    }, 1500);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          {isOnboarding && (
            <p className="text-sm text-[#60A5FA] font-medium mb-2">Step 2 of 3</p>
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
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#60A5FA]" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Build Trust</h3>
            <p className="text-gray-600 text-sm">
              Verified badge increases booking rates by 3x
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Stand Out</h3>
            <p className="text-gray-600 text-sm">
              Appear higher in search results and recommendations
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">Secure Process</h3>
            <p className="text-gray-600 text-sm">
              Encrypted documents reviewed only by our team
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-100 p-1 rounded-lg mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`w-1/2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            I Have a License
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`w-1/2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'training'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
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
            <div className="bg-white rounded-xl border border-gray-200 p-8">
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
                      <FileCheck className="w-12 h-12 text-gray-400 mx-auto" />
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    Verification Timeline
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">1</div>
                      <div>
                        <p className="font-medium">Upload documents</p>
                        <p className="text-xs text-gray-600">Less than 1 minute</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">2</div>
                      <div>
                        <p className="font-medium">Team review</p>
                        <p className="text-xs text-gray-600">24-48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-purple-700">3</div>
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
                      <Award className="w-4 h-4" />
                      <span>Special Discounts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academy Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
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
                            <Award className="w-5 h-5 text-purple-600" />
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

                    <button className="w-full py-3 px-6 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                      View Program Details
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
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
                    <Award className="w-5 h-5 text-[#60A5FA]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Accredited Programs</h4>
                    <p className="text-sm text-gray-600">All partners are licensed and industry-recognized</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Special Pricing</h4>
                    <p className="text-sm text-gray-600">Exclusive discounts for our community members</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-orange-600" />
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
        <div className="bg-gray-900 text-white rounded-lg p-6 mt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5" />
            <h4 className="font-semibold">Your Privacy is Protected</h4>
          </div>
          <p className="text-gray-300 text-sm">
            All documents are encrypted and only reviewed by our verification team. 
            They will never be publicly displayed or shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicensingClient;