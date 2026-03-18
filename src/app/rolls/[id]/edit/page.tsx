"use client";

declare global {
    interface Window {
        bustSWCache?: (urls?: string[]) => void;
    }
}

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Roll } from "@/types";

const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.15em",
    color: "var(--text-muted)",
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
    const [authChecking, setAuthChecking] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.replace("/login");
            } else {
                setAuthChecking(false);
                fetch(`/api/rolls/${id}`)
                    .then((r) => r.json())
                    .then((data) => {
                        setForm(data);
                        setLoading(false);
                    });
            }
        });
    }, [id, router]);

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
            window.bustSWCache?.(['/', `/rolls/${id}`]);
            router.push(`/rolls/${id}`);
            router.refresh();
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
            window.bustSWCache?.(['/', `/rolls/${id}`]);
            router.push("/");
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    if (authChecking || loading) {
        return (
            <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
                <div style={{ maxWidth: "520px", margin: "0 auto", padding: "48px 20px" }}>
                    <span className="skeleton-pulse" style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                        color: "var(--text-ghost)",
                        letterSpacing: "0.15em",
                    }}>
                        LOADING...
                    </span>
                </div>
            </main>
        );
    }

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
                    <div style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        marginTop: "10px",
                    }}>
                        <h1 style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "22px",
                            fontWeight: 400,
                            color: "var(--text-primary)",
                        }}>
                            Edit Roll
                        </h1>
                        <span style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "12px",
                            color: "var(--gold)",
                        }}>
                            #{String(form.roll_number).padStart(2, "0")}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                    {/* Status */}
                    <div>
                        <label style={labelStyle}>STATUS</label>
                        <select
                            value={form.status || "shooting"}
                            onChange={(e) => update("status", e.target.value)}
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
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>CAMERA</label>
                        <input
                            type="text"
                            value={form.camera || ""}
                            onChange={(e) => update("camera", e.target.value)}
                        />
                    </div>

                    <div className="form-row-3">
                        <div>
                            <label style={labelStyle}>ISO</label>
                            <input
                                type="number"
                                value={form.iso || ""}
                                onChange={(e) => update("iso", e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>PROCESS</label>
                            <select
                                value={form.process || "C-41"}
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
                                value={form.frames_total || ""}
                                onChange={(e) => update("frames_total", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div>
                            <label style={labelStyle}>DATE STARTED</label>
                            <input
                                type="date"
                                value={form.date_started || ""}
                                onChange={(e) => update("date_started", e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>DATE FINISHED</label>
                            <input
                                type="date"
                                value={form.date_finished || ""}
                                onChange={(e) => update("date_finished", e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>DATE DEVELOPED</label>
                        <input
                            type="date"
                            value={form.date_developed || ""}
                            onChange={(e) => update("date_developed", e.target.value)}
                        />
                    </div>

                    <div className="form-row-2">
                        <div>
                            <label style={labelStyle}>LOCATION</label>
                            <input
                                type="text"
                                value={form.location || ""}
                                onChange={(e) => update("location", e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>LAB</label>
                            <input
                                type="text"
                                value={form.lab || ""}
                                onChange={(e) => update("lab", e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>NOTES</label>
                        <textarea
                            value={form.notes || ""}
                            onChange={(e) => update("notes", e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: saving ? "var(--bg-subtle)" : "var(--gold)",
                            border: "none",
                            borderRadius: "var(--radius)",
                            color: saving ? "var(--text-muted)" : "var(--bg-base)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "12px",
                            letterSpacing: "0.2em",
                            padding: "16px",
                            cursor: saving ? "not-allowed" : "pointer",
                            transition: "background 0.2s, opacity 0.2s",
                            marginTop: "8px",
                            minHeight: "48px",
                            fontWeight: 600,
                        }}
                    >
                        {saving ? "SAVING..." : "SAVE CHANGES →"}
                    </button>

                    {/* Delete */}
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label={confirmDelete ? "Konfirmasi hapus roll ini" : "Hapus roll ini"}
                        style={{
                            background: "none",
                            border: `1px solid ${confirmDelete ? "var(--red-dim)" : "var(--border)"}`,
                            borderRadius: "var(--radius)",
                            color: confirmDelete ? "var(--red)" : "var(--text-dim)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "12px",
                            letterSpacing: "0.2em",
                            padding: "16px",
                            cursor: deleting ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            minHeight: "48px",
                        }}
                        onPointerEnter={(e) => {
                            if (!confirmDelete) {
                                e.currentTarget.style.borderColor = "var(--red-dim)";
                                e.currentTarget.style.color = "var(--red)";
                            }
                        }}
                        onPointerLeave={(e) => {
                            if (!confirmDelete) {
                                e.currentTarget.style.borderColor = "var(--border)";
                                e.currentTarget.style.color = "var(--text-dim)";
                            }
                        }}
                    >
                        {deleting ? "DELETING..." : confirmDelete ? "CONFIRM DELETE?" : "DELETE ROLL"}
                    </button>

                    {confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-dim)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "11px",
                                letterSpacing: "0.15em",
                                cursor: "pointer",
                                padding: "10px",
                                textAlign: "center",
                                minHeight: "44px",
                                transition: "color 0.15s",
                            }}
                        >
                            CANCEL
                        </button>
                    )}
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
        </main >
    );
}