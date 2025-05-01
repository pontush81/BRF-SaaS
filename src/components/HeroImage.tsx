'use client';

import Image from 'next/image';
import { useState } from 'react';

export function HeroImage() {
  const [imgSrc, setImgSrc] = useState('/hero-handbook.png');

  const handleError = () => {
    setImgSrc('/fallback.svg');
  };

  return (
    <Image 
      src={imgSrc}
      alt="Digital handbok för bostadsrättsföreningar"
      width={600}
      height={400}
      className="w-full h-auto"
      onError={handleError}
    />
  );
} 