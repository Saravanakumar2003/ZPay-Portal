import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Home() {
    const navigate = useNavigate();

    const handleMakePayment = () => {
        navigate('/pay');
    };

    const handleSaveCard = () => {
        navigate('/cards');
    };

    const handlelogout = async () => {
        try {
            await signOut(auth);
            console.log('User logged out');
        } catch (err) {
            alert('Logout failed: ' + err.message);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-100 to-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-purple-700 mb-6">Welcome, [User] 👋</h1>

                <div className="grid gap-6 sm:grid-cols-2">
                    
                    <div className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Make a Payment</h2>
                        <p className="text-gray-600 mb-4">Initiate a payment with Zoho Payments widget.</p>
                        <button
                            onClick={handleMakePayment}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl"
                        >
                            Go to Payment
                        </button>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Save your Card</h2>
                        <p className="text-gray-600 mb-4">Save your card details for future payments.</p>
                        <button
                            onClick={handleSaveCard}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl"
                        >
                            Save Card
                        </button>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logout</h2>
                        <p className="text-gray-600 mb-4">Exit the portal securely.</p>
                        <button
                            onClick={() => {
                                handlelogout();
                                navigate('/');
                                alert('Logged out successfully!');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <footer className="mt-8">
                    <p className="text-center text-gray-600">
                        &copy; {new Date().getFullYear()} ZPay Portal. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default Home;
