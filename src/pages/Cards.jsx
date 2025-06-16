import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Cards() {
    const { user } = useAuth();
    const [cardName, setCardName] = useState('');
    const [cardDesc, setCardDesc] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState(null);

    useEffect(() => {
        const fetchCard = async () => {
            if (!user) return;
            setLoading(true);
            setMessage('');

            try {
                // Get customer ID from Firestore
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const customerId = userSnap.exists() ? userSnap.data().zohoCustomerId : null;
                const paymentMethodId = userSnap.exists() ? userSnap.data().zohoPaymentMethodId : null;

                if (customerId && paymentMethodId) {
                    // Call your new API route
                    const res = await fetch('/api/retrieveCards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ paymentMethodId }),
                    });
                    const data = await res.json();
                    if (res.ok && data.payment_method) {
                        setCardData(data.payment_method);
                    } else {
                        setCardData(null);
                    }
                } else {
                    setCardData(null);
                    setMessage('No card found. Please add a card.');
                }
            } catch (err) {
                setMessage(`❌ ${err.message}`);
            } finally {
                setLoading(false);
            }
        }

        fetchCard();
        console.log('Fetching card data for user:', user?.uid); // Debugging line
        // eslint-disable-next-line
    }, [user]);

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!user) return setMessage('❌ User not authenticated.');

        setLoading(true);
        setMessage('');

        try {
            // Step 1: Get customer ID from Firestore
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            let customerId = userSnap.exists() ? userSnap.data().zohoCustomerId : null;
            if (!customerId) {
                setMessage('Creating customer in Zoho...');
            } else {
                setMessage('Customer already exists, proceeding to add card...');
            }

            // Step 2: If no customer ID, create one via API and save it
            if (!customerId) {
                const res = await fetch('/api/createCustomer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: cardName || 'No Name',
                        email: user.email,
                        phone: '0000000000',
                    }),
                });

                const data = await res.json();
                if (!res.ok || !data.customer_id) {
                    throw new Error(data.error || 'Zoho customer creation failed');
                }

                customerId = data.customer_id;
                await setDoc(userRef, { zohoCustomerId: customerId }, { merge: true });
            }

            // Step 3: Now create the card session
            const cardRes = await fetch('/api/createPaymentMethodSession', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_Id: customerId,
                    description: cardDesc || 'No Description',
                }),
            });

            const cardData = await cardRes.json();
            if (cardRes.ok && cardData.success) {
                setMessage('✅ Card session created! Opening widget...');
                const session = cardData.session.payment_method_session;
                const instance = new window.ZPayments({
                    account_id: '781461054',
                    domain: 'US',
                    otherOptions: {
                        api_key: '1003.e672bfbf3757e5b66aa0987496210fae.7c60492225e8d304b8614b59d5198051',
                    },
                });

                try {
                    let options = {
                        payment_method: "card",
                        transaction_type: "add",
                        customer_id: session.customer_id,
                        payment_method_session_id: session.payment_method_session_id,
                        address: {
                            name: cardName,
                            email: user.email,
                            address_line1: "",
                            address_line2: "",
                            city: "",
                            state: "",
                            country: "",
                            postal_code: ""
                        }
                    };
                    const result = await instance.requestPaymentMethod(options);
                    // Save payment method id to Firestore for future fetch
                    if (result && result.payment_method_id) {
                        await setDoc(userRef, { zohoPaymentMethodId: result.payment_method_id }, { merge: true });
                    }
                    setMessage('✅ Card added successfully!');
                    setCardData({
                        payment_method_id: result.payment_method_id,
                        customer_id: session.customer_id,
                        customer_name: cardName,
                        customer_email: user.email,
                        type: "card",
                        card: {
                            card_holder_name: cardName,
                            last_four_digits: result.last_four_digits || "****",
                            expiry_month: result.expiry_month || "",
                            expiry_year: result.expiry_year || "",
                            card_checks: {},
                        },
                        status: "active",
                        currency: "USD",
                        created_time: Date.now() / 1000,
                        last_modified_time: Date.now() / 1000,
                    });

                    await setDoc(doc(db, 'cards', result.payment_method_id), {
                        userId: user.uid,
                        cardHolderName: cardName,
                        cardDescription: cardDesc,
                        paymentMethodId: result.payment_method_id,
                        customerId: session.customer_id,
                        status: 'active',
                        createdAt: new Date(),
                    });
                    console.log('Card added successfully:', result);
                } catch (err) {
                    if (err.code !== 'widget_closed') {
                        setMessage(`❌ ${err.message}`);
                    }
                } finally {
                    await instance.close();
                }
            } else {
                throw new Error(cardData.error || 'Card creation failed');
            }
        }
        catch (err) {
            console.error('Error adding card:', err);
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // UI
    if (loading) {
        return <div className="p-6 max-w-md mx-auto">Loading...</div>;
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Add/Edit Card</h2>
            {cardData ? (
                <div className="mb-6 border rounded p-4 bg-gray-50">
                    <h3 className="mb-2 font-semibold">Card on file:</h3>
                    <div>Card Holder: {cardData.card?.card_holder_name}</div>
                    <div>Card: **** **** **** {cardData.card?.last_four_digits}</div>
                    <div>Expiry: {cardData.card?.expiry_month}/{cardData.card?.expiry_year}</div>
                    <div>Status: {cardData.status}</div>
                    <div className="flex gap-2 mt-4">
                        <button
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                            // onClick={handleEditCard} // To be implemented
                            disabled
                        >
                            Edit Card
                        </button>
                        <button
                            className="bg-red-600 text-white px-3 py-1 rounded"
                            // onClick={handleDeleteCard} // To be implemented
                            disabled
                        >
                            Delete Card
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleAddCard} className="space-y-4">
                    <h3>No Card Found</h3>
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Add Card'}
                    </button>
                </form>
            )}
            {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
    );
}