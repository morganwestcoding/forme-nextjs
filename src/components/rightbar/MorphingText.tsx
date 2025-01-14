// components/MorphingText.tsx
'use client';

import { useEffect, useRef } from 'react';

const texts = ["Subscribe", "Today"];
const morphTime = 1;
const cooldownTime = 0.25;

export default function MorphingText() {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (!text1Ref.current || !text2Ref.current) return;

    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    text1Ref.current.textContent = texts[textIndex % texts.length];
    text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];

    function doMorph() {
      morph -= cooldown;
      cooldown = 0;
      
      let fraction = morph / morphTime;
      
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      
      setMorph(fraction);
    }

    function setMorph(fraction: number) {
      if (!text1Ref.current || !text2Ref.current) return;

      text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      
      fraction = 1 - fraction;
      text1Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      
      text1Ref.current.textContent = texts[textIndex % texts.length];
      text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
    }

    function doCooldown() {
      if (!text1Ref.current || !text2Ref.current) return;
      morph = 0;
      
      text2Ref.current.style.filter = "";
      text2Ref.current.style.opacity = "100%";
      
      text1Ref.current.style.filter = "";
      text1Ref.current.style.opacity = "0%";
    }

    function animate() {
      requestAnimationFrame(animate);
      
      let newTime = new Date();
      let shouldIncrementIndex = cooldown > 0;
      let dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      
      cooldown -= dt;
      
      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex++;
        }
        
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();
  }, []);

  return (
    <>
      <div id="container" className="relative w-full h-20 filter">
        <span ref={text1Ref} className="absolute w-full inline-block text-5xl text-center select-none font-raleway" />
        <span ref={text2Ref} className="absolute w-full inline-block text-5xl text-center select-none font-raleway" />
      </div>
      <svg className="hidden">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}