export default function handler(req, res) {

  if(req.method !== "POST"){
    return res.status(405).json({
      success:false,
      message:"Method not allowed"
    });
  }

  const { email, password } = req.body;

  // Temporary users (until database added)

  if(email === "admin@naspro.com" && password === "admin123"){
    return res.status(200).json({
      success:true,
      role:"admin"
    });
  }

  if(email === "merchant@test.com" && password === "123456"){
    return res.status(200).json({
      success:true,
      role:"merchant"
    });
  }

  return res.status(401).json({
    success:false,
    message:"Invalid credentials"
  });

}
