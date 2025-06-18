
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Admin() {
    const navigate = useNavigate();

    const handleMakePayment = () => {
        navigate('/pay');
    };

    const handleViewTransactions = () => {
        navigate('/transactions');
    };

    const handleViewCustomers = () => {
        navigate('/customers');
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
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">View Transactions</h2>
                        <p className="text-gray-600 mb-4">Check all your past payment history in one place.</p>
                        <button
                            onClick={handleViewTransactions}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl"
                        >
                            View History
                        </button>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Charge Customer</h2>
                        <p className="text-gray-600 mb-4">Initiate a payment for a customer.</p>
                        <button
                            onClick={handleViewCustomers}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl"
                        >
                            Charge Customer
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

export default Admin;
