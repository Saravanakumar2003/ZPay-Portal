import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // Add this import
import { collection, addDoc } from 'firebase/firestore'; // Add this import

function Pay() {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        name: '',
        email: '',
        phone: '',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionId, setSessionId] = useState(null); // Store session ID

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading]);

    // Generate payment session ID first
    const generatePaymentSession = async () => {
        const { amount, description } = formData;
        try {
            const res = await fetch('/api/createPaymentSession', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    currency: 'USD',
                    invoice_number: 'INV-' + Date.now(),
                    reference_number: '4113662000000240001',
                    description,
                    meta_data: [{ key: 'UserID', value: user.uid }],
                }),
            });
            const data = await res.json();
            if (!data.session?.payments_session_id) throw new Error('No payment session ID returned');
            setSessionId(data.session.payments_session_id);
            return data.session.payments_session_id;
        } catch (err) {
            alert('Failed to create payment session: ' + err.message);
            throw err;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePayment = async (e) => {
        e.preventDefault();

        const { amount, description, name, email, phone } = formData;
        if (!amount || !description || !name || !email || !phone) {
            alert('Please fill out all fields');
            return;
        }

        setIsProcessing(true);

        try {
            // Always generate session ID first
            const sessionId = await generatePaymentSession();
            if (!sessionId) {
                throw new Error('No payment session ID returned');
            }

            const instance = new window.ZPayments({
                account_id: '781461054',
                domain: 'US',
                "otherOptions": {
                    "api_key": "1003.e672bfbf3757e5b66aa0987496210fae.7c60492225e8d304b8614b59d5198051"
                }

            });

            console.log(amount, description, name, email, phone);

            await instance.requestPaymentMethod({
                amount,
                transaction_type: 'payment',
                currency_code: 'USD',
                payments_session_id: sessionId,
                business: 'ZPay Portal',
                description,
                invoice_number: 'INV-' + Date.now(),
                address: {
                    name,
                    email,
                    phone,
                },
            });

            await addDoc(collection(db, "transactions"), {
                userId: user ? user.uid : null,
                amount,
                description,
                name,
                email,
                phone,
                timestamp: new Date(),
                type: 'Payment',
            });

            await instance.close();
        } catch (err) {
            console.error(' Payment failed:', err);
            // alert already shown in generatePaymentSession if session fails
            if (!err.message.includes('No payment session ID returned')) {
                alert('Payment failed: ' + err.message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Pay Now</h2>
            <form onSubmit={handlePayment} className="space-y-4">
                <input
                    type="number"
                    name="amount"
                    placeholder="Amount (USD)"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Payment Description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition w-full"
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
        </div>
    );
}

export default Pay;