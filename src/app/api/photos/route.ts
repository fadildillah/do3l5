import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("photos")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    // Revalidate the parent roll page so the new photo appears immediately
    if (body.roll_id) {
      revalidatePath(`/rolls/${body.roll_id}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create photo error:", error);
    return NextResponse.json({ error: "Failed to save photo" }, { status: 500 });
  }
}