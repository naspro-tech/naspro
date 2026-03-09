import supabase from "../../../lib/supabase";

export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  try{

    let { username,email,role } = req.body;

    if(!username || !email || !role){
      return res.status(400).json({
        success:false,
        message:"Missing required fields"
      });
    }

    username = username.trim();
    email = email.trim().toLowerCase();

    const { data:existingUser } = await supabase
      .from("portal_users")
      .select("id")
      .eq("email",email)
      .single();

    if(existingUser){
      return res.status(400).json({
        success:false,
        message:"User already exists"
      });
    }

    const { error } = await supabase
      .from("portal_users")
      .insert([
        {
          username,
          email,
          role,
          created_at: new Date()
        }
      ]);

    if(error){
      return res.status(500).json({
        success:false,
        message:error.message
      });
    }

    return res.status(200).json({
      success:true
    });

  }catch(err){

    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });

  }

}
