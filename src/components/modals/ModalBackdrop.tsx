'use client';

interface ModalBackdropProps {
  videoSrc: string;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ videoSrc }) => {
  return (
    <div className="fixed inset-0 z-1">
      <video
        className="absolute inset-0 object-cover w-full h-full filter grayscale"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="absolute inset-0 bg-[#60A5FA]/50 backdrop-blur-sm" />
    </div>
  );
};

export default ModalBackdrop;
