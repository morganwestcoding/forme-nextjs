// components/RotatingText.tsx
'use client';

import { useEffect } from 'react';
import { cn } from "@/lib/utils"; // Assuming you have this utility

const words = [
  { text: "awesome", color: "text-[#e74c3c]" },
  { text: "beautiful", color: "text-[#8e44ad]" },
  { text: "creative", color: "text-[#3498db]" },
  { text: "fabulous", color: "text-[#2ecc71]" },
  { text: "inspiring", color: "text-[#f1c40f]" }
];

export default function RotatingText() {
  useEffect(() => {
    const wordElements = document.querySelectorAll(".word");
    
    // Split words into letters
    wordElements.forEach(word => {
      const letters = word.textContent?.split("") || [];
      word.textContent = "";
      letters.forEach(letter => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.className = "letter";
        word.append(span);
      });
    });

    let currentWordIndex = 0;
    const maxWordIndex = wordElements.length - 1;
    (wordElements[currentWordIndex] as HTMLElement).style.opacity = "1";

    const rotateText = () => {
      const currentWord = wordElements[currentWordIndex];
      const nextWord = currentWordIndex === maxWordIndex 
        ? wordElements[0] 
        : wordElements[currentWordIndex + 1];

      // Rotate out current word
      Array.from(currentWord.children).forEach((letter, i) => {
        setTimeout(() => {
          letter.className = "letter out";
        }, i * 80);
      });

      // Rotate in next word
      (nextWord as HTMLElement).style.opacity = "1";
      Array.from(nextWord.children).forEach((letter, i) => {
        letter.className = "letter behind";
        setTimeout(() => {
          letter.className = "letter in";
        }, 340 + i * 80);
      });

      currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
    };

    rotateText();
    const interval = setInterval(rotateText, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="w-full overflow-hidden cursor-pointer bg-gray-700 pb-2 h-32 flex flex-col items-center justify-center"
    >
      <div className="rotating-text font-sans text-3xl text-white -ml-14">
        <p>ForMe is </p>
        <p style={{ marginLeft: '10px' }}> 
          {words.map((word, index) => (
            <span key={index} className={cn("word", word.color)}>
              {word.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
