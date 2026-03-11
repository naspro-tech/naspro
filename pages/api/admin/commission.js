import supabase from "../../../lib/supabase";

export default async function handler(req, res) {

  if (req.method === "GET") {

    try {

      const { data, error } = await supabase
        .from("admin_commission")
        .select("usdt_amount, deduct_amount")
        .eq("id", 1)
        .single();

      if (error) throw error;

      res.status(200).json({
        success: true,
        usdt_amount: data.usdt_amount,
        deduct_amount: data.deduct_amount
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success:false
      });

    }

  }


  if (req.method === "POST") {

    const { usdt_amount, deduct_amount } = req.body;

    try {

      const { error } = await supabase
        .from("admin_commission")
        .update({
          usdt_amount,
          deduct_amount
        })
        .eq("id", 1);

      if (error) throw error;

      res.status(200).json({
        success:true
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success:false
      });

    }

  }

}
