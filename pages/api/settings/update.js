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

  console.log("Merchant settings update:", {
    callback_url,
    webhook_url,
    updated_at: new Date()
  });

  return res.status(200).json({
    success:true
  });

}
