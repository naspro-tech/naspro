import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: "Database error" });
  }

  res.status(200).json(data);

}
