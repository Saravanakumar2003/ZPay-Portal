export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { customer_Id, description } = req.body;

    const tokenParams = new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
    });

    const tokenRes = await fetch(`https://accounts.zoho.com/oauth/v2/token?${tokenParams}`, {
        method: 'POST',
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
        return res.status(500).json({ error: 'No access token received from Zoho' });
    }

    const sessionRes = await fetch(`https://payments.zoho.com/api/v1/paymentmethodsessions?account_id=${process.env.ZOHO_ACCOUNT_ID}`, {
        method: 'POST',
        headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "customer_id": customer_Id, "description": description }),
    });

    if (!sessionRes.ok) {
        const errorData = await sessionRes.json();
        return res.status(500).json({ error: 'Failed to create payment method session', details: errorData });
    }


    const sessionData = await sessionRes.json();

    if (sessionData.code !== 0) {
        return res.status(500).json({ error: 'Failed to create payment method session', details: sessionData });
    }
    return res.status(200).json({ success: true, session: sessionData });
}
