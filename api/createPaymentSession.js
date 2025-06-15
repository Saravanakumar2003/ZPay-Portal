export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const {
    amount,
    currency,
    invoice_number,
    reference_number,
    description,
    meta_data
  } = req.body;

  // Step 1: Get fresh access token from Zoho
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

    // Step 2: Call Zoho Payment Session API
    const sessionRes = await fetch(`https://payments.zoho.com/api/v1/paymentsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        invoice_number,
        reference_number,
        description,
        meta_data
      }),
    });

    const sessionData = await sessionRes.json();

    if (sessionData.code === 0) {
      return res.status(200).json({ session: sessionData.payments_session });
    } else {
      return res.status(500).json({ error: 'Failed to create payment session', details: sessionData });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}
