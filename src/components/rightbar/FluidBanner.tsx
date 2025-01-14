'use client';

import { useEffect, useRef } from 'react';

interface FluidBannerProps {
  onClick?: () => void;
}

const FluidBanner: React.FC<FluidBannerProps> = ({ onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Setup canvas context and shaders here
    // Set canvas size to match container
    const updateCanvasSize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    updateCanvasSize();

    // Initialize WebGL here similar to your provided code
    // but scoped to banner size

    // Add mouse event listeners scoped to banner
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Update fluid simulation with x, y coordinates
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-32 rounded-2xl overflow-hidden relative cursor-pointer bg-[#091b27]"
      onClick={onClick}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-2xl font-bold text-white">
          Subscribe Today
        </h1>
      </div>
    </div>
  );
};

export default FluidBanner;