// pages/api/deletePaymentMethod.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { payment_method_id } = req.body;

  if (!payment_method_id) {
    return res.status(400).json({ error: 'Missing required field: payment_method_id' });
  }

  const tokenUrl = `https://accounts.zoho.com/oauth/v2/token`;
  const tokenParams = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  try {
    // Get access token
    const tokenRes = await fetch(`${tokenUrl}?${tokenParams.toString()}`, { method: 'POST' });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get Zoho access token', details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // DELETE request to Zoho Payment Method API
    const deleteUrl = `https://payments.zoho.com/api/v1/paymentmethods/${payment_method_id}?account_id=${process.env.ZOHO_ACCOUNT_ID}`;
    const zohoRes = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const zohoData = await zohoRes.json();

    if (zohoRes.ok && zohoData.code === 0) {
      return res.status(200).json({ success: true, message: 'Payment method deleted successfully.' });
    } else {
      return res.status(500).json({ error: 'Failed to delete payment method', details: zohoData });
    }
  } catch (err) {
    console.error('Error deleting payment method:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
