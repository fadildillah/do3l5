export type RollStatus = "shooting" | "undeveloped" | "developed";

export type Roll = {
  id: string;
  roll_number: number;
  film_stock: string;
  camera: string;
  iso: number;
  process: string;
  frames_total: number;
  date_started: string | null;
  date_finished: string | null;
  date_developed: string | null;
  lab: string | null;
  location: string | null;
  notes: string | null;
  cover_photo_id: string | null;
  status: RollStatus;
  created_at: string;
};

export type Photo = {
  id: string;
  roll_id: string;
  frame_number: number;
  url: string;
  public_id: string;
  width: number | null;
  height: number | null;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
};