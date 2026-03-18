"use client";

declare global {
  interface Window {
    bustSWCache?: (urls?: string[]) => void;
  }
}

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploader({ rollId }: { rollId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...arr]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);

    const failedFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roll_id", rollId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error(`Gagal upload ke Cloudinary untuk file: ${file.name}`);
          failedFiles.push(file);
          continue;
        }

        const uploaded = await uploadRes.json();

        if (uploaded.error) {
          console.error(`Pesan error dari Cloudinary untuk ${file.name}:`, uploaded.error);
          failedFiles.push(file);
          continue;
        }

        const dbRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roll_id: rollId,
            url: uploaded.url,
            public_id: uploaded.public_id,
            width: uploaded.width,
            height: uploaded.height,
            is_favorite: false,
          }),
        });

        if (!dbRes.ok) {
          console.error(`Gagal menyimpan foto di database untuk file: ${file.name}`);
          failedFiles.push(file);
        }
      } catch (err) {
        console.error(`System error upload ${file.name}:`, err);
        failedFiles.push(file);
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);
    setFiles(failedFiles);

    // Only refresh if at least one photo was successfully uploaded
    if (failedFiles.length < files.length) {
      window.bustSWCache?.(['/', `/rolls/${rollId}`]);
      router.refresh();
    }

    if (failedFiles.length > 0) {
      alert(`${failedFiles.length} foto gagal terupload (mungkin ukuran file terlalu besar).`);
    }
  };

  return (
    <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #1e1e1e" }}>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.2em",
        color: "var(--text-dim)",
        display: "block",
        marginBottom: "16px",
      }}>
        UPLOAD FRAMES
      </span>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
        role="button"
        tabIndex={0}
        aria-label="Pilih file foto untuk upload"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.getElementById("file-input")?.click(); } }}
        style={{
          border: `1px dashed ${dragging ? "var(--gold)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          padding: "36px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          background: dragging ? "#1a1710" : "transparent",
          minHeight: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
        }}>
          {dragging ? "DROP HERE" : "DRAG & DROP ATAU KLIK UNTUK PILIH"}
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {files.map((file, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "var(--bg-raised)",
              border: "1px solid #1e1e1e",
              borderRadius: "var(--radius)",
              gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--gold)",
                  flexShrink: 0,
                }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {file.name}
                </span>
              </div>
              <button
                onClick={() => removeFile(idx)}
                aria-label={`Hapus ${file.name}`}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-ghost)",
                  cursor: "pointer",
                  fontSize: "16px",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  borderRadius: "var(--radius)",
                  transition: "color 0.15s",
                }}
                onPointerEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                onPointerLeave={(e) => (e.currentTarget.style.color = "var(--text-ghost)")}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <div style={{ marginTop: "16px" }}>
          <div style={{
            height: "3px",
            background: "var(--bg-subtle)",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--gold)",
              transition: "width 0.3s ease",
              borderRadius: "2px",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            display: "block",
            marginTop: "8px",
          }}>
            UPLOADING... {progress}%
          </span>
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && !uploading && (
        <button
          onClick={handleUpload}
          style={{
            marginTop: "16px",
            background: "var(--gold)",
            border: "none",
            borderRadius: "var(--radius)",
            color: "var(--bg-base)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            letterSpacing: "0.2em",
            padding: "14px 20px",
            cursor: "pointer",
            width: "100%",
            minHeight: "48px",
            fontWeight: 600,
            transition: "opacity 0.2s",
          }}
        >
          UPLOAD {files.length} FRAME{files.length > 1 ? "S" : ""} →
        </button>
      )}
    </div>
  );
}