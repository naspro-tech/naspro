// pages/api/easypay/initiate-ma.js

import { getCredentialsHeader, baseUrl } from './_utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      orderId,
      transactionAmount,
      mobileAccountNo,
      emailAddress,
      optional1
    } = req.body;

    // Basic validation
    if (!orderId || !transactionAmount || !mobileAccountNo || !emailAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const payload = {
      orderId,
      storeId: process.env.EASYPAY_STORE_ID,
      transactionAmount: String(transactionAmount),
      transactionType: 'MA', // Mobile Account
      mobileAccountNo,
      emailAddress,
      optional1
    };

    const url = `${baseUrl()}/initiate-ma-transaction`;
    const headers = getCredentialsHeader();

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 502).json(data);
  } catch (error) {
    console.error('Easypay initiate-ma error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
