// components/feed/TikTokView.tsx
'use client';

const styles = `
  .ultra-smooth {
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .video-controls {
    background: transparent;
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { SafePost, SafeUser, SafeListing, SafeEmployee, SafeShop } from '@/app/types';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

type ContentItem = {
  type: 'post' | 'listing' | 'employee' | 'shop';
  data: any;
  listingContext?: any;
};

interface TikTokViewProps {
  items: ContentItem[];
  currentUser: SafeUser | null;
  onClose?: () => void;
}

const TikTokView: React.FC<TikTokViewProps> = ({ items, currentUser, onClose }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [videoStates, setVideoStates] = useState<Map<string, {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isMuted: boolean;
  }>>(new Map());
  const canScrollRef = useRef(true);
  const accumulatedDelta = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchVelocityRef = useRef(0);
  const lastTouchY = useRef(0);
  const lastTouchTime = useRef(0);

  // Trigger modal animation when opening
  useEffect(() => {
    if (!showModal && !isClosing) {
      requestAnimationFrame(() => {
        setShowModal(true);
      });
    }
  }, [showModal, isClosing]);

  // Manage body overflow
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setShowModal(false);
    document.body.style.overflow = '';
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
    }, 300);
  };

  // Video functions
  const getVideoState = (itemId: string) => {
    return videoStates.get(itemId) || {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isMuted: true
    };
  };

  const createVideoRefCallback = (itemId: string) => (element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(itemId, element);

      const handleTimeUpdate = () => {
        setVideoStates(prev => {
          const newMap = new Map(prev);
          newMap.set(itemId, {
            ...getVideoState(itemId),
            currentTime: element.currentTime,
            duration: element.duration || 0,
            isPlaying: !element.paused
          });
          return newMap;
        });
      };

      const handleLoadedMetadata = () => {
        setVideoStates(prev => {
          const newMap = new Map(prev);
          newMap.set(itemId, {
            ...getVideoState(itemId),
            duration: element.duration || 0
          });
          return newMap;
        });
      };

      element.addEventListener('timeupdate', handleTimeUpdate);
      element.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        element.removeEventListener('timeupdate', handleTimeUpdate);
        element.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    } else {
      videoRefs.current.delete(itemId);
    }
  };

  const handlePlayPause = (itemId: string) => {
    const video = videoRefs.current.get(itemId);
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      setVideoStates(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, {
          ...getVideoState(itemId),
          isPlaying: !video.paused
        });
        return newMap;
      });
    }
  };

  const handleMuteToggle = (itemId: string) => {
    const video = videoRefs.current.get(itemId);
    if (video) {
      video.muted = !video.muted;
      setVideoStates(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, {
          ...getVideoState(itemId),
          isMuted: video.muted
        });
        return newMap;
      });
    }
  };

  const handleProgressClick = (itemId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRefs.current.get(itemId);
    if (video && video.duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      video.currentTime = percentage * video.duration;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation function
  const navigateToItem = useCallback((direction: 1 | -1) => {
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= items.length || !canScrollRef.current) {
      return;
    }

    canScrollRef.current = false;
    setCurrentIndex(targetIndex);

    setTimeout(() => {
      canScrollRef.current = true;
    }, 600);
  }, [currentIndex, items.length]);

  // Wheel handling
  useEffect(() => {
    if (!containerRef.current || items.length <= 1) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (!canScrollRef.current) return;

      accumulatedDelta.current += e.deltaY;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const threshold = 25;

        if (Math.abs(accumulatedDelta.current) >= threshold) {
          const direction = accumulatedDelta.current > 0 ? 1 : -1;
          accumulatedDelta.current = 0;
          navigateToItem(direction);
        } else {
          accumulatedDelta.current = 0;
        }
      }, 20);
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel, true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [navigateToItem, items.length]);

  // Keyboard navigation
  useEffect(() => {
    let keyDebounceTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canScrollRef.current) return;

      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.contentEditable === 'true' ||
                          target.isContentEditable;

      if (keyDebounceTimeout) {
        clearTimeout(keyDebounceTimeout);
      }

      switch (e.key) {
        case 'ArrowUp':
          if (!isInputField) {
            e.preventDefault();
            keyDebounceTimeout = setTimeout(() => navigateToItem(-1), 50);
          }
          break;
        case 'ArrowDown':
          if (!isInputField) {
            e.preventDefault();
            keyDebounceTimeout = setTimeout(() => navigateToItem(1), 50);
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (keyDebounceTimeout) {
        clearTimeout(keyDebounceTimeout);
      }
    };
  }, [navigateToItem]);

  // Touch handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (items.length <= 1 || !canScrollRef.current) return;

    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchStartTime(Date.now());
    setIsDragging(true);
    setDragOffset(0);

    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
    touchVelocityRef.current = 0;
  }, [items.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || items.length <= 1 || !canScrollRef.current) return;

    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaY = touch.clientY - lastTouchY.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      touchVelocityRef.current = deltaY / deltaTime;
    }

    const rawOffset = touch.clientY - touchStartY;
    let offset = rawOffset;

    if ((currentIndex === 0 && offset > 0) ||
        (currentIndex === items.length - 1 && offset < 0)) {
      offset = rawOffset * 0.3;
    }

    setDragOffset(offset);

    lastTouchY.current = touch.clientY;
    lastTouchTime.current = currentTime;
  }, [isDragging, touchStartY, currentIndex, items.length]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !canScrollRef.current) return;

    setIsDragging(false);

    const velocity = touchVelocityRef.current;
    const offset = dragOffset;
    const duration = Date.now() - touchStartTime;

    const velocityThreshold = 0.5;
    const distanceThreshold = window.innerHeight * 0.15;
    const quickSwipeTime = 150;

    let shouldNavigate = false;
    let direction: 1 | -1 = 1;

    if (Math.abs(velocity) > velocityThreshold) {
      shouldNavigate = true;
      direction = velocity < 0 ? 1 : -1;
    } else if (Math.abs(offset) > distanceThreshold) {
      shouldNavigate = true;
      direction = offset < 0 ? 1 : -1;
    } else if (duration < quickSwipeTime && Math.abs(offset) > 30) {
      shouldNavigate = true;
      direction = offset < 0 ? 1 : -1;
    }

    if (shouldNavigate && canScrollRef.current) {
      navigateToItem(direction);
    } else {
      setDragOffset(0);
    }

    setTimeout(() => setDragOffset(0), 50);
  }, [isDragging, dragOffset, touchStartTime, navigateToItem]);

  const handleProfileClick = (userId: string) => {
    handleClose();
    setTimeout(() => {
      router.push(`/profile/${userId}`);
    }, 300);
  };

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  const renderCard = (item: ContentItem, index: number) => {
    const isReel = item.type === 'post' && (item.data.tag === 'reel' || item.data.postType === 'reel');
    const videoState = item.type === 'post' && item.data.id ? getVideoState(item.data.id) : null;
    const formattedDate = item.data.createdAt ? format(new Date(item.data.createdAt), 'PPP') : '';

    if (isReel) {
      // Full screen reel style
      return (
        <div className="w-full h-full relative">
          {(item.data.mediaUrl || item.data.imageSrc) ? (
            item.data.mediaType === 'video' ? (
              <video
                ref={createVideoRefCallback(item.data.id)}
                src={item.data.mediaUrl || item.data.imageSrc}
                className="w-full h-full object-cover"
                autoPlay={index === currentIndex}
                muted={videoState?.isMuted ?? true}
                loop
                controls={false}
                playsInline
              />
            ) : (
              <Image
                src={item.data.mediaUrl || item.data.imageSrc}
                alt="Reel"
                fill
                className="object-cover"
                priority={Math.abs(index - currentIndex) <= 1}
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
              <p className="text-white text-2xl text-center px-8 max-w-2xl leading-relaxed">{item.data.content}</p>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-20">
            <div className="video-controls px-4 py-3 rounded-xl max-w-lg">
              {/* Caption with truncation */}
              {item.data.content && (
                <div className="mb-3">
                  <p className="font-semibold text-white text-sm mb-1">{item.data.user?.name || 'Anonymous'}</p>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{item.data.content}</p>
                </div>
              )}

              {item.data.mediaType === 'video' && videoState && (
                <div className="space-y-2">
                  {/* Progress bar */}
                  <div
                    className="w-full h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
                    onClick={(e) => handleProgressClick(item.data.id, e)}
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-150"
                      style={{ width: `${videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Controls row */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayPause(item.data.id)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
                      >
                        {videoState.isPlaying ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        )}
                      </button>

                      <span className="font-mono text-white/90 text-xs">
                        {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleMuteToggle(item.data.id)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
                    >
                      {videoState.isMuted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Regular card style (centered with max-width)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative overflow-hidden w-full max-w-md mx-auto h-[700px] flex flex-col rounded-2xl">
          {item.type === 'post' && (
            <>
              {(item.data.mediaUrl || item.data.imageSrc) ? (
                item.data.mediaType === 'video' ? (
                  <>
                    <video
                      ref={createVideoRefCallback(item.data.id)}
                      src={item.data.mediaUrl || item.data.imageSrc}
                      className="w-full flex-1 object-cover"
                      controls={false}
                      autoPlay={index === currentIndex}
                      muted={videoState?.isMuted ?? true}
                      loop
                      playsInline
                    />

                    <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                      <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                        {item.data.content && (
                          <div className="mb-3">
                            <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{item.data.content}</p>
                          </div>
                        )}

                        {videoState && (
                          <div className="space-y-2">
                            {/* Progress bar */}
                            <div
                              className="w-full h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
                              onClick={(e) => handleProgressClick(item.data.id, e)}
                            >
                              <div
                                className="h-full bg-white rounded-full transition-all duration-150"
                                style={{ width: `${videoState.duration ? (videoState.currentTime / videoState.duration) * 100 : 0}%` }}
                              />
                            </div>

                            {/* Controls row */}
                            <div className="flex items-center justify-between text-white text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePlayPause(item.data.id)}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
                                >
                                  {videoState.isPlaying ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                      <rect x="6" y="4" width="4" height="16" rx="1" />
                                      <rect x="14" y="4" width="4" height="16" rx="1" />
                                    </svg>
                                  ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                      <polygon points="5,3 19,12 5,21" />
                                    </svg>
                                  )}
                                </button>

                                <span className="font-mono text-white/90 text-xs">
                                  {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                                </span>
                              </div>

                              <button
                                onClick={() => handleMuteToggle(item.data.id)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-full transition-all"
                              >
                                {videoState.isMuted ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                    <line x1="23" y1="9" x2="17" y2="15" />
                                    <line x1="17" y1="9" x2="23" y2="15" />
                                  </svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative flex-1">
                    <Image src={item.data.mediaUrl || item.data.imageSrc} alt="Post media" fill className="object-cover" />

                    <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                      <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            onClick={() => handleProfileClick(item.data.user.id)}
                            className="relative w-10 h-10 hover:scale-110 transition-transform duration-200 cursor-pointer flex-shrink-0"
                          >
                            <Image
                              src={item.data.user.image || '/images/placeholder.jpg'}
                              alt={item.data.user.name || 'User'}
                              fill
                              className="rounded-full object-cover border-2 border-white/20"
                            />
                          </button>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.data.user.name || 'Anonymous'}</p>
                            <p className="text-xs text-white/70">{formattedDate}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <p className={`text-sm leading-relaxed text-white/90 flex-1 ${showFullCaption ? '' : 'line-clamp-1'}`}>
                            {item.data.content}
                          </p>
                          {item.data.content && item.data.content.length > 80 && (
                            <button
                              onClick={() => setShowFullCaption(!showFullCaption)}
                              className="text-white/70 text-xs font-semibold hover:text-white transition-colors flex-shrink-0 drop-shadow-lg px-2 py-1 rounded-full hover:bg-white/10"
                            >
                              {showFullCaption ? 'less' : 'more'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex-1 bg-white flex items-center justify-center p-8 relative">
                  <p className="text-gray-900 text-lg text-center leading-relaxed">{item.data.content}</p>

                  <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                    <div className="video-controls rounded-2xl p-6 text-white shadow-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <button
                          onClick={() => handleProfileClick(item.data.user.id)}
                          className="relative w-10 h-10 hover:scale-110 transition-transform duration-200 cursor-pointer flex-shrink-0"
                        >
                          <Image
                            src={item.data.user.image || '/images/placeholder.jpg'}
                            alt={item.data.user.name || 'User'}
                            fill
                            className="rounded-full object-cover border-2 border-white/20"
                          />
                        </button>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.data.user.name || 'Anonymous'}</p>
                          <p className="text-xs text-white/70">{formattedDate}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <p className={`text-sm leading-relaxed text-white/90 flex-1 ${showFullCaption ? '' : 'line-clamp-1'}`}>
                          {item.data.content}
                        </p>
                        {item.data.content && item.data.content.length > 80 && (
                          <button
                            onClick={() => setShowFullCaption(!showFullCaption)}
                            className="text-white/70 text-xs font-semibold hover:text-white transition-colors flex-shrink-0 drop-shadow-lg px-2 py-1 rounded-full hover:bg-white/10"
                          >
                            {showFullCaption ? 'less' : 'more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {item.type === 'listing' && (
            <>
              {item.data.imageSrc && (
                <div className="relative flex-1">
                  <Image
                    src={item.data.imageSrc}
                    alt="Listing"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
                  <p className="font-semibold text-lg mb-1">{item.data.title}</p>
                  <p className="text-sm text-white/80">${item.data.price}/day</p>
                </div>
              </div>
            </>
          )}

          {item.type === 'shop' && (
            <>
              {item.data.image && (
                <div className="relative flex-1">
                  <Image
                    src={item.data.image}
                    alt="Shop"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
                  <p className="font-semibold text-lg mb-1">{item.data.name}</p>
                  <p className="text-sm text-white/80 line-clamp-2">{item.data.description}</p>
                </div>
              </div>
            </>
          )}

          {item.type === 'employee' && (
            <>
              {item.listingContext?.imageSrc && (
                <div className="relative flex-1">
                  <Image
                    src={item.listingContext.imageSrc}
                    alt="Professional"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 px-4 z-30">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 text-white shadow-2xl">
                  <p className="font-semibold text-lg mb-1">{item.data.name}</p>
                  <p className="text-sm text-white/80">{item.data.position}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{styles}</style>

      {/* Backdrop with fade */}
      <div
        className={`fixed inset-0 z-40 bg-neutral-900/70 transition-opacity duration-300 ${
          showModal ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: showModal ? 'auto' : 'none' }}
        onClick={handleClose}
      />

      {/* Modal content with slide-up animation */}
      <div
        ref={containerRef}
        className={`fixed inset-0 z-50 overflow-hidden ultra-smooth duration-300 transform transition-all ${
          showModal ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: 'pan-y pinch-zoom',
          overscrollBehavior: 'none',
          pointerEvents: showModal ? 'auto' : 'none',
          willChange: 'transform, opacity'
        }}
      >
        {/* Continuous scroll container */}
        <div
          className="relative w-full transition-opacity duration-300"
          style={{
            height: `${items.length * 100}vh`,
            transform: `translate3d(0, ${(-currentIndex * 100) + (isDragging ? (dragOffset / window.innerHeight) * 100 : 0)}vh, 0)`,
            transition: isDragging ? 'none' : showModal ? 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s' : 'opacity 0.3s',
            willChange: 'transform, opacity',
            opacity: showModal ? 1 : 0
          }}
        >
          {items.map((item, index) => (
            <div
              key={`${item.type}-${item.data.id}-${index}`}
              className="absolute top-0 left-0 w-full h-screen"
              style={{
                transform: `translate3d(0, ${index * 100}vh, 0)`,
                willChange: 'transform'
              }}
            >
              {renderCard(item, index)}
            </div>
          ))}
        </div>

        {/* Side action buttons */}
        <div
          className={`fixed top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-6 text-white z-30 transition-opacity duration-300 ${
            currentItem?.type === 'post' && (currentItem.data.tag === 'reel' || currentItem.data.postType === 'reel') ? 'right-6' : 'left-1/2 ml-[calc(192px+60px)]'
          }`}
          style={{ opacity: showModal ? 1 : 0 }}
        >
          <div className="flex flex-col items-center gap-2">
            <button onClick={handleClose} className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" />
              </svg>
            </button>
            <span className="text-xs">Close</span>
          </div>

          {currentItem?.type === 'post' && currentItem.data.user && (
            <button
              onClick={() => handleProfileClick(currentItem.data.user.id)}
              className="border border-white rounded-full hover:scale-110 transition-transform duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 relative">
                <Image
                  src={currentItem.data.user.image || '/images/placeholder.jpg'}
                  alt={currentItem.data.user.name || 'User'}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            </button>
          )}

          <div className="flex flex-col items-center gap-2">
            <button className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" />
              </svg>
            </button>
            <span className="text-xs">
              {currentItem?.type === 'post' ? (currentItem.data.likes?.length || 0) : 0}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M8 13.5H16M8 8.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 17.5C6.29454 18.5019 5.37769 20.6665 6.31569 21.3651C6.806 21.7218 7.58729 21.3408 9.14987 20.5789C10.2465 20.0441 11.3562 19.4309 12.5546 19.155C12.9931 19.0551 13.4395 19.0125 14 19C17.7712 19 19.6569 19 20.8284 17.8284C22 16.6569 22 14.7712 22 11V10.5C22 6.72876 22 4.84315 20.8284 3.67157C19.6569 2.5 17.7712 2.5 14 2.5H10C6.22876 2.5 4.34315 2.5 3.17157 3.67157C2 4.84315 2 6.72876 2 10.5V11C2 14.7712 2 16.6569 3.17157 17.8284C3.82475 18.4816 4.7987 18.8721 6.09881 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-xs">
              {currentItem?.type === 'post' ? (currentItem.data.comments?.length || 0) : 0}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z" />
              </svg>
            </button>
            <span className="text-xs">
              {currentItem?.type === 'post' ? (currentItem.data.bookmarks?.length || 0) : 0}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button className="hover:scale-110 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
                <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
              </svg>
            </button>
            <span className="text-xs">Share</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TikTokView;
