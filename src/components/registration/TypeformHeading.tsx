'use client';

interface TypeformHeadingProps {
  question: string;
  subtitle?: string;
  stepNumber?: number;
}

export default function TypeformHeading({ question, subtitle, stepNumber }: TypeformHeadingProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
        {stepNumber && (
          <span className="text-gray-400 mr-3">{stepNumber} →</span>
        )}
        {question}
      </h1>
      {subtitle && (
        <p className="text-base sm:text-lg text-gray-500 mt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
}
