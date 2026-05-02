'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import Button from '@/components/ui/Button';

interface CropModalProps {
  isOpen: boolean;
  imageSrc?: string;
  videoSrc?: string;
  aspect: number;
  onClose: () => void;
  onComplete: (croppedBlob: Blob) => void;
}

/**
 * Crop an image to a canvas and return a Blob.
 */
async function getCroppedImageBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      0.92,
    );
  });
}

/**
 * Crop a video frame-by-frame to a canvas, encode as webm blob.
 * Uses MediaRecorder to capture the cropped canvas stream.
 */
async function getCroppedVideoBlob(
  videoSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.src = videoSrc;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(30);
  // Capture audio if present
  try {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.connect(audioCtx.destination);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  } catch {
    // no audio track or not supported — continue without audio
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  recorder.start();
  video.currentTime = 0;
  await video.play();

  const drawFrame = () => {
    if (video.ended || video.paused) {
      recorder.stop();
      return;
    }
    ctx.drawImage(
      video,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );
    requestAnimationFrame(drawFrame);
  };
  drawFrame();

  video.onended = () => recorder.stop();

  return done;
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  videoSrc,
  aspect,
  onClose,
  onComplete,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const mediaSrc = imageSrc || videoSrc || '';
  const isVideo = !!videoSrc;

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = isVideo
        ? await getCroppedVideoBlob(videoSrc!, croppedAreaPixels)
        : await getCroppedImageBlob(imageSrc!, croppedAreaPixels);
      onComplete(blob);
    } catch {
      // silently handled — user can retry
    } finally {
      setSaving(false);
    }
  }, [croppedAreaPixels, imageSrc, videoSrc, isVideo, onComplete]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] backdrop-blur-sm bg-stone-900/60 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div
          className="relative w-full max-w-lg mx-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="transform transition-all duration-200 ease-out will-change-transform translate-y-0 opacity-100 scale-100">
            <div className="relative flex flex-col w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/60 dark:border-stone-700/60 rounded-2xl shadow-elevation-4 overflow-hidden">

              {/* Crop area */}
              <div className="relative w-full" style={{ height: '400px' }}>
                <Cropper
                  {...(isVideo ? { video: mediaSrc } : { image: mediaSrc })}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { borderRadius: '16px 16px 0 0' },
                  }}
                />
              </div>

              {/* Zoom slider */}
              <div className="px-8 pt-5 pb-2">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400 flex-shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-900 dark:[&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:shadow-elevation-1 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400 flex-shrink-0">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-8 pb-6 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={saving}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  fullWidth
                  loading={saving}
                  disabled={!croppedAreaPixels}
                  onClick={handleSave}
                >
                  {saving && isVideo ? 'Processing...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
