"use client";

import { useEffect, useCallback, useRef } from "react";
import { Photo } from "@/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import Image from "next/image";

type Props = {
  photo: Photo;
  rollName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Lightbox({ photo, rollName, onClose, onPrev, onNext }: Props) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Only trigger swipe if horizontal movement is dominant and > 50px
    if (absDx > 50 && absDx > absDy * 1.5) {
      if (dx > 0) onPrev();
      else onNext();
    }
    touchStart.current = null;
  }, [onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Frame ${photo.frame_number} — ${rollName}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.96)",
        padding: "env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0)",
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{ position: "relative", maxWidth: "900px", width: "100%", padding: "0 16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "3/2" }}>
          <Image
            src={getCloudinaryUrl(photo.public_id, { width: 1600, quality: 90 })}
            alt={`Frame ${photo.frame_number} from ${rollName}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Meta & controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "16px",
          padding: "0 2px",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              color: "var(--gold)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.15em",
            }}>
              FRAME {String(photo.frame_number).padStart(2, "0")}
            </span>
            <span style={{
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}>
              {rollName}
            </span>
            {photo.is_favorite && (
              <span style={{
                color: "var(--gold)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}>★ FAVORIT</span>
            )}
          </div>

          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={onPrev}
              aria-label="Frame sebelumnya"
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                letterSpacing: "0.1em",
                cursor: "pointer",
                padding: "10px 16px",
                minHeight: "44px",
                transition: "color 0.15s, border-color 0.15s",
              }}
              onPointerEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
                e.currentTarget.style.borderColor = "var(--gold-dim)";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >← PREV</button>
            <button
              onClick={onNext}
              aria-label="Frame berikutnya"
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                letterSpacing: "0.1em",
                cursor: "pointer",
                padding: "10px 16px",
                minHeight: "44px",
                transition: "color 0.15s, border-color 0.15s",
              }}
              onPointerEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
                e.currentTarget.style.borderColor = "var(--gold-dim)";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >NEXT →</button>
          </div>
        </div>

        {photo.notes && (
          <p style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-serif)",
            fontSize: "14px",
            fontStyle: "italic",
            marginTop: "10px",
            paddingLeft: "2px",
          }}>
            &quot;{photo.notes}&quot;
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Tutup lightbox"
        style={{
          position: "absolute",
          top: "max(16px, env(safe-area-inset-top, 16px))",
          right: "max(16px, env(safe-area-inset-right, 16px))",
          background: "rgba(10,10,10,0.8)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text-dim)",
          fontSize: "18px",
          cursor: "pointer",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s, border-color 0.15s",
        }}
        onPointerEnter={(e) => {
          e.currentTarget.style.color = "var(--gold)";
          e.currentTarget.style.borderColor = "var(--gold-dim)";
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.color = "var(--text-dim)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >✕</button>
    </div>
  );
}