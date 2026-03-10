export default function handler(req,res){

  const merchants = [
    { id:1, name:"Test Merchant", email:"merchant@test.com", status:"Active" },
    { id:2, name:"Demo Store", email:"demo@store.com", status:"Pending" }
  ];

  res.status(200).json({
    success:true,
    merchants
  });

}
