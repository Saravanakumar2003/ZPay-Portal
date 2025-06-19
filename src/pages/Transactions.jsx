import { useEffect, useMemo, useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import '../assets/css/Transactions.css';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(collection(db, "transactions"));
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

  const columns = useMemo(
    () => [
      { accessorKey: "timestamp", header: "Timestamp" },
      { accessorKey: "amount", header: "Amount" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "type", header: "Type" },
    ],
    []
  );

  const data = useMemo(() => {
    return transactions.map(txn => ({
      ...txn,
      timestamp: txn.timestamp?.toDate
        ? txn.timestamp.toDate().toLocaleString()
        : new Date(txn.timestamp).toLocaleString(),
    }));
  }, [transactions]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="transaction">
      <h2 className="text-2xl font-bold mb-4">All Transactions</h2>

      {/* Global Search */}
      <input
        type="text"
        placeholder="Search transactions..."
        style={{ color: "#fff" }}
        className="border p-2 mb-4 w-full"
        value={globalFilter || ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="py-2 px-4 border cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        {header.column.columnDef.header}
                        {header.column.getIsSorted() === "asc" ? " 🔼" : header.column.getIsSorted() === "desc" ? " 🔽" : ""}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-2 px-4 border">
                    {cell.renderValue()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;