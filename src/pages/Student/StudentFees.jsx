import { Download, CreditCard, Clock, CheckCircle } from "lucide-react";

export const StudentFees = () => {
  const transactions = [
    { id: "TXN-8854", title: "Tuition Fee (Sem 1)", amount: "50,000", date: "2023-08-01", status: "Paid" },
    { id: "TXN-9921", title: "Exam Fee (Sem 1)", amount: "2,500", date: "2023-11-15", status: "Paid" },
    { id: "TXN-PEND", title: "Tuition Fee (Sem 2)", amount: "50,000", date: "Due: 2024-02-15", status: "Pending" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Fee Status</h1>

      {/* Summary Card */}
      <div className="bg-linear-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-slate-400 text-md font-medium mb-1">Total Outstanding</p>
          <h2 className="text-4xl font-bold">₹ 25,000</h2>
          <p className="text-slate-400 text-md mt-2">Due by 15 Feb, 2024</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/50">
          <CreditCard size={20} /> Pay Online
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-700">Payment History</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full shrink-0 ${txn.status === "Paid" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                   {txn.status === "Paid" ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{txn.title}</h4>
                  <p className="text-md text-slate-500 font-mono mt-0.5">{txn.id} • {txn.date}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <span className="font-bold text-slate-800">₹{txn.amount}</span>
                {txn.status === "Paid" ? (
                  <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Download Receipt">
                    <Download size={18} />
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-md font-bold rounded-full">Due</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};