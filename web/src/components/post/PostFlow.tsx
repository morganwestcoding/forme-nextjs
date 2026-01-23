'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import TypeformStep from '../registration/TypeformStep';
import TypeformProgress from '../registration/TypeformProgress';
import TypeformNavigation from '../registration/TypeformNavigation';

import TypeStep from './steps/TypeStep';
import MediaStep from './steps/MediaStep';
import CaptionStep from './steps/CaptionStep';
import TextContentStep from './steps/TextContentStep';
import PreviewStep from './steps/PreviewStep';

import { SafeUser } from '@/app/types';

interface PostFlowProps {
  currentUser: SafeUser;
}

type PostType = 'media' | 'text';

enum STEPS {
  TYPE = 0,
  MEDIA = 1,
  TEXT_CONTENT = 2,
  CAPTION = 3,
  PREVIEW = 4,
}

export default function PostFlow({ currentUser }: PostFlowProps) {
  const router = useRouter();

  const [step, setStep] = useState<STEPS>(STEPS.TYPE);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Post data
  const [postType, setPostType] = useState<PostType | null>(null);
  const [mediaSrc, setMediaSrc] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [beforeImageSrc, setBeforeImageSrc] = useState<string>('');

  const getFlowPath = useCallback((): STEPS[] => {
    if (postType === 'text') {
      return [STEPS.TYPE, STEPS.TEXT_CONTENT, STEPS.PREVIEW];
    }
    return [STEPS.TYPE, STEPS.MEDIA, STEPS.CAPTION, STEPS.PREVIEW];
  }, [postType]);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case STEPS.TYPE:
        return Boolean(postType);
      case STEPS.MEDIA:
        return Boolean(mediaSrc);
      case STEPS.TEXT_CONTENT:
        return textContent.trim().length > 0;
      case STEPS.CAPTION:
        return true; // Caption is optional
      case STEPS.PREVIEW:
        return true;
      default:
        return true;
    }
  }, [step, postType, mediaSrc, textContent]);

  const getNextStep = useCallback((): STEPS | null => {
    const flowPath = getFlowPath();
    const currentIndex = flowPath.indexOf(step);
    if (currentIndex === -1 || currentIndex === flowPath.length - 1) return null;
    return flowPath[currentIndex + 1];
  }, [step, getFlowPath]);

  const getPreviousStep = useCallback((): STEPS | null => {
    const flowPath = getFlowPath();
    const currentIndex = flowPath.indexOf(step);
    if (currentIndex <= 0) return null;
    return flowPath[currentIndex - 1];
  }, [step, getFlowPath]);

  const handleNext = useCallback(() => {
    if (!canProceed()) {
      switch (step) {
        case STEPS.TYPE:
          toast.error('Please select a post type');
          break;
        case STEPS.MEDIA:
          toast.error('Please upload an image or video');
          break;
        case STEPS.TEXT_CONTENT:
          toast.error('Please write something');
          break;
      }
      return;
    }

    const next = getNextStep();
    if (next !== null) {
      setDirection(1);
      setStep(next);
    }
  }, [step, canProceed, getNextStep]);

  const handleBack = useCallback(() => {
    const prev = getPreviousStep();
    if (prev !== null) {
      setDirection(-1);
      setStep(prev);
    } else {
      // First step - go back
      router.back();
    }
  }, [getPreviousStep, router]);

  const onSubmit = useCallback(async () => {
    if (postType === 'media' && !mediaSrc) {
      toast.error('Please upload media');
      return;
    }
    if (postType === 'text' && !textContent.trim()) {
      toast.error('Please write something');
      return;
    }

    setIsLoading(true);

    try {
      const payload = postType === 'text'
        ? {
            content: textContent.trim(),
            postType: 'text',
          }
        : {
            content: caption.trim() || '',
            imageSrc: mediaType === 'image' ? mediaSrc : undefined,
            mediaUrl: mediaType === 'video' ? mediaSrc : undefined,
            mediaType: mediaType,
            beforeImageSrc: beforeImageSrc || undefined,
            postType: 'work',
          };

      console.log('[PostFlow] Submitting payload:', payload);
      await axios.post('/api/post', payload);
      toast.success('Post created!');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [postType, mediaSrc, mediaType, caption, textContent, beforeImageSrc, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isInput && target.tagName === 'TEXTAREA') return;
        if (canProceed() && !isLoading) {
          e.preventDefault();
          if (step === STEPS.PREVIEW) {
            onSubmit();
          } else {
            handleNext();
          }
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isLoading, step, handleNext, handleBack, onSubmit]);

  const flowPath = getFlowPath();
  const currentIndex = flowPath.indexOf(step);
  const totalSteps = flowPath.length;
  const showBack = true;
  const isLastStep = step === STEPS.PREVIEW;

  const renderStep = () => {
    switch (step) {
      case STEPS.TYPE:
        return (
          <TypeStep
            selectedType={postType}
            onTypeSelect={setPostType}
          />
        );
      case STEPS.MEDIA:
        return (
          <MediaStep
            mediaSrc={mediaSrc}
            mediaType={mediaType}
            beforeImageSrc={beforeImageSrc}
            onMediaChange={(src, type) => {
              setMediaSrc(src);
              setMediaType(type);
            }}
            onBeforeImageChange={setBeforeImageSrc}
          />
        );
      case STEPS.TEXT_CONTENT:
        return (
          <TextContentStep
            content={textContent}
            onContentChange={setTextContent}
          />
        );
      case STEPS.CAPTION:
        return (
          <CaptionStep
            caption={caption}
            onCaptionChange={setCaption}
          />
        );
      case STEPS.PREVIEW:
        return postType === 'text' ? (
          <PreviewStep
            mediaSrc=""
            mediaType="image"
            caption={textContent}
            beforeImageSrc=""
            currentUser={currentUser}
            isTextPost
          />
        ) : (
          <PreviewStep
            mediaSrc={mediaSrc}
            mediaType={mediaType}
            caption={caption}
            beforeImageSrc={beforeImageSrc}
            currentUser={currentUser}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <TypeformProgress
        currentStep={currentIndex + 1}
        totalSteps={totalSteps}
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <TypeformStep key={step} direction={direction}>
              {renderStep()}
            </TypeformStep>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <TypeformNavigation
        canProceed={canProceed()}
        showBack={showBack}
        isLastStep={isLastStep}
        isLoading={isLoading}
        onNext={isLastStep ? onSubmit : handleNext}
        onBack={handleBack}
        submitLabel="Post"
      />
    </div>
  );
}
