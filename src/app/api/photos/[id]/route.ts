import { v2 as cloudinary } from "cloudinary";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        // Bust Next.js server cache
        revalidatePath("/");
        revalidatePath(`/rolls/${photo.roll_id}`);

        return NextResponse.json({ success: true, roll_id: photo.roll_id });
    } catch (error) {
        console.error("Delete photo error:", error);
        return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }
}
