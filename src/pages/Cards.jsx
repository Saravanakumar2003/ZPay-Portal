import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Cards() {
    const { user } = useAuth();
    const [cardName, setCardName] = useState('');
    const [cardDesc, setCardDesc] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Editable fields:
    const [editExpiryMonth, setEditExpiryMonth] = useState('');
    const [editExpiryYear, setEditExpiryYear] = useState('');
    const [editBillingAddress, setEditBillingAddress] = useState({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
    });


    useEffect(() => {
        const fetchCard = async () => {
            if (!user) return;
            setLoading(true);
            setMessage('');

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const customerId = userSnap.exists() ? userSnap.data().zohoCustomerId : null;
                const paymentMethodId = userSnap.exists() ? userSnap.data().zohoPaymentMethodId : null;

                if (customerId && paymentMethodId) {
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
        };

        fetchCard();
        // eslint-disable-next-line
    }, [user]);

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!user) return setMessage('User not authenticated.');

        setLoading(true);
        setMessage('');

        try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            let customerId = userSnap.exists() ? userSnap.data().zohoCustomerId : null;

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
                await setDoc(userRef, { CustomerId: customerId }, { merge: true });
            }

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
                setMessage('Card session created! Opening widget...');
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

                    if (result && result.payment_method_id) {
                        await setDoc(userRef, { PaymentMethodId: result.payment_method_id }, { merge: true });

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
                            email: user.email,
                            customerId: session.customer_id,
                            status: 'active',
                            createdAt: new Date(),
                        });

                        setMessage(' Card added successfully!');
                    }
                } catch (err) {
                    if (err.code !== 'widget_closed') {
                        setMessage(` ${err.message}`);
                    }
                } finally {
                    await instance.close();
                }
            } else {
                throw new Error(cardData.error || 'Card creation failed');
            }
        } catch (err) {
            console.error('Error adding card:', err);
            setMessage(`${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async () => {
        if (!cardData?.payment_method_id) return;

        const confirmDelete = confirm('Are you sure you want to delete this card?');
        if (!confirmDelete) return;

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/deletePaymentMethod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_method_id: cardData.payment_method_id }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                // Delete from Firestore
                await deleteDoc(doc(db, 'cards', cardData.payment_method_id));
                setCardData(null);
                setMessage(' Card deleted successfully!');
            } else {
                setMessage(` ${data.error || 'Failed to delete card'}`);
            }
        } catch (err) {
            console.error('Error deleting card:', err);
            setMessage(` ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 max-w-md mx-auto">Loading...</div>;
    }

    const openEditModal = () => {
        if (!cardData) return;

        setEditExpiryMonth(cardData.card.expiry_month || '');
        setEditExpiryYear(cardData.card.expiry_year || '');
        setEditBillingAddress({
            name: cardData.card.card_holder_name || '',
            address_line1: '', // Update if you store this data somewhere
            address_line2: '',
            city: '',
            state: '',
            country: '',
            postal_code: '',
        });

        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/updatePaymentMethod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_method_id: cardData.payment_method_id,
                    expiry_month: editExpiryMonth,
                    expiry_year: editExpiryYear,
                    billing_address: editBillingAddress,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMessage('✅ Card updated successfully!');
                setCardData(data.payment_method);
                setShowEditModal(false);
            } else {
                setMessage(`❌ ${data.error || 'Failed to update card'}`);
            }
        } catch (err) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };



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
                            onClick={openEditModal}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                            Edit Card
                        </button>

                        <button
                            onClick={handleDeleteCard}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                            Delete Card
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleAddCard} className="space-y-4">
                    <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Cardholder Name"
                        className="w-full border px-3 py-2 rounded"
                    />
                    <input
                        type="text"
                        value={cardDesc}
                        onChange={(e) => setCardDesc(e.target.value)}
                        placeholder="Card Description (optional)"
                        className="w-full border px-3 py-2 rounded"
                    />
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

            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <form
                        onSubmit={handleEditSubmit}
                        className="bg-white p-6 rounded shadow-lg w-96 space-y-4"
                    >
                        <h3 className="text-xl font-bold mb-4">Edit Card</h3>

                        <div>
                            <label className="block font-medium">Expiry Month</label>
                            <input
                                type="text"
                                value={editExpiryMonth}
                                onChange={(e) => setEditExpiryMonth(e.target.value)}
                                placeholder="MM"
                                maxLength={2}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Expiry Year</label>
                            <input
                                type="text"
                                value={editExpiryYear}
                                onChange={(e) => setEditExpiryYear(e.target.value)}
                                placeholder="YY"
                                maxLength={2}
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Name</label>
                            <input
                                type="text"
                                value={editBillingAddress.name}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, name: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                                required
                            />
                        </div>

                        {/* Repeat for address_line1, address_line2, city, state, country, postal_code */}

                        <div>
                            <label className="block font-medium">Address Line 1</label>
                            <input
                                type="text"
                                value={editBillingAddress.address_line1}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, address_line1: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Address Line 2</label>
                            <input
                                type="text"
                                value={editBillingAddress.address_line2}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, address_line2: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">City</label>
                            <input
                                type="text"
                                value={editBillingAddress.city}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, city: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">State</label>
                            <input
                                type="text"
                                value={editBillingAddress.state}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, state: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Country</label>
                            <input
                                type="text"
                                value={editBillingAddress.country}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, country: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div>
                            <label className="block font-medium">Postal Code</label>
                            <input
                                type="text"
                                value={editBillingAddress.postal_code}
                                onChange={(e) =>
                                    setEditBillingAddress((prev) => ({ ...prev, postal_code: e.target.value }))
                                }
                                className="w-full border px-3 py-2 rounded"
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
}
