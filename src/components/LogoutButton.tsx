"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="new-roll-link"
            style={{
                background: "transparent",
                color: "var(--red-dim)",
                border: "1px solid var(--red-dim)",
            }}
            onPointerEnter={(e) => {
                e.currentTarget.style.color = "var(--red)";
                e.currentTarget.style.borderColor = "var(--red)";
            }}
            onPointerLeave={(e) => {
                e.currentTarget.style.color = "var(--red-dim)";
                e.currentTarget.style.borderColor = "var(--red-dim)";
            }}
        >
            LOGOUT
        </button>
    );
}
