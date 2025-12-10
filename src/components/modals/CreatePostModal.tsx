'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import Heading from '@/components/Heading';
import { toast } from 'react-hot-toast';
import useCreatePostModal from '@/app/hooks/useCreatePostModal';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/components/inputs/MediaUpload';
import CategoryInput from '@/components/inputs/CategoryInput';
import { categories } from '@/components/Categories';
import { MediaData } from '@/app/types';
import { Search, X, User, Building2, Store } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

/** ================== Overlay Position Type ================== */

type OverlayPos =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** ================== Tag Types & Interfaces ================== */

type TagType = 'user' | 'listing' | 'shop';

interface TagItem {
  id: string;
  type: TagType;
  title: string;
  subtitle?: string;
  image?: string | null;
  href: string;
}

/** ================== Steps & Post Types ================== */

enum STEPS {
  TYPE = 0,
  MEDIA = 1,
  CONTENT = 2,
  TAGS = 3,
  CATEGORY = 4,
}

const postTypes = ['Reel', 'Text Post', 'Ad'] as const;

/** Post Type Input - matches CategoryInput styling */
interface PostTypeInputProps {
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
  accentColor: string;
}

const PostTypeIcon: React.FC<{ label: string; className?: string }> = ({ label, className }) => {
  switch (label) {
    case 'Reel':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
          <path d="M2.50012 7.5H21.5001" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M17.0001 2.5L14.0001 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10.0001 2.5L7.00012 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14.9531 14.8948C14.8016 15.5215 14.0857 15.9644 12.6539 16.8502C11.2697 17.7064 10.5777 18.1346 10.0199 17.9625C9.78934 17.8913 9.57925 17.7562 9.40982 17.57C9 17.1198 9 16.2465 9 14.5C9 12.7535 9 11.8802 9.40982 11.4299C9.57925 11.2438 9.78934 11.1087 10.0199 11.0375C10.5777 10.8654 11.2697 11.2936 12.6539 12.1498C14.0857 13.0356 14.8016 13.4785 14.9531 14.1052C15.0156 14.3639 15.0156 14.6361 14.9531 14.8948Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'Text Post':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
          <path d="M20 18V6M6 20H18M18 4H6M4 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.99901 10C7.70512 8.43128 8.73403 8.05948 11.9564 8M11.9564 8C14.9534 8.06735 16.1887 8.30534 15.9138 10M11.9564 8V16M10.4724 16H13.4405" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 2H19C18.4477 2 18 2.44772 18 3V5C18 5.55228 18.4477 6 19 6H21C21.5523 6 22 5.55228 22 5V3C22 2.44772 21.5523 2 21 2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 2H3C2.44772 2 2 2.44772 2 3V5C2 5.55228 2.44772 6 3 6H5C5.55228 6 6 5.55228 6 5V3C6 2.44772 5.55228 2 5 2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 18H19C18.4477 18 18 18.4477 18 19V21C18 21.5523 18.4477 22 19 22H21C21.5523 22 22 21.5523 22 21V19C22 18.4477 21.5523 18 21 18Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 18H3C2.44772 18 2 18.4477 2 19V21C2 21.5523 2.44772 22 3 22H5C5.55228 22 6 21.5523 6 21V19C6 18.4477 5.55228 18 5 18Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'Ad':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none">
          <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
};

const PostTypeInput: React.FC<PostTypeInputProps> = ({ label, selected, onClick, accentColor }) => {
  // Calculate a darker shade for the gradient
  const getDarkerShade = (hex: string): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = -20;
    const R = Math.max(0, Math.min(255, (num >> 16) + Math.round(2.55 * amt)));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * amt)));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + Math.round(2.55 * amt)));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const darkerColor = getDarkerShade(accentColor);

  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`
        group relative overflow-hidden
        rounded-xl flex flex-col items-center justify-center gap-2.5 p-4
        cursor-pointer select-none
        transition-all duration-300 ease-out
        will-change-transform transform-gpu
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${selected
          ? 'text-white border'
          : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
        }
      `}
      style={{
        ...(selected ? {
          background: `linear-gradient(to bottom right, ${accentColor}, ${darkerColor})`,
          borderColor: `${accentColor}80`
        } : {}),
        // @ts-expect-error CSS custom property for focus ring
        '--tw-ring-color': accentColor
      }}
    >
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div
          className={`transition-all duration-300 ${selected ? 'text-white' : 'text-gray-500'}`}
          onMouseEnter={(e) => {
            if (!selected) {
              e.currentTarget.style.color = accentColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!selected) {
              e.currentTarget.style.color = '';
            }
          }}
        >
          <PostTypeIcon
            label={label}
            className="w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110 transform-gpu"
          />
        </div>

        <span
          className={`
            text-xs font-medium leading-tight
            transition-all duration-300 ease-out
            ${selected ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}
            transform-gpu
          `}
        >
          {label}
        </span>
      </div>
    </button>
  );
};

/** ================== Component ================== */

const CreatePostModal = () => {
  const router = useRouter();
  const modal = useCreatePostModal();
  const { accentColor } = useTheme();
  const [step, setStep] = useState(STEPS.TYPE);
  const [postType, setPostType] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** Overlay state for Reels */
  const [overlayText, setOverlayText] = useState('');
  const [overlaySize, setOverlaySize] = useState(36); // Reduced default size
  const [overlayColor, setOverlayColor] = useState<'ffffff' | '000000'>('ffffff');
  const [overlayPos, setOverlayPos] = useState<OverlayPos>('bottom-center');

  /** Text Post styling state */
  const [textBgType, setTextBgType] = useState<'solid' | 'gradient'>('gradient');
  const [textBgColor, setTextBgColor] = useState('#6366f1');
  const [textGradientStart, setTextGradientStart] = useState('#6366f1');
  const [textGradientEnd, setTextGradientEnd] = useState('#ec4899');
  const [textPosition, setTextPosition] = useState<OverlayPos>('center');
  const [textFontSize, setTextFontSize] = useState(24);

  /** Tags state */
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TagItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /** Measure preview for better scaling */
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!previewRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        setPreviewDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    });
    ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  // Search for tags using the global search API (same logic as PostModal)
  useEffect(() => {
    const searchTags = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        const taggableResults = (data.results || []).filter((item: any) =>
          ['user', 'listing', 'shop'].includes(item.type)
        );
        setSearchResults(taggableResults);
      } catch (error) {
        console.error('Tag search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchTags, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleTagSelect = (tag: TagItem) => {
    // Prevent duplicate tags
    if (!selectedTags.find(t => t.id === tag.id && t.type === tag.type)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTagRemove = (tagId: string, tagType: TagType) => {
    setSelectedTags(prev => prev.filter(t => !(t.id === tagId && t.type === tagType)));
  };

  const getTagIcon = (type: TagType) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'listing': return <Building2 className="w-4 h-4" />;
      case 'shop': return <Store className="w-4 h-4" />;
    }
  };

  const handleClose = useCallback(() => {
    setPostType('');
    setContent('');
    setCategory('');
    setMediaData(null);
    setOverlayText('');
    setOverlaySize(36);
    setOverlayColor('ffffff');
    setOverlayPos('bottom-center');
    setTextBgType('gradient');
    setTextBgColor('#6366f1');
    setTextGradientStart('#6366f1');
    setTextGradientEnd('#ec4899');
    setTextPosition('center');
    setTextFontSize(24);
    setSelectedTags([]);
    setSearchQuery('');
    setSearchResults([]);
    setStep(STEPS.TYPE);
    modal.onClose();
  }, [modal]);

  const handlePost = async () => {
    if (!content.trim() && postType !== 'Reel') {
      return toast.error('Please write something');
    }
    if (postType === 'Reel' && !mediaData) {
      return toast.error('Please upload media for your reel');
    }
    if (!category) {
      return toast.error('Please select a category');
    }

    setIsLoading(true);

    // Store overlay data separately - will be rendered via CSS on display
    const overlayData = (postType === 'Reel' && overlayText.trim()) ? {
      text: overlayText.trim(),
      size: overlaySize,
      color: overlayColor,
      pos: overlayPos,
    } : null;

    // Store text post styling data
    const textPostStyle = postType === 'Text Post' ? {
      bgType: textBgType,
      bgColor: textBgColor,
      gradientStart: textGradientStart,
      gradientEnd: textGradientEnd,
      textPosition: textPosition,
      fontSize: textFontSize,
    } : null;

    const postData = {
      content: content || '',
      category,
      mediaUrl: mediaData?.url || null, // Raw URL without Cloudinary text transformation
      mediaType: mediaData?.type || null,
      imageSrc: mediaData?.type === 'image' ? mediaData?.url : null,
      location: null,
      tag: postType,
      postType,
      mediaOverlay: overlayData,
      textPostStyle,
      mentions: selectedTags.map(tag => ({
        id: tag.id,
        type: tag.type,
        title: tag.title,
        subtitle: tag.subtitle || null,
        image: tag.image || null
      }))
    };

    try {
      await axios.post('/api/post', postData);
      toast.success('Post created successfully!');
      router.refresh();
      handleClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        toast.error('You need to be logged in to create a post');
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = () => {
    if (step === STEPS.TYPE) {
      if (!postType) return toast.error('Choose a post type');
      if (postType === 'Reel') return setStep(STEPS.MEDIA);
      return setStep(STEPS.CONTENT);
    }
    if (step === STEPS.MEDIA) {
      if (!mediaData) return toast.error('Please upload media for your reel');
      return setStep(STEPS.CONTENT);
    }
    if (step === STEPS.CONTENT) {
      if (postType !== 'Reel' && !content.trim()) {
        return toast.error('Please write something');
      }
      return setStep(STEPS.TAGS);
    }
    if (step === STEPS.TAGS) {
      return setStep(STEPS.CATEGORY);
    }
    if (step === STEPS.CATEGORY) {
      if (!category) return toast.error('Please select a category');
      return handlePost();
    }
  };

  const handleSecondaryAction = () => {
    if (step === STEPS.CATEGORY) {
      setStep(STEPS.TAGS);
    } else if (step === STEPS.TAGS) {
      setStep(STEPS.CONTENT);
    } else if (step === STEPS.CONTENT) {
      setStep(postType === 'Reel' ? STEPS.MEDIA : STEPS.TYPE);
    } else if (step === STEPS.MEDIA) {
      setStep(STEPS.TYPE);
    }
  };

  const actionLabel = useMemo(() => (step === STEPS.CATEGORY ? 'Post' : 'Next'), [step]);
  const secondaryActionLabel = useMemo(() => (step === STEPS.TYPE ? undefined : 'Back'), [step]);

  const bodyContent = useMemo(() => {
    if (step === STEPS.TYPE) {
      return (
        <div className="flex flex-col gap-4">
          <Heading title="What type of post?" subtitle="Choose one to get started" />
          <div className="grid grid-cols-3 gap-3">
            {postTypes.map((type) => (
              <PostTypeInput
                key={type}
                label={type}
                selected={postType === type}
                onClick={(value) => setPostType(value)}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>
      );
    }

    if (step === STEPS.MEDIA) {
      const isReel = postType === 'Reel';

      return (
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {isReel ? 'Add your reel' : 'Add media'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isReel ? 'Vertical format works best (9:16)' : 'Add an image, video, or GIF'}
            </p>
          </div>

          {/* Main Content Area */}
          <div className={`flex ${isReel ? 'gap-5 items-start' : 'justify-center'}`}>
            {/* Preview Container */}
            <div
              ref={previewRef}
              className={`relative group ${isReel ? 'flex-shrink-0' : ''}`}
              style={{ width: isReel ? '180px' : '100%', maxWidth: isReel ? '180px' : '320px' }}
            >
              {/* Phone Frame for Reels */}
              {isReel && (
                <div className="absolute -inset-1.5 rounded-[1.75rem] bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 shadow-lg -z-10" />
              )}

              <div
                className={`
                  relative overflow-hidden cursor-pointer
                  ${isReel ? 'rounded-[1.25rem]' : 'rounded-2xl border-2 border-dashed border-gray-200'}
                  ${mediaData ? '' : 'bg-gray-50'}
                  transition-all duration-200
                `}
                style={{ aspectRatio: isReel ? '9/16' : '4/3' }}
              >
                <MediaUpload
                  onMediaUpload={setMediaData}
                  currentMedia={mediaData}
                  ratio={isReel ? 'reel' : 'landscape'}
                  heightClass="h-full"
                  className="!h-full [&>div:first-child]:hidden [&_[role=button]]:!border-0 [&_[role=button]]:!bg-transparent"
                  label=""
                  hint=""
                  rounded={isReel ? '2xl' : '2xl'}
                  showReplaceRemove={false}
                />

                {/* Text Overlay Preview */}
                {mediaData && overlayText.trim().length > 0 && (
                  <div
                    className="pointer-events-none absolute inset-0 flex p-3"
                    style={{
                      justifyContent:
                        overlayPos.endsWith('left') ? 'flex-start' :
                        overlayPos.endsWith('right') ? 'flex-end' :
                        'center',
                      alignItems:
                        overlayPos.startsWith('top') ? 'flex-start' :
                        overlayPos.startsWith('bottom') ? 'flex-end' :
                        'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: `${Math.max(10, overlaySize * 0.4)}px`,
                        color: overlayColor === 'ffffff' ? '#fff' : '#000',
                        textShadow: overlayColor === 'ffffff'
                          ? '1px 1px 2px rgba(0,0,0,0.8)'
                          : '1px 1px 2px rgba(255,255,255,0.8)',
                        lineHeight: 1.2,
                        fontWeight: 700,
                        maxWidth: '90%',
                        wordBreak: 'break-word',
                        textAlign:
                          overlayPos.endsWith('left') ? 'left' :
                          overlayPos.endsWith('right') ? 'right' :
                          'center',
                      }}
                    >
                      {overlayText}
                    </div>
                  </div>
                )}

                {/* Media Type Badge */}
                {mediaData && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-md">
                    <span className="text-[9px] font-medium text-white uppercase tracking-wide">
                      {mediaData.type === 'video' ? 'Video' : mediaData.type === 'gif' ? 'GIF' : 'Photo'}
                    </span>
                  </div>
                )}

                {/* Hover Replace Button */}
                {mediaData && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-white text-xs font-medium px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                      Click to replace
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Overlay Controls Panel (Reels only) */}
            {isReel && (
              <div className={`flex-1 min-w-0 space-y-3 transition-all duration-300 ${mediaData ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                {/* Text Overlay Input */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Text overlay</label>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Add text to your reel..."
                    disabled={!mediaData}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400"
                    style={{ '--tw-ring-color': `${accentColor}66`, borderColor: undefined } as React.CSSProperties}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = ''; }}
                  />
                </div>

                {/* Size & Color Row */}
                <div className="flex gap-3">
                  {/* Size Slider */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-gray-600">Size</label>
                      <span className="text-[10px] text-gray-400 tabular-nums">{overlaySize}</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={72}
                      step={2}
                      value={overlaySize}
                      onChange={(e) => setOverlaySize(Number(e.target.value))}
                      disabled={!mediaData}
                      className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                      style={{ '--thumb-color': accentColor } as React.CSSProperties}
                    />
                    <style>{`
                      input[type="range"]::-webkit-slider-thumb { background-color: var(--thumb-color); }
                      input[type="range"]::-moz-range-thumb { background-color: var(--thumb-color); }
                    `}</style>
                  </div>

                  {/* Color Selection */}
                  <div className="w-20">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Color</label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOverlayColor('ffffff')}
                        disabled={!mediaData}
                        className="flex-1 h-6 rounded-md border transition-all duration-150 bg-white"
                        style={overlayColor === 'ffffff' ? {
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}30`
                        } : { borderColor: '#d1d5db' }}
                      />
                      <button
                        type="button"
                        onClick={() => setOverlayColor('000000')}
                        disabled={!mediaData}
                        className="flex-1 h-6 rounded-md border transition-all duration-150 bg-gray-900"
                        style={overlayColor === '000000' ? {
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}30`
                        } : { borderColor: '#d1d5db' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Position Grid */}
                <div className="flex flex-col items-center pt-2">
                  <label className="block text-[11px] font-medium text-gray-600 mb-2 self-start">Position</label>
                  <div className="grid grid-cols-3 gap-1 p-1.5 bg-gray-100 rounded-xl">
                    {(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as OverlayPos[]).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setOverlayPos(pos)}
                        disabled={!mediaData}
                        className={`
                          w-10 h-10 rounded-lg text-sm transition-all duration-150 flex items-center justify-center
                          ${overlayPos === pos
                            ? 'text-white font-medium'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                          }
                        `}
                        style={overlayPos === pos ? { backgroundColor: accentColor } : undefined}
                      >
                        {pos === 'top-left' && '↖'}
                        {pos === 'top-center' && '↑'}
                        {pos === 'top-right' && '↗'}
                        {pos === 'center-left' && '←'}
                        {pos === 'center' && '•'}
                        {pos === 'center-right' && '→'}
                        {pos === 'bottom-left' && '↙'}
                        {pos === 'bottom-center' && '↓'}
                        {pos === 'bottom-right' && '↘'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tip */}
                {!mediaData && (
                  <p className="text-[11px] text-gray-400 italic">
                    Upload media to customize text overlay
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Success indicator */}
          {mediaData && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Media added</span>
            </div>
          )}
        </div>
      );
    }

    if (step === STEPS.CONTENT) {
      // Reel caption - simple textarea
      if (postType === 'Reel') {
        return (
          <div className="flex flex-col gap-4">
            <Heading
              title="Add a caption"
              subtitle="Tell people about your reel (optional)"
            />
            <div className="relative w-full">
              <textarea
                className="w-full rounded-2xl p-4 shadow-sm text-sm resize-none min-h-[100px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                placeholder="Write a caption..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        );
      }

      // Text Post - styled card with preview (matching Reel layout)
      const textPostBackground = textBgType === 'gradient'
        ? `linear-gradient(135deg, ${textGradientStart}, ${textGradientEnd})`
        : textBgColor;

      const getTextAlignment = () => {
        if (textPosition.endsWith('left')) return 'left';
        if (textPosition.endsWith('right')) return 'right';
        return 'center';
      };

      const getJustifyContent = () => {
        if (textPosition.endsWith('left')) return 'flex-start';
        if (textPosition.endsWith('right')) return 'flex-end';
        return 'center';
      };

      const getAlignItems = () => {
        if (textPosition.startsWith('top')) return 'flex-start';
        if (textPosition.startsWith('bottom')) return 'flex-end';
        return 'center';
      };

      // Preset gradient options
      const gradientPresets = [
        { start: '#6366f1', end: '#ec4899', name: 'Purple Pink' },
        { start: '#f97316', end: '#eab308', name: 'Orange Yellow' },
        { start: '#10b981', end: '#06b6d4', name: 'Teal Cyan' },
        { start: '#8b5cf6', end: '#06b6d4', name: 'Violet Cyan' },
        { start: '#ef4444', end: '#f97316', name: 'Red Orange' },
        { start: '#3b82f6', end: '#8b5cf6', name: 'Blue Purple' },
      ];

      // Preset solid colors
      const solidPresets = [
        '#6366f1', '#ec4899', '#f97316', '#eab308',
        '#10b981', '#06b6d4', '#ef4444', '#3b82f6',
      ];

      return (
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create a text post
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Style your post with colors and positioning
            </p>
          </div>

          {/* Main Content Area */}
          <div className="flex gap-5 items-start">
            {/* Preview Container - Phone Frame Style */}
            <div
              className="relative flex-shrink-0"
              style={{ width: '180px' }}
            >
              {/* Phone Frame */}
              <div className="absolute -inset-1.5 rounded-[1.75rem] bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 shadow-lg -z-10" />

              <div
                className="relative rounded-[1.25rem] overflow-hidden"
                style={{
                  aspectRatio: '9/16',
                  background: textPostBackground,
                }}
              >
                {/* Text Content */}
                <div
                  className="absolute inset-0 flex p-3"
                  style={{
                    justifyContent: getJustifyContent(),
                    alignItems: getAlignItems(),
                  }}
                >
                  <p
                    className="text-white font-semibold break-words max-w-full"
                    style={{
                      fontSize: `${Math.max(10, textFontSize * 0.4)}px`,
                      textAlign: getTextAlignment(),
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      lineHeight: 1.3,
                    }}
                  >
                    {content || 'Your text here...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Text Input */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Your message</label>
                <textarea
                  className="w-full rounded-lg p-3 text-sm resize-none h-[70px] bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400"
                  style={{ '--tw-ring-color': `${accentColor}66` } as React.CSSProperties}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLoading}
                  onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; }}
                />
              </div>

              {/* Size & Background Row */}
              <div className="flex gap-3">
                {/* Size Slider */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Size</label>
                    <span className="text-[10px] text-gray-400 tabular-nums">{textFontSize}</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={48}
                    step={2}
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                    style={{ '--thumb-color': accentColor } as React.CSSProperties}
                  />
                  <style>{`
                    input[type="range"]::-webkit-slider-thumb { background-color: var(--thumb-color); }
                    input[type="range"]::-moz-range-thumb { background-color: var(--thumb-color); }
                  `}</style>
                </div>

                {/* Background Type */}
                <div className="w-24">
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Background</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTextBgType('gradient')}
                      className="flex-1 h-6 rounded-md border transition-all duration-150 text-[10px] font-medium"
                      style={textBgType === 'gradient' ? {
                        background: `linear-gradient(135deg, ${textGradientStart}, ${textGradientEnd})`,
                        borderColor: accentColor,
                        boxShadow: `0 0 0 2px ${accentColor}30`,
                        color: 'white'
                      } : { borderColor: '#d1d5db', color: '#6b7280' }}
                    >

                    </button>
                    <button
                      type="button"
                      onClick={() => setTextBgType('solid')}
                      className="flex-1 h-6 rounded-md border transition-all duration-150"
                      style={textBgType === 'solid' ? {
                        backgroundColor: textBgColor,
                        borderColor: accentColor,
                        boxShadow: `0 0 0 2px ${accentColor}30`
                      } : { borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                    />
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              {textBgType === 'gradient' ? (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-2">Gradient</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {gradientPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTextGradientStart(preset.start);
                          setTextGradientEnd(preset.end);
                        }}
                        className="w-7 h-7 rounded-md transition-all hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${preset.start}, ${preset.end})`,
                          boxShadow: textGradientStart === preset.start && textGradientEnd === preset.end
                            ? `0 0 0 2px white, 0 0 0 3px ${accentColor}`
                            : 'none',
                        }}
                        title={preset.name}
                      />
                    ))}
                    {/* Custom color pickers inline */}
                    <div className="flex items-center gap-1 ml-1">
                      <input
                        type="color"
                        value={textGradientStart}
                        onChange={(e) => setTextGradientStart(e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border border-gray-200"
                        title="Start color"
                      />
                      <span className="text-gray-400 text-xs">→</span>
                      <input
                        type="color"
                        value={textGradientEnd}
                        onChange={(e) => setTextGradientEnd(e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border border-gray-200"
                        title="End color"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-2">Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {solidPresets.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTextBgColor(color)}
                        className="w-7 h-7 rounded-md transition-all hover:scale-105"
                        style={{
                          backgroundColor: color,
                          boxShadow: textBgColor === color
                            ? `0 0 0 2px white, 0 0 0 3px ${accentColor}`
                            : 'none',
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={textBgColor}
                      onChange={(e) => setTextBgColor(e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border border-gray-200 ml-1"
                      title="Custom color"
                    />
                  </div>
                </div>
              )}

              {/* Position Grid - Centered like Reel */}
              <div className="flex flex-col items-center pt-2">
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-2 self-start">Position</label>
                <div className="grid grid-cols-3 gap-1 p-1.5 bg-gray-100 dark:bg-neutral-700 rounded-xl">
                  {(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as OverlayPos[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setTextPosition(pos)}
                      className={`
                        w-10 h-10 rounded-lg text-sm transition-all duration-150 flex items-center justify-center
                        ${textPosition === pos
                          ? 'text-white font-medium'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-neutral-600'
                        }
                      `}
                      style={textPosition === pos ? { backgroundColor: accentColor } : undefined}
                    >
                      {pos === 'top-left' && '↖'}
                      {pos === 'top-center' && '↑'}
                      {pos === 'top-right' && '↗'}
                      {pos === 'center-left' && '←'}
                      {pos === 'center' && '•'}
                      {pos === 'center-right' && '→'}
                      {pos === 'bottom-left' && '↙'}
                      {pos === 'bottom-center' && '↓'}
                      {pos === 'bottom-right' && '↘'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === STEPS.TAGS) {
      return (
        <div className="flex flex-col gap-4">
          <Heading
            title="Tag people & businesses"
            subtitle="Help others discover your post by tagging users and businesses (optional)"
          />

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, businesses, or shops..."
              disabled={isLoading}
              className={`
                w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl 
                outline-none focus:ring-2 focus:ring-[#60A5FA] bg-white
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />

            {/* Search Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                {/* Loading */}
                {isSearching && (
                  <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    Searching...
                  </div>
                )}

                {/* Too short */}
                {!isSearching && searchQuery.trim().length < 2 && (
                  <div className="px-4 py-3 text-sm text-gray-500">Type at least 2 characters...</div>
                )}

                {/* Empty */}
                {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
                )}

                {/* Results */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="py-2">
                    {searchResults.map((item) => {
                      const isSelected = selectedTags.find(t => t.id === item.id && t.type === item.type);
                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          className={`px-3 py-2 cursor-pointer flex items-center gap-3 transition-colors ${
                            isSelected ? "bg-green-50 opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                          }`}
                          onClick={() => !isSelected && handleTagSelect(item)}
                        >
                          {/* Thumbnail */}
                          <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                {getTagIcon(item.type)}
                              </div>
                            )}
                          </div>
                          {/* Text */}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-900 truncate">
                              {item.title}
                            </div>
                            {item.subtitle && (
                              <div className="text-xs text-gray-500 truncate">
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                          <div className="ml-auto text-[10px] uppercase tracking-wide text-gray-400">
                            {item.type}
                          </div>
                          {isSelected && (
                            <div className="ml-2 text-green-600">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800">Tagged:</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <div
                    key={`${tag.type}-${tag.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                  >
                    <div className="text-blue-600">
                      {getTagIcon(tag.type)}
                    </div>
                    <span className="text-blue-900">{tag.title}</span>
                    <button
                      onClick={() => handleTagRemove(tag.id, tag.type)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helper Text */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">
              Tagging helps people discover your post and shows it to followers of the tagged users and businesses.
            </p>
          </div>
        </div>
      );
    }

    // CATEGORY step
    return (
      <div className="flex flex-col gap-4">
        <Heading
          title="Choose a category"
          subtitle="Help people discover your post"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((item) => (
            <CategoryInput
              key={item.label}
              onClick={(category) => setCategory(category)}
              selected={category === item.label}
              label={item.label}
            />
          ))}
        </div>
      </div>
    );
  }, [step, postType, content, category, mediaData, isLoading, overlayText, overlaySize, overlayColor, overlayPos, previewDimensions, selectedTags, searchQuery, searchResults, isSearching, accentColor, textBgType, textBgColor, textGradientStart, textGradientEnd, textPosition, textFontSize]);

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={handleClose}
      title="Create a Post"
      actionLabel={actionLabel}
      onSubmit={onSubmit}
      secondaryAction={step === STEPS.TYPE ? undefined : handleSecondaryAction}
      secondaryActionLabel={secondaryActionLabel}
      body={bodyContent}
      disabled={isLoading}
    />
  );
};

export default CreatePostModal;