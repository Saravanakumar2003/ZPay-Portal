
import { useNavigate } from 'react-router-dom';
import '../assets/css/Adminpage.css'

function Admin() {
    const navigate = useNavigate();

    const handleViewTransactions = () => {
        navigate('/transactions');
    };

    const handleViewCustomers = () => {
        navigate('/customers');
    };

    const handleRefundCustomer = () => {
        navigate('/refund');
    };

    return (
        <div className="dashboard">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-purple-700 mb-6">Admin Dashboard</h1>
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
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Refund Customer</h2>
                        <p className="text-gray-600 mb-4">Initiate a refund for a customer.</p>
                        <button
                            onClick={handleRefundCustomer}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl"
                        >
                            Refund Customer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
