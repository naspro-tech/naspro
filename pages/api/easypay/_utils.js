// pages/api/easypay/_utils.js

export const EASYPAY_BASE_URL =
  process.env.EASYPAY_BASE_URL ||
  "https://easypay.easypaisa.com.pk/easypay-service/rest/v4";

export async function easypayFetch(endpoint, payload) {
  try {
    const response = await fetch(`${EASYPAY_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        username: process.env.EASYPAY_USERNAME,
        password: process.env.EASYPAY_PASSWORD,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Easypay API Error:", error);
    throw new Error("Failed to connect to Easypay API");
  }
}
