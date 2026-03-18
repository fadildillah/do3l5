import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PhotoGrid from "@/components/PhotoGrid";
import PhotoUploader from "@/components/PhotoUploader";
import InteractiveLink from "@/components/InteractiveLink";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function RollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;

  const [{ data: roll }, { data: photos }] = await Promise.all([
    supabase.from("rolls").select("*").eq("id", id).single(),
    supabase.from("photos").select("*").eq("roll_id", id).order("frame_number"),
  ]);

  if (!roll) notFound();

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div style={{ maxWidth: "580px", margin: "0 auto", padding: "0 20px 80px" }}>
        {/* Back */}
        <nav style={{ borderBottom: "1px solid var(--bg-subtle)", padding: "20px 0", marginBottom: "24px" }}>
          <InteractiveLink
            href="/"
            ariaLabel="Kembali ke semua rolls"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
              letterSpacing: "0.15em",
              textDecoration: "none",
            }}
          >
            ← ALL ROLLS
          </InteractiveLink>
        </nav>

        {/* Roll header */}
        <div style={{ marginBottom: "32px" }} className="animate-fade-in">
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginBottom: "4px",
            flexWrap: "wrap",
          }}>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "26px",
              fontWeight: 400,
              color: "var(--text-primary)",
            }}>
              {roll.film_stock}
            </h1>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--gold)",
            }}>
              ROLL #{String(roll.roll_number).padStart(2, "0")}
            </span>
            {isAuthed && (
              <InteractiveLink
                href={`/rolls/${roll.id}/edit`}
                ariaLabel={`Edit roll ${roll.film_stock}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.15em",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  padding: "6px 14px",
                  borderRadius: "var(--radius)",
                  transition: "border-color 0.2s",
                }}
              >
                EDIT
              </InteractiveLink>
            )}
          </div>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px 24px",
            marginTop: "16px",
          }}>
            {[
              { label: "CAMERA", value: roll.camera },
              { label: "ISO", value: roll.iso },
              { label: "PROCESS", value: roll.process },
              roll.date_developed && { label: "DEV'D", value: roll.date_developed },
              roll.lab && { label: "LAB", value: roll.lab },
              roll.location && { label: "LOCATION", value: roll.location },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ].filter(Boolean).map((item: any) => (
              <div key={item.label}>
                <div style={{
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.15em",
                  marginBottom: "3px",
                }}>{item.label}</div>
                <div style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}>{item.value}</div>
              </div>
            ))}
          </div>

          {roll.notes && (
            <p style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-serif)",
              fontSize: "14px",
              fontStyle: "italic",
              marginTop: "18px",
              paddingTop: "16px",
              borderTop: "1px solid #1e1e1e",
            }}>
              &quot;{roll.notes}&quot;
            </p>
          )}
        </div>

        {/* Photos */}
        {photos && photos.length > 0 ? (
          <div className="animate-slide-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-dim)",
                letterSpacing: "0.15em",
              }}>
                {photos.length} FRAMES
              </span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-dim)",
                letterSpacing: "0.1em",
              }}>
                {photos.filter((p) => p.is_favorite).length} FAVORIT
              </span>
            </div>
            <PhotoGrid photos={photos} rollName={roll.film_stock} canEdit={isAuthed} />
          </div>
        ) : (
          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: "15px",
            fontStyle: "italic",
            color: "var(--text-ghost)",
            textAlign: "center",
            paddingTop: "48px",
          }}>
            Belum ada foto di roll ini.
          </p>
        )}
        {isAuthed && <PhotoUploader rollId={roll.id} />}
      </div>
    </main>
  );
}