import { v2 as cloudinary } from "cloudinary";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("rolls")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Get roll error:", error);
    return NextResponse.json({ error: "Roll not found" }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabase
      .from("rolls")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    revalidatePath(`/rolls/${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update roll error:", error);
    return NextResponse.json({ error: "Failed to update roll" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: photos } = await supabase
      .from("photos")
      .select("public_id")
      .eq("roll_id", id);

    if (photos && photos.length > 0) {
      const publicIds = photos.map((p) => p.public_id);
      await cloudinary.api.delete_resources(publicIds);
      await cloudinary.api.delete_folder(`do3l5/rolls/${id}`);
    }

    const { error } = await supabase.from("rolls").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/");
    revalidatePath(`/rolls/${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete roll error:", error);
    return NextResponse.json({ error: "Failed to delete roll" }, { status: 500 });
  }
}