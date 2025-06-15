import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">All Transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Phone</th>
              <th className="py-2 px-4 border">Timestamp</th>
              <th className="py-2 px-4 border">User ID</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => (
              <tr key={txn.id}>
                <td className="py-2 px-4 border">{txn.amount}</td>
                <td className="py-2 px-4 border">{txn.description}</td>
                <td className="py-2 px-4 border">{txn.name}</td>
                <td className="py-2 px-4 border">{txn.email}</td>
                <td className="py-2 px-4 border">{txn.phone}</td>
                <td className="py-2 px-4 border">
                  {txn.timestamp?.toDate
                    ? txn.timestamp.toDate().toLocaleString()
                    : new Date(txn.timestamp).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">{txn.userId || "N/A"}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;