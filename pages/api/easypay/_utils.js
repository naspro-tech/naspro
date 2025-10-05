// pages/api/easypay/_utils.js

export function getCredentialsHeader() {
  const user = process.env.EASYPAY_USERNAME || '';
  const pass = process.env.EASYPAY_PASSWORD || '';
  const token = Buffer.from(`${user}:${pass}`).toString('base64');

  return {
    Credentials: token,
    'Content-Type': 'application/json'
  };
}

export function baseUrl() {
  // Defaults to LIVE Easypaisa endpoint if not defined
  return (
    process.env.EASYPAY_BASE_URL ||
    'https://easypay.easypaisa.com.pk/easypay-service/rest/v4'
  );
}
