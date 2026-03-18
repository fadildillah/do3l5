import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        // Get the photo to find its public_id for cloudinary and roll_id for revalidation
        const { data: photo, error: fetchError } = await supabase
            .from("photos")
            .select("public_id, roll_id")
            .eq("id", id)
            .single();

        if (fetchError || !photo) {
            return NextResponse.json({ error: "Photo not found" }, { status: 404 });
        }

        // Delete from cloudinary
        if (photo.public_id) {
            try {
                await cloudinary.api.delete_resources([photo.public_id]);
            } catch (cloudinaryError) {
                console.error("Failed to delete from Cloudinary:", cloudinaryError);
                // Continue even if cloudinary deletion fails
            }
        }

        // Delete from supabase
        const { error: deleteError } = await supabase
            .from("photos")
            .delete()
            .eq("id", id);

        if (deleteError) throw deleteError;

        // Reorder frame numbers
        const { data: remainingPhotos } = await supabase
            .from("photos")
            .select("id, frame_number")
            .eq("roll_id", photo.roll_id)
            .order("frame_number", { ascending: true });

        if (remainingPhotos) {
            // Update sequentially
            const updates = remainingPhotos.map((p, index) => {
                const newFrame = index + 1;
                if (p.frame_number !== newFrame) {
                    return supabase
                        .from("photos")
                        .update({ frame_number: newFrame })
                        .eq("id", p.id);
                }
                return null;
            }).filter(Boolean);

            if (updates.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await Promise.all(updates as any);
            }
        }

        // Bust Next.js server cache
        revalidatePath("/");
        revalidatePath(`/rolls/${photo.roll_id}`);

        return NextResponse.json({ success: true, roll_id: photo.roll_id });
    } catch (error) {
        console.error("Delete photo error:", error);
        return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }
}
