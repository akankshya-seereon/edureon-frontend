import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DollarSign, CheckCircle, AlertCircle, Calendar,
  Download, CreditCard, X, Landmark, Smartphone, Shield, FileText,
  TrendingUp, Receipt, Banknote, Search, SlidersHorizontal, Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Assuming you are using hot-toast like in the exams component

// 🎯 HELPER: Secure Auth Config
const getAuthConfig = () => {
  let token = localStorage.getItem("token");
  if (!token || token === "undefined") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      token = userObj?.token;
    } catch (e) {}
  }
  const config = { withCredentials: true }; 
  if (token && token !== "undefined" && token !== "null") {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return config;
};

// ── Receipt Generator ──────────────────────────────────────────────────────────
const downloadReceipt = (payment) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Receipt - ${payment.transactionId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 40px 20px; }
    .receipt { background: white; width: 480px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; padding: 32px; text-align: center; }
    .header h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { font-size: 13px; opacity: 0.85; margin-top: 4px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); border-radius: 999px; padding: 6px 14px; margin-top: 14px; font-size: 13px; font-weight: 600; }
    .body { padding: 32px; }
    .amount-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
    .amount-box .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .amount-box .amount { font-size: 40px; font-weight: 800; color: #1e40af; margin-top: 4px; }
    .divider { border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .row .key { font-size: 13px; color: #64748b; font-weight: 500; }
    .row .val { font-size: 13px; color: #0f172a; font-weight: 600; text-align: right; max-width: 60%; }
    .txn { font-family: monospace; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>🎓 EduPortal</h1>
    <p>Official Payment Receipt</p>
    <div class="badge">✅ Payment Successful</div>
  </div>
  <div class="body">
    <div class="amount-box">
      <div class="label">Amount Paid</div>
      <div class="amount">$${payment.amount}</div>
    </div>
    <div class="row"><span class="key">Fee Reference</span><span class="val">${payment.feeType}</span></div>
    <div class="row"><span class="key">Payment Date</span><span class="val">${payment.date}</span></div>
    <hr class="divider" />
    <div class="row"><span class="key">Transaction ID</span><span class="val txn">${payment.transactionId}</span></div>
    <div class="row"><span class="key">Status</span><span class="val" style="color:#16a34a">✓ Cleared</span></div>
  </div>
  <div class="footer">
    <p>This is an auto-generated receipt. Keep it for your records.<br/><strong>EduPortal Student Finance Portal</strong></p>
  </div>
</div>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `Receipt_${payment.transactionId}.html`; a.click();
  URL.revokeObjectURL(url);
};

// ── Payment Modal ──────────────────────────────────────────────────────────────
const PAYMENT_MODES = [
  { id: 'credit', label: 'Credit Card', Icon: CreditCard, desc: 'Visa / Mastercard / Amex' },
  { id: 'upi',    label: 'UPI',         Icon: Smartphone, desc: 'GPay, PhonePe, Paytm'    },
  { id: 'net',    label: 'Net Banking', Icon: Landmark,   desc: 'All major banks'           },
];

const PaymentModal = ({ fee, onConfirm, onCancel, processing }) => {
  const [mode, setMode] = useState('credit');
  const balanceDue = fee.amount - (fee.paidAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="h-1.5 bg-blue-600 w-full" />
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Complete Payment</h2>
              <p className="text-sm text-gray-500 mt-0.5">{fee.feeType}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="mx-6 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
          <p className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-1">Remaining Balance</p>
          <p className="text-3xl font-black text-blue-700">${balanceDue.toFixed(2)}</p>
          <p className="text-sm text-blue-500 mt-1">Due: {fee.dueDate}</p>
        </div>
        <div className="px-6 mb-5">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</p>
          <div className="space-y-2">
            {PAYMENT_MODES.map(({ id, label, Icon, desc }) => (
              <button key={id} onClick={() => setMode(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${mode === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${mode === id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${mode === id ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-md font-semibold ${mode === id ? 'text-blue-700' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${mode === id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                  {mode === id && <div className="w-full h-full rounded-full bg-white scale-[0.4]" />}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="flex-1 border border-gray-300 text-gray-700 text-md font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => onConfirm(mode, balanceDue)} disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-md font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition">
            {processing ? <Loader className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay ${balanceDue.toFixed(2)}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── UI Helpers ────────────────────────────────────────────────────────────
const getStatusConfig = (status, dueDate) => {
  const isPast = new Date(dueDate) < new Date() && status !== 'Paid';
  if (status === 'Paid') return { color: 'bg-emerald-100 text-emerald-700 border border-emerald-300', label: 'Paid', Icon: CheckCircle };
  if (status === 'Partial') return { color: 'bg-blue-100 text-blue-700 border border-blue-300', label: 'Partial', Icon: AlertCircle };
  if (isPast) return { color: 'bg-red-100 text-red-700 border border-red-300', label: 'Overdue', Icon: AlertCircle };
  return { color: 'bg-amber-100 text-amber-700 border border-amber-300', label: 'Unpaid', Icon: AlertCircle };
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function StudentFees() {
  const [activeTab, setActiveTab] = useState('fees');
  const [feeDetails, setFeeDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingFee, setPayingFee] = useState(null);
  const [processing, setProcessing] = useState(false);

  // 1. Fetch Fees dynamically from MySQL
  const loadFees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/student/fees", getAuthConfig());
      if (res.data.success) {
        const mappedFees = res.data.fees.map(f => ({
          id: f.id,
          // 🎯 UPDATED: Use the real fee_title from MySQL
          feeType: f.fee_title || `Institutional Fee #${f.id}`, 
          amount: parseFloat(f.total_amount),
          paidAmount: parseFloat(f.paid_amount || 0),
          dueDate: f.dueDate,
          rawDate: f.raw_due_date,
          status: f.status
        }));
        setFeeDetails(mappedFees);
      }
    } catch (error) {
      console.error("Error loading fees into UI:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  // 2. Calculations
  const totalFees = feeDetails.reduce((s, f) => s + f.amount, 0);
  const feesPaid  = feeDetails.reduce((s, f) => s + f.paidAmount, 0);
  const feesDue   = totalFees - feesPaid;
  const upcoming  = feeDetails.filter(f => f.status !== 'Paid').length;

  // 3. Fake history based on partially/fully paid fees
  const paymentHistory = feeDetails
    .filter(f => f.paidAmount > 0)
    .map(f => ({
      id: f.id,
      feeType: f.feeType,
      amount: f.paidAmount,
      paymentMode: 'Online',
      transactionId: `TXN${f.id}000${Math.floor(Math.random() * 900)}`,
      date: f.dueDate
    }));

  // 4. Handle Payment
  const handleConfirmPayment = async (mode, amountToPay) => {
    setProcessing(true);
    try {
      const res = await axios.post("http://localhost:5000/api/student/fees/pay", {
        feeId: payingFee.id,
        amountToPay: amountToPay,
        paymentMode: mode
      }, getAuthConfig());

      if (res.data.success) {
        toast.success(`Payment of $${amountToPay} successful!`);
        setPayingFee(null);
        loadFees(); // Reload data directly from DB
      }
    } catch (error) {
      toast.error("Payment failed to process.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        {payingFee && <PaymentModal fee={payingFee} processing={processing} onConfirm={handleConfirmPayment} onCancel={() => !processing && setPayingFee(null)} />}

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl text-left font-bold text-gray-900 mb-1">Fees & Payments</h1>
          <p className="text-md text-left text-gray-500">Manage your fee payments and view payment history</p>
        </div>

        {/* Tab Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab('fees')} className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${activeTab === 'fees' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
              <DollarSign className="w-4 h-4" /> Fees Due
              {activeTab === 'fees' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
            </button>
            <button onClick={() => setActiveTab('payments')} className={`relative flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${activeTab === 'payments' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-800'}`}>
              <CreditCard className="w-4 h-4" /> Payment History
              {activeTab === 'payments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />}
            </button>
          </div>

          <div className="p-6">
            {/* ── FEES TAB ── */}
            {activeTab === 'fees' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-white" /></div><span className="text-sm font-bold text-gray-600">Total Fees</span></div>
                    <p className="text-2xl font-black text-blue-900">${totalFees.toFixed(2)}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div><span className="text-sm font-bold text-gray-600">Fees Paid</span></div>
                    <p className="text-2xl font-black text-emerald-900">${feesPaid.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                    <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><AlertCircle className="w-4 h-4 text-white" /></div><span className="text-sm font-bold text-gray-600">Balance Due</span></div>
                    <p className="text-2xl font-black text-red-900">${feesDue.toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                    <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4 text-white" /></div><span className="text-sm font-bold text-gray-600">Pending Bills</span></div>
                    <p className="text-2xl font-black text-amber-900">{upcoming}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-md text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5 font-bold text-gray-700">Fee Ref</th>
                        <th className="px-5 py-3.5 font-bold text-gray-700">Total Amount</th>
                        <th className="px-5 py-3.5 font-bold text-gray-700">Balance Due</th>
                        <th className="px-5 py-3.5 font-bold text-gray-700">Due Date</th>
                        <th className="px-5 py-3.5 font-bold text-gray-700">Status</th>
                        <th className="px-5 py-3.5 font-bold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {feeDetails.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-gray-500">No fees assigned to your account.</td></tr>
                      ) : feeDetails.map((fee) => {
                        const s = getStatusConfig(fee.status, fee.rawDate);
                        const balance = fee.amount - fee.paidAmount;
                        return (
                          <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 font-bold text-gray-900">{fee.feeType}</td>
                            <td className="px-5 py-4 text-gray-700 font-medium">${fee.amount.toFixed(2)}</td>
                            <td className="px-5 py-4 text-red-600 font-bold">${balance.toFixed(2)}</td>
                            <td className="px-5 py-4 text-gray-700 font-medium">{fee.dueDate}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${s.color}`}>
                                <s.Icon className="w-3.5 h-3.5" />{s.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {balance > 0 ? (
                                <button onClick={() => setPayingFee(fee)} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm">
                                  Pay Now
                                </button>
                              ) : (
                                <span className="text-gray-400 font-bold text-sm">Cleared</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── PAYMENTS HISTORY TAB ── */}
            {activeTab === 'payments' && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-md text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5 font-bold text-gray-700">Transaction ID</th>
                      <th className="px-5 py-3.5 font-bold text-gray-700">Fee Ref</th>
                      <th className="px-5 py-3.5 font-bold text-gray-700">Amount Paid</th>
                      <th className="px-5 py-3.5 font-bold text-gray-700">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentHistory.length === 0 ? (
                       <tr><td colSpan="4" className="text-center py-8 text-gray-500">No payment history found.</td></tr>
                    ) : paymentHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-mono text-sm text-gray-600">{p.transactionId}</td>
                        <td className="px-5 py-4 font-bold text-gray-900">{p.feeType}</td>
                        <td className="px-5 py-4 font-black text-emerald-600">${p.amount.toFixed(2)}</td>
                        <td className="px-5 py-4">
                           <button onClick={() => downloadReceipt(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-700 font-bold text-xs transition">
                             <Download className="w-3.5 h-3.5" /> Download
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}