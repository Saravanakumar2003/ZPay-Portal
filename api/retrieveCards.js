export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentMethodId } = req.body;
    if (!paymentMethodId) return res.status(400).json({ error: 'Missing paymentMethodId' });

    // Step 1: Get Zoho access token
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

        // Step 2: Retrieve Card from Zoho
        const zohoRes = await fetch(
            `https://payments.zoho.com/api/v1/paymentmethods/${paymentMethodId}?account_id=${process.env.ZOHO_ACCOUNT_ID}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const zohoData = await zohoRes.json();

        if (zohoData.code === 0 && zohoData.payment_method) {
            return res.status(200).json({ payment_method: zohoData.payment_method });
        } else {
            return res.status(404).json({ error: 'Card not found', details: zohoData });
        }
    } catch (err) {
        console.error('Error retrieving Zoho card:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}