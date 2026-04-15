interface BouncingDotsProps {
  className?: string;
  tone?: 'dark' | 'light';
}

export default function BouncingDots({ className = '', tone = 'dark' }: BouncingDotsProps) {
  const color = tone === 'dark' ? 'bg-black' : 'bg-white';
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${color} animate-[bounce_1s_ease-in-out_infinite]`} />
      <div className={`w-1.5 h-1.5 rounded-full ${color} animate-[bounce_1s_ease-in-out_0.15s_infinite]`} />
      <div className={`w-1.5 h-1.5 rounded-full ${color} animate-[bounce_1s_ease-in-out_0.3s_infinite]`} />
    </div>
  );
}
