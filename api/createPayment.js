export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { customer_id, payment_method, amount, currency } = req.body;

  if (!customer_id || !payment_method || !amount || !currency) {
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

    const paymentPayload = {
      customer_id,
      payment_method_id: payment_method,
      amount: parseFloat(amount),
      currency
    };

    const zohoRes = await fetch(`https://payments.zoho.com/api/v1/payments?account_id=${process.env.ZOHO_ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload),
    });

    const zohoData = await zohoRes.json();

    if (zohoData.code === 0) {
      return res.status(200).json({ success: true, payment: zohoData.payment });
    } else {
      return res.status(500).json({ error: 'Failed to create Zoho payment', details: zohoData });
    }
  } catch (err) {
    console.error('Error creating Zoho payment:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
