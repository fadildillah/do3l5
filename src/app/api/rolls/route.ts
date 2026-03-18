import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from("rolls")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Create roll error:", error);
    return NextResponse.json({ error: "Failed to create roll" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rolls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("List rolls error:", error);
    return NextResponse.json({ error: "Failed to list rolls" }, { status: 500 });
  }
}