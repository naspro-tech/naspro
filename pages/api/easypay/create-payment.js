// pages/api/create-payment.js

import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      code: "405",
      msg: "Method not allowed"
    });
  }

  try {
    const {
      amount,
      username,
      service,
      callback
    } = req.body;

    // Basic validation
    if (!amount || !username || !callback) {
      return res.status(400).json({
        code: "400",
        msg: "Missing required fields"
      });
    }

    // ✅ Generate secure system order ID
    const systemOrderId =
      "NASPRO-" +
      Date.now() +
      "-" +
      crypto.randomBytes(3).toString("hex");

    // 🔒 TODO: Save order in your database here
    // Example structure:
    // {
    //   order_id: systemOrderId,
    //   username,
    //   amount,
    //   service,
    //   callback,
    //   status: "PENDING",
    //   created_at: new Date()
    // }

    // Generate hosted payment URL
    const paymentUrl = `https://naspropvt.vercel.app/pay?amount=${encodeURIComponent(
      amount
    )}&username=${encodeURIComponent(
      username
    )}&orderId=${encodeURIComponent(
      systemOrderId
    )}&service=${encodeURIComponent(
      service || "Deposit"
    )}&callback=${encodeURIComponent(callback)}`;

    // ✅ Acknowledgment response
    return res.status(200).json({
      code: "000",
      msg: "success",
      data: {
        order_id: systemOrderId,
        url: paymentUrl,
        status: "RECEIVED",
        amount: amount,
        currency: "PKR",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      code: "500",
      msg: "Internal server error"
    });
  }
      }
