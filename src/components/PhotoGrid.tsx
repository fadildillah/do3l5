"use client";

import { useState } from "react";
import Image from "next/image";
import { Photo } from "@/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import Lightbox from "@/components/Lightbox";

export default function PhotoGrid({ photos, rollName }: { photos: Photo[]; rollName: string }) {
  const [selected, setSelected] = useState<number | null>(null);

  const handlePrev = () => setSelected((i) => (i !== null ? Math.max(0, i - 1) : null));
  const handleNext = () => setSelected((i) => (i !== null ? Math.min(photos.length - 1, i + 1) : null));

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "3px",
      }}
        className="photo-grid"
      >
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setSelected(idx)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(idx); } }}
            role="button"
            tabIndex={0}
            aria-label={`Frame ${photo.frame_number}${photo.is_favorite ? " (favorit)" : ""}`}
            style={{
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
              aspectRatio: "3/2",
            }}
          >
            <Image
              src={getCloudinaryUrl(photo.public_id, { width: 600, quality: 80 })}
              alt={`Frame ${photo.frame_number}`}
              width={600}
              height={400}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.15s" }}
            />
            <span style={{
              position: "absolute",
              bottom: "6px",
              left: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
            }}>
              {String(photo.frame_number).padStart(2, "0")}
            </span>
            {photo.is_favorite && (
              <div style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--gold)",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Responsive grid: 2 cols mobile, 3 cols sm+ */}
      <style>{`
        @media (min-width: 480px) {
          .photo-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 640px) {
          .photo-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>

      {selected !== null && (
        <Lightbox
          photo={photos[selected]}
          rollName={rollName}
          onClose={() => setSelected(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  );
}