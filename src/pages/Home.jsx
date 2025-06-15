import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleMakePayment = () => {
    navigate('/pay');
  };

  const handleViewTransactions = () => {
    navigate('/transactions');
  };

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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">View Transactions</h2>
            <p className="text-gray-600 mb-4">Check all your past payment history in one place.</p>
            <button
              onClick={handleViewTransactions}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
