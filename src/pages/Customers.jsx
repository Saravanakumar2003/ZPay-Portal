import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [chargeStatus, setChargeStatus] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chargeDetails, setChargeDetails] = useState({ amount: '', currency: 'USD' });

  useEffect(() => {
    async function fetchUsers() {
      const usersRef = collection(db, 'cards');
      const snapshot = await getDocs(usersRef);
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    }
    fetchUsers();
  }, []);

  const handleCharge = async (userId, user, amount) => {
    setChargeStatus(prev => ({ ...prev, [userId]: 'loading' }));

    try {
      const res = await fetch('/api/createPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.customerId,
          payment_method: user.paymentMethodId,
          amount: amount,
          currency: chargeDetails.currency,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setChargeStatus(prev => ({ ...prev, [userId]: 'success' }));
        alert(`Charged successfully!`);
        closeModal();
      } else {
        setChargeStatus(prev => ({ ...prev, [userId]: 'error' }));
        console.error('Payment error:', data);
      }
    } catch (err) {
      setChargeStatus(prev => ({ ...prev, [userId]: 'error' }));
      console.error('API error:', err);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setChargeDetails({ amount: '', currency: 'USD' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <ul className="space-y-4">
        {users.map(user => (
          <li key={user.id} className="p-4 border rounded shadow">
            <h3 className="text-xl font-semibold">Name: {user.cardHolderName}</h3>
            <p><strong>Customer ID:</strong> {user.customerId}</p>
            <p><strong>Payment Method ID:</strong> {user.paymentMethodId}</p>
            <p><strong>Status:</strong> {user.status}</p>
            <button
              onClick={() => openModal(user)}
              className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Charge Now
            </button>
          </li>
        ))}
      </ul>
      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Charge Customer</h3>
            <p><strong>Name:</strong> {selectedUser.cardHolderName}</p>
            <p><strong>Customer ID:</strong> {selectedUser.customerId}</p>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={chargeDetails.amount}
                onChange={(e) => setChargeDetails({ ...chargeDetails, amount: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter amount"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                value={chargeDetails.currency}
                onChange={(e) => setChargeDetails({ ...chargeDetails, currency: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="USD">USD</option>
                {/* Add more supported currencies if needed */}
              </select>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCharge(selectedUser.id, selectedUser, chargeDetails.amount)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Charge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
