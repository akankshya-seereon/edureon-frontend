import { useState } from "react";

/* ─────────────────────────────────────────────
   Mock data – replace with real API calls
───────────────────────────────────────────── */
const MOCK_FACULTY = {
  name: "Dr. Priya Sharma",
  employeeId: "FAC-2024-0042",
  department: "Computer Science",
  designation: "Associate Professor",
  bankAccount: "XXXX XXXX 7823",
  ifsc: "HDFC0001234",
  joiningDate: "01 Aug 2019",
};

const MOCK_SUMMARY = {
  totalEarned: 485000,
  pendingAmount: 62000,
  upcomingAmount: 62000,
  lastPaidDate: "28 Feb 2025",
};

const MOCK_PENDING = [
  { id: "SLP-2025-03", month: "March 2025", basic: 42000, hra: 12000, da: 6000, ta: 2000, gross: 62000, deductions: 7400, net: 54600, status: "Pending" },
];

const MOCK_UPCOMING = [
  { id: "SLP-2025-04", month: "April 2025", basic: 42000, hra: 12000, da: 6000, ta: 2000, gross: 62000, deductions: 7400, net: 54600, status: "Upcoming" },
  { id: "SLP-2025-05", month: "May 2025", basic: 42000, hra: 12000, da: 6000, ta: 2000, gross: 62000, deductions: 7400, net: 54600, status: "Upcoming" },
];

const MOCK_HISTORY = [
  { id: "SLP-2025-02", month: "February 2025", basic: 42000, hra: 12000, da: 6000, ta: 2000, gross: 62000, deductions: 7400, net: 54600, paidOn: "28 Feb 2025", status: "Paid" },
  { id: "SLP-2025-01", month: "January 2025", basic: 42000, hra: 12000, da: 6000, ta: 2000, gross: 62000, deductions: 7400, net: 54600, paidOn: "31 Jan 2025", status: "Paid" },
  { id: "SLP-2024-12", month: "December 2024", basic: 40000, hra: 11000, da: 5500, ta: 2000, gross: 58500, deductions: 7020, net: 51480, paidOn: "31 Dec 2024", status: "Paid" },
  { id: "SLP-2024-11", month: "November 2024", basic: 40000, hra: 11000, da: 5500, ta: 2000, gross: 58500, deductions: 7020, net: 51480, paidOn: "30 Nov 2024", status: "Paid" },
  { id: "SLP-2024-10", month: "October 2024", basic: 40000, hra: 11000, da: 5500, ta: 2000, gross: 58500, deductions: 7020, net: 51480, paidOn: "31 Oct 2024", status: "Paid" },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function StatCard({ label, value, icon, accent }) {
  const accents = {
    blue:   { bg: "#EFF6FF", icon: "#3B82F6", border: "#BFDBFE" },
    green:  { bg: "#F0FDF4", icon: "#22C55E", border: "#BBF7D0" },
    amber:  { bg: "#FFFBEB", icon: "#F59E0B", border: "#FDE68A" },
    purple: { bg: "#FAF5FF", icon: "#A855F7", border: "#E9D5FF" },
  };
  const c = accents[accent] || accents.blue;

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: c.bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 24, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 17, color: "#6B7280", fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px" }}>{value}</div>
      </div>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    Paid:     { bg: "#DCFCE7", color: "#16A34A" },
    Pending:  { bg: "#FEF3C7", color: "#D97706" },
    Upcoming: { bg: "#DBEAFE", color: "#2563EB" },
  };
  const s = map[status] || map.Upcoming;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 20,
      fontWeight: 600, background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  );
}

/* ── Salary Slip Modal ── */
function SalarySlipModal({ slip, faculty, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div id="salary-slip-print" style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
          color: "#fff", padding: "28px 32px", borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 17, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase", marginBottom: 6 }}>
                Salary Slip
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{slip.month}</div>
              <div style={{ fontSize: 17, opacity: 0.8, marginTop: 4 }}>Slip ID: {slip.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {slip.paidOn && (
                <div style={{ fontSize: 20, opacity: 0.8, marginBottom: 8 }}>
                  Paid on: <strong>{slip.paidOn}</strong>
                </div>
              )}
              <Badge status={slip.status} />
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {/* Employee Info */}
          <div style={{
            background: "#F8FAFC", borderRadius: 10, padding: "16px 20px",
            marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px",
          }}>
            {[
              ["Employee Name", faculty.name],
              ["Employee ID", faculty.employeeId],
              ["Department", faculty.department],
              ["Designation", faculty.designation],
              ["Bank Account", faculty.bankAccount],
              ["IFSC Code", faculty.ifsc],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 17, color: "#9CA3AF", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#1F2937" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Earnings & Deductions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Earnings */}
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "#F0FDF4", padding: "10px 16px", fontWeight: 700, fontSize: 17, color: "#15803D" }}>
                Earnings
              </div>
              {[
                ["Basic Salary", slip.basic],
                ["HRA", slip.hra],
                ["Dearness Allowance", slip.da],
                ["Travel Allowance", slip.ta],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "9px 16px", borderTop: "1px solid #F3F4F6", fontSize: 17,
                }}>
                  <span style={{ color: "#6B7280" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{fmt(v)}</span>
                </div>
              ))}
            </div>

            {/* Deductions */}
            <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "#FFF7F7", padding: "10px 16px", fontWeight: 700, fontSize: 17, color: "#DC2626" }}>
                Deductions
              </div>
              {[
                ["PF (12%)", Math.round(slip.basic * 0.12)],
                ["Professional Tax", 200],
                ["TDS", slip.deductions - Math.round(slip.basic * 0.12) - 200],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "9px 16px", borderTop: "1px solid #F3F4F6", fontSize: 17,
                }}>
                  <span style={{ color: "#6B7280" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#DC2626" }}>{fmt(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net Pay */}
          <div style={{
            background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
            borderRadius: 12, padding: "18px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            color: "#fff", marginBottom: 24,
          }}>
            <div>
              <div style={{ fontSize: 20, opacity: 0.75 }}>Gross Salary</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{fmt(slip.gross)}</div>
            </div>
            <div style={{ fontSize: 20, opacity: 0.5 }}>−</div>
            <div>
              <div style={{ fontSize: 20, opacity: 0.75 }}>Total Deductions</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#FCA5A5" }}>{fmt(slip.deductions)}</div>
            </div>
            <div style={{ fontSize: 20, opacity: 0.5 }}>=</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, opacity: 0.75 }}>Net Pay</div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{fmt(slip.net)}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{
              padding: "10px 22px", borderRadius: 8, border: "1px solid #E5E7EB",
              background: "#fff", cursor: "pointer", fontSize: 20, fontWeight: 500, color: "#374151",
            }}>
              Close
            </button>
            <button onClick={handlePrint} style={{
              padding: "10px 22px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
              cursor: "pointer", fontSize: 20, fontWeight: 600, color: "#fff",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              🖨️ Print / Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Salary Component
───────────────────────────────────────────── */
export default function FacultySalary() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedSlip, setSelectedSlip] = useState(null);

  const tabs = [
    { id: "dashboard", label: "Dashboard",        icon: "📊" },
    { id: "pending",   label: "Pending Payments", icon: "⏳" },
    { id: "upcoming",  label: "Upcoming Payments", icon: "📅" },
    { id: "history",   label: "Salary Slip",       icon: "🧾" },
  ];

  return (
    <div style={{
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      minHeight: "100vh", background: "#F1F5F9", padding: "28px 32px",
      textAlign: "left",
    }}>
      {/* Page Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0F172A", margin: 0 }}>
          💰 Salary
        </h1>
        <p style={{ fontSize: 20, color: "#64748B", marginTop: 4 }}>
          Manage your salary details, track payments and download salary slips.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, background: "#fff",
        borderRadius: 12, padding: 6, marginBottom: 28,
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)", width: "fit-content",
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 20, fontWeight: 600, transition: "all 0.18s",
            textAlign: "left",
            background: activeTab === t.id ? "#2563EB" : "transparent",
            color: activeTab === t.id ? "#fff" : "#6B7280",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ── */}
      {activeTab === "dashboard" && (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16, marginBottom: 28,
          }}>
            <StatCard label="Total Earned (YTD)" value={fmt(MOCK_SUMMARY.totalEarned)} icon="💼" accent="blue" />
            <StatCard label="Pending Amount"      value={fmt(MOCK_SUMMARY.pendingAmount)} icon="⏳" accent="amber" />
            <StatCard label="Next Salary"         value={fmt(MOCK_SUMMARY.upcomingAmount)} icon="📅" accent="purple" />
            <StatCard label="Last Paid On"        value={MOCK_SUMMARY.lastPaidDate} icon="✅" accent="green" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
            {/* Profile Card */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: 24,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)", height: "fit-content",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, color: "#fff", marginBottom: 14,
              }}>
                👩‍🏫
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#0F172A" }}>{MOCK_FACULTY.name}</div>
              <div style={{ fontSize: 17, color: "#6B7280", marginBottom: 16 }}>{MOCK_FACULTY.designation}</div>
              {[
                ["Employee ID",  MOCK_FACULTY.employeeId],
                ["Department",   MOCK_FACULTY.department],
                ["Bank Account", MOCK_FACULTY.bankAccount],
                ["IFSC",         MOCK_FACULTY.ifsc],
                ["Joining Date", MOCK_FACULTY.joiningDate],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0", borderTop: "1px solid #F3F4F6", fontSize: 17,
                }}>
                  <span style={{ color: "#9CA3AF" }}>{k}</span>
                  <span style={{ fontWeight: 600, color: "#374151" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Recent Payments Table */}
            <div style={{
              background: "#fff", borderRadius: 16, padding: 24,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: "#0F172A", marginBottom: 18 }}>
                Recent Salary History
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Month", "Gross", "Deductions", "Net Pay", "Paid On", "Status", "Slip"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left",
                        color: "#6B7280", fontWeight: 600, fontSize: 20,
                        borderBottom: "1px solid #E5E7EB",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_HISTORY.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, color: "#111827" }}>{r.month}</td>
                      <td style={{ padding: "11px 14px" }}>{fmt(r.gross)}</td>
                      <td style={{ padding: "11px 14px", color: "#DC2626" }}>{fmt(r.deductions)}</td>
                      <td style={{ padding: "11px 14px", fontWeight: 700, color: "#1E40AF" }}>{fmt(r.net)}</td>
                      <td style={{ padding: "11px 14px", color: "#6B7280" }}>{r.paidOn}</td>
                      <td style={{ padding: "11px 14px" }}><Badge status={r.status} /></td>
                      <td style={{ padding: "11px 14px" }}>
                        <button onClick={() => setSelectedSlip(r)} style={{
                          padding: "5px 12px", borderRadius: 6, border: "1px solid #DBEAFE",
                          background: "#EFF6FF", color: "#2563EB", cursor: "pointer",
                          fontSize: 20, fontWeight: 600,
                        }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PENDING ── */}
      {activeTab === "pending" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0F172A", marginBottom: 6 }}>
            ⏳ Pending Payments
          </div>
          <p style={{ fontSize: 17, color: "#6B7280", marginBottom: 20 }}>
            Salaries that have been processed by the admin but not yet credited to your account.
          </p>
          {MOCK_PENDING.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
              🎉 No pending payments. You're all clear!
            </div>
          ) : (
            MOCK_PENDING.map((s) => (
              <div key={s.id} style={{
                border: "1px solid #FDE68A", borderRadius: 12, padding: 20,
                background: "#FFFBEB", marginBottom: 14,
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 16,
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 20, color: "#92400E" }}>Month</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.month}</div>
                  <div style={{ fontSize: 20, color: "#9CA3AF" }}>{s.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, color: "#92400E" }}>Gross</div>
                  <div style={{ fontWeight: 600 }}>{fmt(s.gross)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, color: "#92400E" }}>Deductions</div>
                  <div style={{ fontWeight: 600, color: "#DC2626" }}>{fmt(s.deductions)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, color: "#92400E" }}>Net Pay</div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: "#1E40AF" }}>{fmt(s.net)}</div>
                </div>
                <button onClick={() => setSelectedSlip(s)} style={{
                  padding: "9px 18px", borderRadius: 8, border: "none",
                  background: "linear-gradient(135deg, #D97706, #F59E0B)",
                  color: "#fff", cursor: "pointer", fontSize: 20, fontWeight: 600,
                }}>
                  View Slip
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── UPCOMING ── */}
      {activeTab === "upcoming" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0F172A", marginBottom: 6 }}>
            📅 Upcoming Payments
          </div>
          <p style={{ fontSize: 17, color: "#6B7280", marginBottom: 20 }}>
            Scheduled salary disbursements for future months based on your current pay structure.
          </p>
          {MOCK_UPCOMING.map((s) => (
            <div key={s.id} style={{
              border: "1px solid #BFDBFE", borderRadius: 12, padding: 20,
              background: "#EFF6FF", marginBottom: 14,
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 16,
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 20, color: "#1D4ED8" }}>Month</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.month}</div>
                <div style={{ fontSize: 20, color: "#9CA3AF" }}>{s.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 20, color: "#1D4ED8" }}>Gross</div>
                <div style={{ fontWeight: 600 }}>{fmt(s.gross)}</div>
              </div>
              <div>
                <div style={{ fontSize: 20, color: "#1D4ED8" }}>Deductions</div>
                <div style={{ fontWeight: 600, color: "#DC2626" }}>{fmt(s.deductions)}</div>
              </div>
              <div>
                <div style={{ fontSize: 20, color: "#1D4ED8" }}>Expected Net</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: "#1E40AF" }}>{fmt(s.net)}</div>
              </div>
              <Badge status={s.status} />
            </div>
          ))}
        </div>
      )}

      {/* ── SALARY SLIP HISTORY ── */}
      {activeTab === "history" && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0F172A", marginBottom: 6 }}>
            🧾 Salary Slips
          </div>
          <p style={{ fontSize: 17, color: "#6B7280", marginBottom: 20 }}>
            Download or view your monthly salary slips for all past payments.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Slip ID", "Month", "Gross Salary", "Deductions", "Net Pay", "Paid On", "Status", "Action"].map((h) => (
                  <th key={h} style={{
                    padding: "11px 14px", textAlign: "left",
                    color: "#6B7280", fontWeight: 600, fontSize: 20,
                    borderBottom: "1px solid #E5E7EB",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px", color: "#6B7280", fontSize: 12 }}>{r.id}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>{r.month}</td>
                  <td style={{ padding: "12px 14px" }}>{fmt(r.gross)}</td>
                  <td style={{ padding: "12px 14px", color: "#DC2626" }}>{fmt(r.deductions)}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#1E40AF" }}>{fmt(r.net)}</td>
                  <td style={{ padding: "12px 14px", color: "#6B7280" }}>{r.paidOn}</td>
                  <td style={{ padding: "12px 14px" }}><Badge status={r.status} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => setSelectedSlip(r)} style={{
                      padding: "6px 14px", borderRadius: 6, border: "1px solid #DBEAFE",
                      background: "#EFF6FF", color: "#2563EB", cursor: "pointer",
                      fontSize: 20, fontWeight: 600,
                    }}>
                      🧾 View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slip Modal */}
      {selectedSlip && (
        <SalarySlipModal
          slip={selectedSlip}
          faculty={MOCK_FACULTY}
          onClose={() => setSelectedSlip(null)}
        />
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #salary-slip-print, #salary-slip-print * { visibility: visible; }
          #salary-slip-print { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}