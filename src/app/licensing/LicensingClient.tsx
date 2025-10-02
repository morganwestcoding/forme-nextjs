// app/licensing/LicensingClient.tsx
'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { SafeUser, VerificationStatus } from "@/app/types";
import { Shield, Award, FileCheck, Clock, CheckCircle, X, ArrowRight, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/inputs/ImageUpload";

interface LicensingClientProps {
  currentUser: SafeUser;
}

const LicensingClient: React.FC<LicensingClientProps> = ({ currentUser }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get('onboarding') === 'true';
  
  const [licensingImage, setLicensingImage] = useState(currentUser.licensingImage || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use actual verification status from database
  const verificationStatus = (currentUser.verificationStatus || 'none') as VerificationStatus;

  const handleSave = async () => {
    if (!licensingImage) {
      toast.error('Please upload a document first');
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`/api/users/${currentUser.id}`, {
        licensingImage
      });
      toast.success('Documents submitted for verification!');
      router.refresh();
      
      // If onboarding, redirect to subscription
      if (isOnboarding) {
        setTimeout(() => {
          router.push('/subscription');
        }, 1000);
      }
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (isOnboarding) {
      router.push('/subscription');
    } else {
      router.push(`/users/${currentUser.id}`);
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Verified Professional</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Verification Pending</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
            <X className="w-5 h-5" />
            <span className="font-semibold">Verification Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        {isOnboarding && (
          <p className="text-sm text-blue-600 font-medium mb-2">Step 2 of 3</p>
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Professional Verification
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Build trust with clients by verifying your credentials
        </p>
        {getStatusBadge()}
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Build Trust</h3>
          <p className="text-gray-600 text-sm">
            Verified badge on your profile increases booking rates by 3x
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Stand Out</h3>
          <p className="text-gray-600 text-sm">
            Appear higher in search results and recommendations
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Secure Process</h3>
          <p className="text-gray-600 text-sm">
            Your documents are encrypted and only seen by our team
          </p>
        </div>
      </div>

      {/* Current Status Info (if already uploaded) */}
      {verificationStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Your documents are being reviewed
            </h3>
            <p className="text-sm text-yellow-800">
              Our verification team is reviewing your credentials. You'll receive an email 
              notification within 24-48 hours. You can upload new documents below if needed.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              You're verified!
            </h3>
            <p className="text-sm text-green-800 mb-1">
              Your credentials have been verified. The verified badge now appears on your profile.
            </p>
            {currentUser.verifiedAt && (
              <p className="text-xs text-green-700">
                Verified on {new Date(currentUser.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">
              Verification was not approved
            </h3>
            <p className="text-sm text-red-800 mb-2">
              {currentUser.rejectionReason || 'Your submitted documents could not be verified. Please upload different credentials or contact support for assistance.'}
            </p>
            {currentUser.verificationRejectedAt && (
              <p className="text-xs text-red-700">
                Reviewed on {new Date(currentUser.verificationRejectedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-8">
        <h2 className="text-2xl font-bold mb-2">Upload Your Credentials</h2>
        <p className="text-gray-600 mb-6">
          Upload professional licenses, certifications, diplomas, or any official 
          document that verifies your expertise
        </p>

        <div className="mb-6">
          <ImageUpload
            uploadId="licensing-document"
            onChange={(value) => setLicensingImage(value)}
            value={licensingImage}
            className="w-full h-64"
            ratio="landscape"
            rounded="lg"
            enableCrop={false}
            label="License or Certification"
            maxFileSizeMB={10}
            onRemove={() => setLicensingImage('')}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            What documents can I upload?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Professional licenses (state or national)</li>
            <li>• Industry certifications</li>
            <li>• Educational diplomas or degrees</li>
            <li>• Liability insurance certificates</li>
            <li>• Business permits or registrations</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">
                Verification Timeline
              </h3>
              <p className="text-sm text-amber-800">
                Most verifications are completed within 24-48 hours. You'll receive 
                an email notification once your credentials are verified.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSkip}
          disabled={isLoading}
          className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          {isOnboarding ? "I'll do this later" : "Back to Profile"}
        </button>
        
        <button
          onClick={handleSave}
          disabled={isLoading || !licensingImage}
          className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Privacy Notice */}
      <p className="text-center text-sm text-gray-500 mt-6">
        🔒 Your documents are encrypted and only reviewed by our verification team. 
        They will never be publicly displayed.
      </p>
    </div>
  );
};

export default LicensingClient;