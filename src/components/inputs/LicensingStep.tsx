import React from 'react';
import Heading from '../Heading';
import ImageUpload from '../inputs/ImageUpload';
import { Shield, Award, FileCheck } from 'lucide-react';

interface LicensingStepProps {
  licensingImage?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  isLoading?: boolean;
  userType?: string;
}

const LicensingStep: React.FC<LicensingStepProps> = ({
  licensingImage,
  onChange,
  onRemove,
  isLoading,
  userType
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Heading
        title="Verify Your Expertise"
        subtitle="Upload your license, certification, or proof of qualification to build trust with clients"
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl">
          <Shield className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-sm text-blue-900">Build Trust</h3>
          <p className="text-xs text-blue-700 text-center mt-1">
            Show clients you're qualified
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl">
          <Award className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold text-sm text-green-900">Stand Out</h3>
          <p className="text-xs text-green-700 text-center mt-1">
            Get verified badge on profile
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl">
          <FileCheck className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-sm text-purple-900">Secure</h3>
          <p className="text-xs text-purple-700 text-center mt-1">
            Your documents stay private
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="flex flex-col items-center gap-4 py-6">
        <ImageUpload
          uploadId="licensing-document"
          onChange={onChange}
          value={licensingImage}
          className="w-full max-w-2xl h-64"
          ratio="landscape"
          rounded="lg"
          enableCrop={false}
          label="License or Certification"
          maxFileSizeMB={10}
          onRemove={onRemove}
        />
        
        <div className="text-center max-w-md">
          <p className="text-sm text-neutral-600 mb-2">
            <strong>Accepted documents:</strong>
          </p>
          <p className="text-xs text-neutral-500">
            Professional licenses, certifications, diplomas, or any official document 
            that verifies your expertise in your field
          </p>
        </div>

        {userType === 'individual' && (
          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
            <div className="text-amber-600 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium">
                Optional but Recommended
              </p>
              <p className="text-xs text-amber-700 mt-1">
                As an independent professional, adding your credentials helps clients feel 
                confident choosing your services
              </p>
            </div>
          </div>
        )}

        {!licensingImage && (
          <button
            type="button"
            onClick={() => {}}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            I'll add this later
          </button>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="text-xs text-neutral-400 text-center px-4">
        🔒 Your licensing documents are encrypted and only reviewed by our verification team. 
        They will never be publicly displayed.
      </div>
    </div>
  );
};

export default LicensingStep;