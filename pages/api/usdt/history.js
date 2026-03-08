import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  try {

    const { data, error } = await supabase
      .from("usdt_requests")
      .select("*")
      .order("created_at", { ascending:false });

    if (error) {
      console.error("USDT History Error:", error);

      return res.status(500).json({
        success:false,
        message:"Failed to load history"
      });
    }

    return res.status(200).json({
      success:true,
      data
    });

  } catch (err) {

    console.error("Server error:", err);

    return res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

}
