"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <main style={{
            background: "var(--bg-base)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)"
        }}>
            <div style={{
                background: "var(--bg-raised)",
                padding: "40px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                width: "100%",
                maxWidth: "400px",
            }}>
                <h1 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "24px",
                    color: "var(--text-primary)",
                    marginBottom: "24px",
                    textAlign: "center"
                }}>Owner Login</h1>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {error && (
                        <div style={{ color: "var(--red)", fontSize: "12px", border: "1px solid var(--red-dim)", padding: "8px", borderRadius: "4px" }}>
                            {error}
                        </div>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        spellCheck="false"
                        style={{
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                            padding: "12px",
                            borderRadius: "4px",
                            outline: "none",
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                            padding: "12px",
                            borderRadius: "4px",
                            outline: "none",
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: "var(--text-primary)",
                            color: "var(--bg-base)",
                            padding: "12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            marginTop: "8px",
                            letterSpacing: "0.1em"
                        }}
                    >
                        {loading ? "LOGGING IN..." : "LOGIN"}
                    </button>
                </form>
            </div>
        </main>
    );
}
