import { supabase } from "@/lib/supabase";
import { Roll, Photo } from "@/types";
import RollCard from "@/components/RollCard";
import Link from "next/link";

export const revalidate = 0;

export default async function HomePage() {
  const { data: rolls } = await supabase
    .from("rolls")
    .select("*")
    .order("roll_number", { ascending: false });

  // Fetch preview photos for all rolls in one query
  const rollIds = rolls?.map((r: Roll) => r.id) ?? [];
  const { data: allPhotos } = rollIds.length > 0
    ? await supabase
      .from("photos")
      .select("*")
      .in("roll_id", rollIds)
      .order("frame_number", { ascending: true })
    : { data: [] };

  // Group photos by roll_id (max 4 per roll for preview)
  const photosByRoll: Record<string, Photo[]> = {};
  (allPhotos ?? []).forEach((photo: Photo) => {
    if (!photosByRoll[photo.roll_id]) photosByRoll[photo.roll_id] = [];
    if (photosByRoll[photo.roll_id].length < 4) {
      photosByRoll[photo.roll_id].push(photo);
    }
  });

  const developedCount = rolls?.filter((r: Roll) => r.status === "developed").length ?? 0;

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto", padding: "0 20px 80px" }}>
        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid var(--bg-subtle)",
            padding: "20px 0",
            marginBottom: "24px",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                color: "var(--text-primary)",
              }}>Archive</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--gold)",
                letterSpacing: "0.15em",
              }}>DO3L&apos;5</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-ghost)",
                letterSpacing: "0.1em",
              }}>
                {developedCount} ROLLS
              </span>
              <Link href="/upload" className="new-roll-link">
                + NEW ROLL
              </Link>
            </div>
          </div>
        </header>

        {/* Roll list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {rolls?.map((roll: Roll, idx: number) => (
            <div
              key={roll.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(idx * 0.04, 0.3)}s`, opacity: 0 }}
            >
              <RollCard roll={roll} previewPhotos={photosByRoll[roll.id] ?? []} />
            </div>
          ))}
        </div>

        {(!rolls || rolls.length === 0) && (
          <div style={{ textAlign: "center", paddingTop: "96px" }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "15px",
              fontStyle: "italic",
              color: "var(--text-ghost)",
            }}>
              No rolls yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}