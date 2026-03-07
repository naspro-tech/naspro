// pages/api/create-payment.js

import crypto from "crypto";
import supabase from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      msg: "Method not allowed"
    });
  }

  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.PORTAL_API_KEY) {
    return res.status(401).json({
      status: "error",
      msg: "Unauthorized request"
    });
  }
  
  try {
    const { amount, username, service, callback } = req.body;

    if (!amount || !username || !callback) {
      return res.status(400).json({
        status: "error",
        msg: "Missing required fields"
      });
    }

    const parsedAmount = Number(amount);

if (isNaN(parsedAmount) || parsedAmount <= 0) {
  return res.status(400).json({
    status: "error",
    msg: "Invalid amount"
  });
}
    
    // Generate system order ID
    const systemOrderId =
      "NASPRO-" +
      Date.now() +
      "-" +
      crypto.randomBytes(3).toString("hex");

    await supabase.from("orders").insert([
  {
    order_id: systemOrderId,
    username: username,
    amount: parsedAmount,
    service: service || "Deposit",
    status: "PENDING",
    callback: callback
  }
]);
    
    // Generate hosted payment URL
    const redirectUrl = `https://naspropvt.vercel.app/pay?orderId=${encodeURIComponent(
  systemOrderId
)}`;

    // ✅ Return structured response
    return res.status(200).json({
      status: "success",
      msg: "Order created successfully",
      data: {
        order_id: systemOrderId,
        order_status: "PENDING",
        redirect_url: redirectUrl,
        amount: amount,
        currency: "PKR",
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      status: "error",
      msg: "Internal server error"
    });
  }
}
