// pages/api/editPaymentMethod.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { payment_method_id, expiry_month, expiry_year, billing_address } = req.body;

  if (!payment_method_id || !expiry_month || !expiry_year || !billing_address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const tokenUrl = `https://accounts.zoho.com/oauth/v2/token`;
  const tokenParams = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  try {
    const tokenRes = await fetch(`${tokenUrl}?${tokenParams.toString()}`, {
      method: 'POST',
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(500).json({ error: 'Failed to get Zoho access token', details: tokenData });
    }

    const accessToken = tokenData.access_token;

    const payload = {
      type: 'card',
      card: {
        expiry_month,
        expiry_year,
      },
      billing_address,
    };

    console.log('Editing payment method with payload:', payload);

    const zohoRes = await fetch(
      `https://payments.zoho.com/api/v1/paymentmethods/${payment_method_id}?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await zohoRes.json();

    if (zohoRes.ok && data.code === 0) {
      return res.status(200).json({ success: true, payment_method: data.payment_method });
    } else {
      return res.status(500).json({ error: 'Failed to edit payment method', details: data });
    }
  } catch (err) {
    console.error('Edit error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
