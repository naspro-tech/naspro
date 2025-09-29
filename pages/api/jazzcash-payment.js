import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Your JazzCash credentials
    const merchant_id = "MC339532";
    const password = "2282sxh9z8";
    const integrity_salt = "1g90sz31w2";
    const return_url = "https://naspro-nine.vercel.app/api/jazzcash-response";
    
    const { amount, description, customer_name, customer_phone, service } = req.body;
    const order_id = `NASPRO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare transaction data
    const transactionData = {
      "pp_Version": "1.1",
      "pp_TxnType": "MWALLET",
      "pp_Language": "EN",
      "pp_MerchantID": merchant_id,
      "pp_Password": password,
      "pp_BankID": "TBANK",
      "pp_ProductID": "RETL",
      "pp_Amount": (amount * 100).toString(), // Convert to paisa
      "pp_TxnRefNo": order_id,
      "pp_Description": description,
      "pp_TxnDateTime": new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', ''),
      "pp_BillReference": `naspro_${service}`,
      "pp_ReturnURL": return_url,
      "ppmpf_1": "1",
      "ppmpf_2": "2",
      "ppmpf_3": "3",
      "ppmpf_4": "4",
      "ppmpf_5": "5"
    };
    
    // Generate Secure Hash
    const sortedData = {};
    Object.keys(transactionData).sort().forEach(key => {
      sortedData[key] = transactionData[key];
    });
    
    let hashString = integrity_salt + '&';
    hashString += Object.values(sortedData).join('&');
    
    const secureHash = crypto.createHmac('sha256', integrity_salt)
      .update(hashString)
      .digest('hex');
    
    transactionData.pp_SecureHash = secureHash;
    
    res.status(200).json({
      success: true,
      jazzcash_url: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
      form_data: transactionData,
      order_id: order_id
    });
    
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
