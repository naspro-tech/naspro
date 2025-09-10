export default function handler(req, res) {
  if (req.method === "POST") {
    res.setHeader("Content-Type", "text/html");
    res.end(`
      <html>
      <head><title>Payment Result</title></head>
      <body style="font-family: Arial; text-align:center; padding:50px;">
        <h1>Payment Result</h1>
        <p><strong>Status:</strong> ${req.body.pp_ResponseMessage}</p>
        <p><strong>Transaction Ref:</strong> ${req.body.pp_TxnRefNo}</p>
        <p><strong>Amount:</strong> ${req.body.pp_Amount}</p>
      </body>
      </html>
    `);
  } else {
    res.status(200).send("<h1>Waiting for JazzCash Response...</h1>");
  }
}
