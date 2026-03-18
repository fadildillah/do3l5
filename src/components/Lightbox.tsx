"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Photo } from "@/types";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  photo: Photo;
  rollName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canEdit?: boolean;
};

export default function Lightbox({
  photo,
  rollName,
  onClose,
  onNext,
  onPrev,
  canEdit = false,
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete photo");

      // Bust SW Cache for homepage & rolls
      window.bustSWCache?.(["/", `/rolls/${photo.roll_id}`]);

      // Re-fetch Server Components (Next.js Cache)
      router.refresh();

      onClose(); // Close lightbox after deletion
    } catch (error) {
      console.error(error);
      alert("Failed to delete photo. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
        <div style={{ position: "relative", width: "100%", maxHeight: "80vh", display: "flex", justifyContent: "center" }}>
          {photo.width && photo.height ? (
            <Image
              src={getCloudinaryUrl(photo.public_id, { width: 1600, quality: 90 })}
              alt={`Frame ${photo.frame_number} from ${rollName}`}
              width={photo.width}
              height={photo.height}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain"
              }}
              priority
            />
          ) : (
            <div style={{ position: "relative", width: "100%", height: "70vh", maxHeight: "800px" }}>
              <Image
                src={getCloudinaryUrl(photo.public_id, { width: 1600, quality: 90 })}
                alt={`Frame ${photo.frame_number} from ${rollName}`}
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          )}
        </div>

        {/* Meta & controls */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "16px",
          padding: "0 2px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
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

            {canEdit && (
              <button
                onClick={handleDelete}
                aria-label="Hapus foto ini"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--red-dim)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  cursor: deleting ? "not-allowed" : "pointer",
                  height: "44px",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius)",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onPointerEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.color = "var(--red)";
                    e.currentTarget.style.borderColor = "var(--red-dim)";
                  }
                }}
                onPointerLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.color = "var(--red-dim)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
              >
                {deleting ? "DELETING..." : "DELETE"}
              </button>
            )}

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

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
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

      {/* Controls (Top Right) */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        display: "flex",
        gap: "12px",
        zIndex: 50,
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Tutup lightbox"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-ghost)",
            fontSize: "24px",
            cursor: "pointer",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          onPointerEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onPointerLeave={(e) => (e.currentTarget.style.color = "var(--text-ghost)")}
        >✕</button>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 10, 10, 0.9)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <div className="animate-fade-in" style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          }}>
            <h3 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              color: "var(--text-primary)",
              marginBottom: "12px",
              fontWeight: 400,
            }}>Hapus Frame?</h3>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--text-dim)",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}>
              Tindakan ini permanen. Foto akan dihapus dari roll dan penyimpanan server secara permanen.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  padding: "12px 24px",
                  borderRadius: "var(--radius)",
                  cursor: deleting ? "not-allowed" : "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onPointerEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.borderColor = "var(--text-muted)";
                  }
                }}
                onPointerLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.color = "var(--text-muted)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
              >BATAL</button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  background: "var(--red)",
                  border: "1px solid var(--red-dim)",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  padding: "12px 24px",
                  borderRadius: "var(--radius)",
                  cursor: deleting ? "not-allowed" : "pointer",
                  transition: "background 0.2s, border-color 0.2s",
                  minWidth: "120px",
                }}
                onPointerEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = "#e63946"; // slightly brighter
                  }
                }}
                onPointerLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = "var(--red)";
                  }
                }}
              >{deleting ? "MENGHAPUS..." : "YA, HAPUS"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}