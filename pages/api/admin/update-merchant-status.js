export default function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({success:false});
  }

  const { id, status } = req.body;

  console.log("Update merchant:", id, status);

  res.status(200).json({
    success:true
  });

}
