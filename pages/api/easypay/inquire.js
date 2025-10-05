// pages/api/easypay/inquire.js

import { getCredentialsHeader, baseUrl } from './_utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Missing orderId' });
    }

    const payload = {
      orderId,
      storeId: process.env.EASYPAY_STORE_ID,
      accountNum: process.env.EASYPAY_ACCOUNT_ID // Your live Account ID
    };

    const url = `${baseUrl()}/inquire-transaction`;
    const headers = getCredentialsHeader();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 502).json(data);
  } catch (error) {
    console.error('Easypay inquire error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
