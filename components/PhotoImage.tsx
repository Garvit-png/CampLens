// Ek photo, normal asli rang mein.
// Load hone tak halftone dots chalte hain, phir photo upar se neeche "print" hoti hai.
// Styles globals.css ki .photo class mein hain.
"use client";

import { useState } from "react";

interface PhotoImageProps {
  src: string;
  alt: string;
  className?: string; // size / aspect ratio / radius
  lazy?: boolean;
}

export default function PhotoImage({ src, alt, className = "", lazy = true }: PhotoImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`photo ${isLoaded ? "is-loaded" : ""} ${className}`}>
      <img
        // Cache se image pehle hi aa chuki ho to onLoad nahi chalta — isliye ref pe bhi check
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) setIsLoaded(true);
        }}
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
