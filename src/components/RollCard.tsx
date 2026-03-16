import Link from "next/link";
import { Roll } from "@/types";

const STATUS_MAP = {
  developed: { label: "DEVELOPED", bg: "#2a2a1e", color: "#c8a84b" },
  shooting: { label: "SHOOTING", bg: "#1e2a1e", color: "#7ab87a" },
  undeveloped: { label: "PENDING DEV", bg: "#2a1e1e", color: "#c87a7a" },
};

export default function RollCard({ roll }: { roll: Roll }) {
  const status = STATUS_MAP[roll.status];
  const isDeveloped = roll.status === "developed";

  return (
    <Link
      href={`/rolls/${roll.id}`}
      style={{ textDecoration: "none", display: "block" }}
      aria-label={`${roll.film_stock} — Roll #${roll.roll_number}, ${status.label}`}
    >
      <div
        className="group"
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          transition: "border-color 0.2s, transform 0.2s, opacity 0.2s",
          opacity: isDeveloped ? 1 : 0.6,
          ["--hover-border" as string]: `${status.color}40`,
        }}
      >
        {/* Cover image or placeholder */}
        <div style={{
          height: "140px",
          background: "var(--bg-base)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {isDeveloped ? (
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, #1a1510, var(--bg-base))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-ghost)",
                letterSpacing: "0.2em",
              }}>
                {roll.frames_total} FRAMES
              </span>
            </div>
          ) : (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--border)",
              letterSpacing: "0.2em",
            }}>
              {roll.status === "shooting" ? "CURRENTLY SHOOTING" : "NOT YET DEVELOPED"}
            </span>
          )}

          {/* Film perforations strip */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "10px",
            background: "#0d0d0d",
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            gap: "6px",
          }}>
            {[...Array(18)].map((_, i) => (
              <div key={i} style={{
                width: "4px", height: "5px",
                background: "#1e1e1e",
                borderRadius: "1px",
                flexShrink: 0,
              }} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{
                  color: status.color,
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                }}>
                  ROLL #{String(roll.roll_number).padStart(2, "0")}
                </span>
                <span style={{
                  background: status.bg,
                  color: status.color,
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  padding: "3px 8px",
                  border: `1px solid ${status.color}30`,
                  borderRadius: "var(--radius)",
                }}>
                  {status.label}
                </span>
              </div>
              <div style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-serif)",
                fontSize: "18px",
                lineHeight: 1.2,
              }}>
                {roll.film_stock}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
            {[
              { label: "ISO", value: roll.iso },
              { label: "PROCESS", value: roll.process },
              { label: "CAMERA", value: roll.camera.split(" ").slice(-2).join(" ") },
            ].map((item) => (
              <div key={item.label}>
                <div style={{
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  marginBottom: "3px",
                }}>
                  {item.label}
                </div>
                <div style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {roll.notes && (
            <div style={{
              color: "var(--text-dim)",
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              fontStyle: "italic",
              borderTop: "1px solid #1e1e1e",
              paddingTop: "10px",
            }}>
              &quot;{roll.notes}&quot;
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}