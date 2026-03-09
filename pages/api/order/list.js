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
      .from("orders")
      .select("*")
      .order("created_at", { ascending:false });

    if (error) {
      return res.status(500).json({
        success:false,
        message:error.message
      });
    }

    return res.status(200).json({
      success:true,
      data
    });

  } catch (err) {

    return res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

}
