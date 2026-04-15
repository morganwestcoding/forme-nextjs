import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function Logo({
  width = 72,
  height = 46,
  className = 'opacity-90 hover:opacity-100 transition-opacity duration-200',
  priority = false,
}: LogoProps) {
  return (
    <>
      <Image
        src="/logos/fm-logo.png"
        alt="ForMe"
        width={width}
        height={height}
        priority={priority}
        className={`block dark:hidden ${className}`}
      />
      <Image
        src="/logos/fm-logo-white.png"
        alt="ForMe"
        width={width}
        height={height}
        priority={priority}
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
