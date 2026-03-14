import crypto from "crypto";
import supabase from "../../../lib/supabase";

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

    const {
      amount,
      username,
      service,
      callback,
      mobileAccountNo,
      emailAddress
    } = req.body;

    // Validate required fields
    if (!amount || !username || !mobileAccountNo || !emailAddress) {
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

    // Generate order id
    const systemOrderId =
      "NASPRO-" +
      Date.now() +
      "-" +
      crypto.randomBytes(3).toString("hex");

    // Save order
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

    // Call Easypay Initiate API
    const easypayRes = await fetch(
      `${process.env.BASE_URL}/api/easypay/initiate-ma`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: systemOrderId,
          transactionAmount: parsedAmount,
          mobileAccountNo,
          emailAddress
        })
      }
    );

    const easypayData = await easypayRes.json();

    // Return response to merchant
    return res.status(200).json({
      status: "success",
      msg: "Payment initiated",
      data: {
        order_id: systemOrderId,
        amount: parsedAmount,
        currency: "PKR",
        gateway_response: easypayData
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
