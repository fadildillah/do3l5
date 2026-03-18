"use client";

declare global {
  interface Window {
    bustSWCache?: (urls?: string[]) => void;
  }
}

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  letterSpacing: "0.15em",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "6px",
};

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        setAuthChecking(false);
      }
    });
  }, [router]);
  const [form, setForm] = useState({
    roll_number: "",
    film_stock: "",
    camera: "Fujifilm Zoom Motor Drive",
    iso: "200",
    process: "C-41",
    frames_total: "36",
    date_started: "",
    date_finished: "",
    location: "Jakarta",
    lab: "",
    notes: "",
    status: "undeveloped",
  });

  if (authChecking) return null;

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.roll_number || !form.film_stock) return;
    setLoading(true);

    try {
      const res = await fetch("/api/rolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roll_number: parseInt(form.roll_number),
          iso: parseInt(form.iso),
          frames_total: parseInt(form.frames_total),
          date_started: form.date_started || null,
          date_finished: form.date_finished || null,
          lab: form.lab || null,
          notes: form.notes || null,
          location: form.location || null,
        }),
      });

      const roll = await res.json();
      if (roll.id) {
        window.bustSWCache?.(['/']);
        router.push(`/rolls/${roll.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0 20px 80px" }}>
        {/* Header */}
        <div className="animate-fade-in" style={{
          borderBottom: "1px solid var(--bg-subtle)",
          padding: "20px 0 18px",
          marginBottom: "32px",
        }}>
          <button
            onClick={() => router.back()}
            aria-label="Kembali"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.15em",
              cursor: "pointer",
              padding: "8px 0",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              transition: "color 0.15s",
            }}
            onPointerEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onPointerLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            ← BACK
          </button>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "22px",
            fontWeight: 400,
            color: "var(--text-primary)",
            marginTop: "10px",
          }}>
            New Roll
          </h1>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div className="form-row-2">
            <div>
              <label style={labelStyle}>ROLL NUMBER</label>
              <input
                type="number"
                value={form.roll_number}
                onChange={(e) => update("roll_number", e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <label style={labelStyle}>STATUS</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="shooting">Shooting</option>
                <option value="undeveloped">Undeveloped</option>
                <option value="developed">Developed</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>FILM STOCK</label>
            <input
              type="text"
              value={form.film_stock}
              onChange={(e) => update("film_stock", e.target.value)}
              placeholder="Kodak ColorPlus 200"
            />
          </div>

          <div>
            <label style={labelStyle}>CAMERA</label>
            <input
              type="text"
              value={form.camera}
              onChange={(e) => update("camera", e.target.value)}
            />
          </div>

          <div className="form-row-3">
            <div>
              <label style={labelStyle}>ISO</label>
              <input
                type="number"
                value={form.iso}
                onChange={(e) => update("iso", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>PROCESS</label>
              <select
                value={form.process}
                onChange={(e) => update("process", e.target.value)}
              >
                <option value="C-41">C-41</option>
                <option value="B&W">B&W</option>
                <option value="E-6">E-6</option>
                <option value="ECN-2">ECN-2</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>FRAMES</label>
              <input
                type="number"
                value={form.frames_total}
                onChange={(e) => update("frames_total", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label style={labelStyle}>DATE STARTED</label>
              <input
                type="date"
                value={form.date_started}
                onChange={(e) => update("date_started", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>DATE FINISHED</label>
              <input
                type="date"
                value={form.date_finished}
                onChange={(e) => update("date_finished", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label style={labelStyle}>LOCATION</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>LAB</label>
              <input
                type="text"
                value={form.lab}
                onChange={(e) => update("lab", e.target.value)}
                placeholder="Kino Film Lab"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>NOTES</label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Catatan singkat soal roll ini..."
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.roll_number || !form.film_stock}
            style={{
              background: loading ? "var(--bg-subtle)" : "var(--gold)",
              border: "none",
              borderRadius: "var(--radius)",
              color: loading ? "var(--text-muted)" : "var(--bg-base)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.2em",
              padding: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s, opacity 0.2s",
              marginTop: "8px",
              minHeight: "48px",
              fontWeight: 600,
              opacity: (!form.roll_number || !form.film_stock) ? 0.5 : 1,
            }}
          >
            {loading ? "SAVING..." : "CREATE ROLL →"}
          </button>
        </div>

        {/* Responsive form grid styles */}
        <style>{`
          .form-row-2 {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .form-row-3 {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          @media (min-width: 400px) {
            .form-row-2 { grid-template-columns: 1fr 1fr; }
            .form-row-3 { grid-template-columns: 1fr 1fr 1fr; }
          }
        `}</style>
      </div>
    </main>
  );
}