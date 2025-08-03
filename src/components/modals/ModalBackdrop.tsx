'use client';

import { useEffect, useRef } from 'react';

interface ModalBackdropProps {
  videoSrc: string;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0; // ✅ Set half speed
    }
  }, []);

  return (
    <div className="fixed inset-0 z-1">
      <video
        ref={videoRef}
        className="absolute inset-0 object-cover w-full h-full filter"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0  " />
    </div>
  );
};

export default ModalBackdrop;
