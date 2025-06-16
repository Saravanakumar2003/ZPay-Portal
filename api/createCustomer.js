// /api/createCustomer.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { name, email, phone } = req.body;

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
        if (!accessToken) {
            return res.status(500).json({ error: 'No access token received from Zoho' });
        }
        console.log('Zoho Access Token:', accessToken); // Debugging line
        console.log('Creating Zoho customer with:', { name, email, phone }); // Debugging line

        // Step 2: Create Customer in Zoho
        const zohoRes = await fetch(`https://payments.zoho.com/api/v1/customers?account_id=${process.env.ZOHO_ACCOUNT_ID}`, {
            method: 'POST',
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                phone
            })
        });

        const zohoData = await zohoRes.json();

        if (zohoData.code === 0) {
            const customer_id = zohoData.customer.customer_id;
            return res.status(200).json({ customer_id });
        } else {
            return res.status(500).json({ error: 'Failed to create Zoho customer', details: zohoData });
        }
    }

    catch (err) {
        console.error('Error creating Zoho customer:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}
