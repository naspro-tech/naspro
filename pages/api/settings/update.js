import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  const { callback_url, webhook_url } = req.body;

  if(!callback_url && !webhook_url){
    return res.status(400).json({
      success:false,
      message:"No settings provided"
    });
  }

  try {

    const { error } = await supabase
      .from("merchant_settings")
      .update({
        callback_url,
        webhook_url,
        updated_at: new Date()
      })
      .eq("id",1);

    if(error){
      return res.status(500).json({
        success:false,
        message:"Database error"
      });
    }

    return res.status(200).json({
      success:true
    });

  } catch(err){

    return res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

                        }
