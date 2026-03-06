// pages/api/create-payment.js

import crypto from "crypto";

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

    // Generate system order ID
    const systemOrderId =
      "NASPRO-" +
      Date.now() +
      "-" +
      crypto.randomBytes(3).toString("hex");

    // TODO: Save order to DB with PENDING status
    // Example: order_id, username, amount, service, callback, order_status: "PENDING", created_at

    // Generate hosted payment URL
    const redirectUrl = `https://naspropvt.vercel.app/pay?amount=${encodeURIComponent(
      amount
    )}&username=${encodeURIComponent(
      username
    )}&orderId=${encodeURIComponent(
      systemOrderId
    )}&service=${encodeURIComponent(service || "Deposit")}&callback=${encodeURIComponent(callback)}`;

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
