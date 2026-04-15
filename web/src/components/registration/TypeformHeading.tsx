'use client';

interface TypeformHeadingProps {
  question: string;
  subtitle?: string;
  stepNumber?: number;
}

export default function TypeformHeading({ question, subtitle, stepNumber }: TypeformHeadingProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-stone-900 dark:text-stone-100 leading-tight">
        {stepNumber && (
          <span className="text-stone-400 dark:text-stone-500 mr-3">{stepNumber} →</span>
        )}
        {question}
      </h1>
      {subtitle && (
        <p className="text-base sm:text-lg text-stone-500  dark:text-stone-500 mt-3">
          {subtitle}
        </p>
      )}
    </div>
  );
}
