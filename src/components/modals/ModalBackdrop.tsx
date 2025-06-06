'use client';

import { useEffect, useRef } from 'react';

interface ModalBackdropProps {
  videoSrc: string;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; // ✅ Set half speed
    }
  }, []);

  return (
    <div className="fixed inset-0 z-1">
      <video
        ref={videoRef}
        className="absolute inset-0 object-cover w-full h-full filter grayscale"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-[#60A5FA]/60 backdrop-blur-sm" />
    </div>
  );
};

export default ModalBackdrop;
