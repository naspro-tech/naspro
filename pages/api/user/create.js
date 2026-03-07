export default async function handler(req, res){

  if(req.method !== "POST"){
    return res.status(405).json({ success:false });
  }

  const { username, email, role } = req.body;

  if(!username || !email || !role){
    return res.status(400).json({
      success:false,
      message:"Missing fields"
    });
  }

  console.log("New portal user:", {
    username,
    email,
    role,
    created_at:new Date()
  });

  return res.status(200).json({
    success:true
  });

}
