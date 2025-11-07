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

/** ================== Cloudinary text overlay helpers ================== */

type OverlayPos =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

const OVERLAY_MARGIN_PX = 20;   // Increased margin for better visibility
const WRAP_PERCENT = 0.85;      // Reduced for better text wrapping

function encodeTextForOverlay(text: string) {
  return encodeURIComponent(text)
    .replace(/%20/g, '%2520')  // Double-encode spaces
    .replace(/%2C/g, '%252C')
    .replace(/%2F/g, '%252F');
}

function posToGravity(pos: OverlayPos) {
  switch (pos) {
    case 'top-left': return 'north_west';
    case 'top-center': return 'north';
    case 'top-right': return 'north_east';
    case 'center-left': return 'west';
    case 'center': return 'center';
    case 'center-right': return 'east';
    case 'bottom-left': return 'south_west';
    case 'bottom-center': return 'south';
    case 'bottom-right': return 'south_east';
  }
}

function buildCloudinaryOverlayUrl(
  originalUrl: string,
  {
    text,
    sizePx,
    color = 'ffffff',
    pos = 'bottom-center' as OverlayPos,
    font = 'Arial',
    weight = 'bold',
  }: {
    text: string;
    sizePx: number;
    color?: string;
    pos?: OverlayPos;
    font?: string;
    weight?: 'thin' | 'light' | 'normal' | 'bold' | 'black';
  }
) {
  if (!originalUrl.includes('/upload/')) return originalUrl;

  const i = originalUrl.indexOf('/upload/');
  const prefix = originalUrl.slice(0, i + '/upload/'.length);
  const suffix = originalUrl.slice(i + '/upload/'.length);

  const encodedText = encodeTextForOverlay(text);
  const gravity = posToGravity(pos);
  
  // Calculate proper offsets based on position
  let xOffset = '';
  let yOffset = '';
  
  if (pos.includes('left')) xOffset = `,x_${OVERLAY_MARGIN_PX}`;
  if (pos.includes('right')) xOffset = `,x_-${OVERLAY_MARGIN_PX}`;
  if (pos.includes('top')) yOffset = `,y_${OVERLAY_MARGIN_PX}`;
  if (pos.includes('bottom')) yOffset = `,y_-${OVERLAY_MARGIN_PX}`;

  const clampedSize = Math.max(16, Math.min(200, Math.floor(sizePx)));
  
  // Build the text layer with proper encoding
  const textLayer = `l_text:${font}_${clampedSize}_${weight}:${encodedText}`;
  const colorLayer = `co_rgb:${color}`;
  const wrapLayer = `c_fit,w_${WRAP_PERCENT},fl_relative`;
  
  // Apply positioning
  const positionLayer = `fl_layer_apply,g_${gravity}${xOffset}${yOffset}`;

  return `${prefix}${textLayer},${colorLayer},${wrapLayer}/${positionLayer}/${suffix}`;
}

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

const postTypes = [
  {
    label: 'Reel',
    color: 'bg-[#60A5FA]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M2.50012 7.5H21.5001" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M17.0001 2.5L14.0001 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10.0001 2.5L7.00012 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.9531 14.8948C14.8016 15.5215 14.0857 15.9644 12.6539 16.8502C11.2697 17.7064 10.5777 18.1346 10.0199 17.9625C9.78934 17.8913 9.57925 17.7562 9.40982 17.57C9 17.1198 9 16.2465 9 14.5C9 12.7535 9 11.8802 9.40982 11.4299C9.57925 11.2438 9.78934 11.1087 10.0199 11.0375C10.5777 10.8654 11.2697 11.2936 12.6539 12.1498C14.0857 13.0356 14.8016 13.4785 14.9531 14.1052C15.0156 14.3639 15.0156 14.6361 14.9531 14.8948Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'Text Post',
    color: 'bg-[#10B981]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M20 18V6M6 20H18M18 4H6M4 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.99901 10C7.70512 8.43128 8.73403 8.05948 11.9564 8M11.9564 8C14.9534 8.06735 16.1887 8.30534 15.9138 10M11.9564 8V16M10.4724 16H13.4405" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 2H19C18.4477 2 18 2.44772 18 3V5C18 5.55228 18.4477 6 19 6H21C21.5523 6 22 5.55228 22 5V3C22 2.44772 21.5523 2 21 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 2H3C2.44772 2 2 2.44772 2 3V5C2 5.55228 2.44772 6 3 6H5C5.55228 6 6 5.55228 6 5V3C6 2.44772 5.55228 2 5 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M21 18H19C18.4477 18 18 18.4477 18 19V21C18 21.5523 18.4477 22 19 22H21C21.5523 22 22 21.5523 22 21V19C22 18.4477 21.5523 18 21 18Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 18H3C2.44772 18 2 18.4477 2 19V21C2 21.5523 2.44772 22 3 22H5C5.55228 22 6 21.55228 6 21V19C6 18.44772 5.55228 18 5 18Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    label: 'Ad',
    color: 'bg-[#F59E0B]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

/** ================== Component ================== */

const CreatePostModal = () => {
  const router = useRouter();
  const modal = useCreatePostModal();
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

    // Better scaling calculation for Cloudinary
    const assetW = mediaData?.width || 1080; // Default width if not available
    const previewW = previewDimensions.width || 400; // Default preview width
    
    // Calculate scaled font size with better ratio
    const scaleFactor = assetW / previewW;
    const sizePx = Math.round(overlaySize * scaleFactor * 0.8); // Slight reduction for better appearance

    let finalMediaUrl = mediaData?.url || null;
    let overlayMeta: any = null;

    if (postType === 'Reel' && mediaData && overlayText.trim()) {
      overlayMeta = {
        text: overlayText.trim(),
        sizeCssPx: overlaySize,
        sizePx,
        color: overlayColor,
        pos: overlayPos,
        font: 'Arial',
        weight: 'bold',
        assetWidth: assetW,
        previewWidth: previewW,
        scaleFactor,
      };
      
      finalMediaUrl = buildCloudinaryOverlayUrl(mediaData.url, {
        text: overlayMeta.text,
        sizePx,
        color: overlayMeta.color,
        pos: overlayMeta.pos,
        font: 'Arial',
        weight: 'bold',
      });
    }

    const postData = {
      content: content || '',
      category,
      mediaUrl: finalMediaUrl,
      mediaType: mediaData?.type || null,
      imageSrc: mediaData?.type === 'image' ? finalMediaUrl : null,
      location: null,
      tag: postType,
      postType,
      mediaOverlay: overlayMeta,
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
              <div
                key={type.label}
                onClick={() => setPostType(type.label)}
                className={`
                  rounded-xl p-4 shadow flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                  ${postType === type.label ? 'bg-[#60A5FA] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}
                `}
              >
                <div className="w-5 h-5">{type.icon}</div>
                <span className="text-xs">{type.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step === STEPS.MEDIA) {
      const showOverlayControls = postType === 'Reel';
      return (
        <div className="space-y-6">
          {/* Heading */}
          <Heading title="Media" subtitle="Upload your content" />

          {/* Upload Area with Controls */}
          <div className="flex gap-6 items-center">
            {/* Upload Rectangle */}
            <div ref={previewRef} className="flex-shrink-0" style={{ width: '240px' }}>
              <div className="relative" style={{ aspectRatio: '9/16' }}>
                <MediaUpload
                  onMediaUpload={setMediaData}
                  currentMedia={mediaData}
                  ratio="free"
                  heightClass="h-full"
                  className="!h-full"
                  label=""
                  hint=""
                  rounded="2xl"
                />

                {/* Improved overlay preview */}
                {mediaData && overlayText.trim().length > 0 && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center p-5"
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
                      className="relative"
                      style={{
                        fontSize: `${overlaySize}px`,
                        color: overlayColor === 'ffffff' ? '#fff' : '#000',
                        textShadow: overlayColor === 'ffffff'
                          ? '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.3)'
                          : '2px 2px 4px rgba(255,255,255,0.7), 0 0 8px rgba(255,255,255,0.3)',
                        lineHeight: 1.2,
                        fontWeight: 700,
                        maxWidth: `${WRAP_PERCENT * 100}%`,
                        wordBreak: 'break-word',
                        textAlign:
                          overlayPos.endsWith('left') ? 'left' :
                          overlayPos.endsWith('right') ? 'right' :
                          'center',
                        padding: '4px 8px',
                      }}
                    >
                      {overlayText}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Overlay controls on the right */}
            {showOverlayControls && (
              <div className="flex-1 space-y-4">
                {/* Text Input */}
                <div>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Add text overlay (optional)"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Size Control */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <div className="text-xs font-medium text-neutral-600 mb-2">Size</div>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    step={2}
                    value={overlaySize}
                    onChange={(e) => setOverlaySize(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-xs text-neutral-500 text-center mt-1">{overlaySize}px</div>
                </div>

                {/* Color Control */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <div className="text-xs font-medium text-neutral-600 mb-2">Color</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setOverlayColor('ffffff')}
                      className={`flex-1 h-10 rounded-lg border-2 transition-all ${
                        overlayColor === 'ffffff'
                          ? 'border-blue-500 bg-white shadow-sm'
                          : 'border-neutral-300 bg-white hover:border-neutral-400'
                      }`}
                      title="White"
                    />
                    <button
                      onClick={() => setOverlayColor('000000')}
                      className={`flex-1 h-10 rounded-lg border-2 transition-all ${
                        overlayColor === '000000'
                          ? 'border-blue-500 bg-black shadow-sm'
                          : 'border-neutral-300 bg-black hover:border-neutral-400'
                      }`}
                      title="Black"
                    />
                  </div>
                </div>

                {/* Position Control */}
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                  <div className="text-xs font-medium text-neutral-600 mb-2">Position</div>
                  <select
                    value={overlayPos}
                    onChange={(e) => setOverlayPos(e.target.value as OverlayPos)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mt-1"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top</option>
                    <option value="top-right">Top Right</option>
                    <option value="center-left">Left</option>
                    <option value="center">Center</option>
                    <option value="center-right">Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {mediaData && (
            <div className="text-center text-sm text-neutral-600">
              {mediaData.type === 'video' ? 'Video' :
               mediaData.type === 'gif' ? 'GIF' : 'Image'} uploaded successfully
            </div>
          )}
        </div>
      );
    }

    if (step === STEPS.CONTENT) {
      return (
        <div className="flex flex-col gap-4">
          <Heading
            title={postType === 'Reel' ? 'Add a caption' : 'Write your post'}
            subtitle={postType === 'Reel' ? 'Tell people about your reel (optional)' : 'Share your thoughts'}
          />
          <div className="relative w-full">
            <textarea
              className="w-full rounded-2xl p-4 shadow-sm text-sm resize-none min-h-[100px] bg-white border border-neutral-200"
              placeholder={postType === 'Reel' ? 'Write a caption...' : "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
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
  }, [step, postType, content, category, mediaData, isLoading, overlayText, overlaySize, overlayColor, overlayPos, previewDimensions, selectedTags, searchQuery, searchResults, isSearching]);

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