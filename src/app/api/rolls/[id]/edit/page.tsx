"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Roll } from "@/types";

const inputStyle = {
  background: "#111",
  border: "1px solid #2a2a2a",
  borderRadius: "2px",
  color: "#e8e0d0",
  fontFamily: "'Courier New', monospace",
  fontSize: "13px",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
};

const labelStyle = {
  fontFamily: "'Courier New', monospace",
  fontSize: "9px",
  letterSpacing: "0.15em",
  color: "#555",
  display: "block",
  marginBottom: "6px",
};

export default function EditRollPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<Partial<Roll>>({});

  useEffect(() => {
    fetch(`/api/rolls/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, [id]);

  const update = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/rolls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          iso: typeof form.iso === "string" ? parseInt(form.iso) : form.iso,
          frames_total:
            typeof form.frames_total === "string"
              ? parseInt(form.frames_total)
              : form.frames_total,
          date_started: form.date_started || null,
          date_finished: form.date_finished || null,
          date_developed: form.date_developed || null,
          lab: form.lab || null,
          notes: form.notes || null,
          location: form.location || null,
        }),
      });
      router.push(`/rolls/${id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/rolls/${id}`, { method: "DELETE" });
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ background: "#0a0a0a", minHeight: "100vh" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "48px 24px" }}>
          <span style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
            color: "#333",
            letterSpacing: "0.15em",
          }}>
            LOADING...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "0 24px 64px" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1a1a1a", padding: "20px 0 18px", marginBottom: "36px" }}>
          <button
            onClick={() => router.back()}
            style={{
              background: "none", border: "none",
              color: "#444", fontFamily: "'Courier New', monospace",
              fontSize: "11px", letterSpacing: "0.15em",
              cursor: "pointer", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c8a84b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
          >
            ← BACK
          </button>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "14px" }}>
            <h1 style={{
              fontFamily: "Georgia, serif",
              fontSize: "22px",
              fontWeight: 400,
              color: "#e8e0d0",
            }}>
              Edit Roll
            </h1>
            <span style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              color: "#c8a84b",
            }}>
              #{String(form.roll_number).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Status — paling atas karena sering diubah */}
          <div>
            <label style={labelStyle}>STATUS</label>
            <select
              value={form.status || "shooting"}
              onChange={(e) => update("status", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="shooting">Shooting</option>
              <option value="undeveloped">Undeveloped</option>
              <option value="developed">Developed</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>FILM STOCK</label>
            <input
              type="text"
              value={form.film_stock || ""}
              onChange={(e) => update("film_stock", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>CAMERA</label>
            <input
              type="text"
              value={form.camera || ""}
              onChange={(e) => update("camera", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>ISO</label>
              <input
                type="number"
                value={form.iso || ""}
                onChange={(e) => update("iso", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>PROCESS</label>
              <select
                value={form.process || "C-41"}
                onChange={(e) => update("process", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
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
                value={form.frames_total || ""}
                onChange={(e) => update("frames_total", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>DATE STARTED</label>
              <input
                type="date"
                value={form.date_started || ""}
                onChange={(e) => update("date_started", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>DATE FINISHED</label>
              <input
                type="date"
                value={form.date_finished || ""}
                onChange={(e) => update("date_finished", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>DATE DEVELOPED</label>
            <input
              type="date"
              value={form.date_developed || ""}
              onChange={(e) => update("date_developed", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>LOCATION</label>
              <input
                type="text"
                value={form.location || ""}
                onChange={(e) => update("location", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>LAB</label>
              <input
                type="text"
                value={form.lab || ""}
                onChange={(e) => update("lab", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>NOTES</label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "#1a1a1a" : "#c8a84b",
              border: "none",
              borderRadius: "2px",
              color: saving ? "#555" : "#0a0a0a",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              letterSpacing: "0.2em",
              padding: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: "8px",
            }}
          >
            {saving ? "SAVING..." : "SAVE CHANGES →"}
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: "none",
              border: `1px solid ${confirmDelete ? "#c87a7a50" : "#2a2a2a"}`,
              borderRadius: "2px",
              color: confirmDelete ? "#c87a7a" : "#444",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              letterSpacing: "0.2em",
              padding: "14px",
              cursor: deleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!confirmDelete) e.currentTarget.style.borderColor = "#c87a7a50";
            }}
            onMouseLeave={(e) => {
              if (!confirmDelete) e.currentTarget.style.borderColor = "#2a2a2a";
            }}
          >
            {deleting ? "DELETING..." : confirmDelete ? "CONFIRM DELETE?" : "DELETE ROLL"}
          </button>

          {confirmDelete && (
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                background: "none", border: "none",
                color: "#444", fontFamily: "'Courier New', monospace",
                fontSize: "10px", letterSpacing: "0.15em",
                cursor: "pointer", padding: "0",
                textAlign: "center",
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      </div>
    </main>
  );
}