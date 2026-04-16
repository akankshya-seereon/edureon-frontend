import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Check, X, Plus } from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

// --- MOCK DATA ---
const attendanceData = [
  { name: 'CSE', val: 60 }, { name: 'ECE', val: 80 }, { name: 'ME', val: 40 },
  { name: 'CE', val: 90 }, { name: 'IT', val: 65 }, { name: 'EE', val: 95 },
  { name: 'AE', val: 70 }, { name: 'BBA', val: 85 }, { name: 'MBA', val: 60 }
];

const workloadData = [
  { name: 'Active', value: 75 },
  { name: 'Free', value: 25 }
];
const COLORS = ['#93c5fd', '#e2e8f0'];

const meetings = [
  { id: 1, time: '9:30', duration: '1hr', title: 'Academic Council Meeting', desc: 'All HODs, Dean · Senate Hall', status: 'In Progress', type: 'progress' },
  { id: 2, time: '11:30', duration: '30m', title: 'NAAC Prep Review', desc: 'IQAC Coordinator · Principal Office', status: 'Upcoming', type: 'upcoming' },
  { id: 3, time: '1:00', duration: '45m', title: 'Parent-Teacher Meet CSE', desc: 'CSE Faculty, Parents · Seminar Hall', status: 'Upcoming', type: 'upcoming' },
  { id: 4, time: '3:00', duration: '30m', title: 'Discipline Hearing', desc: 'Dean, Warden · Committee Room', status: 'Upcoming', type: 'upcoming' },
  { id: 5, time: '8:30', duration: '15m', title: 'Morning Briefing', desc: 'Registrar · Office', status: 'Done', type: 'done' },
];

const approvals = [
  { id: 1, type: 'Leave', details: 'Dr. Patel — 3 days casual' },
  { id: 2, type: 'NOC', details: 'Rahul Verma — Final clearance' },
  { id: 3, type: 'Blog', details: 'Student: AI in Education' },
];

// --- COMPONENT ---
const PrincipalDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-red-100 bg-red-50/30">
          <p className="text-slate-500 text-sm font-medium mb-2">Attendance</p>
          <h2 className="text-4xl font-bold text-red-500 mb-2">82%</h2>
          <p className="text-slate-400 text-sm">-2%</p>
        </div>
        <div className="p-5 rounded-xl border border-orange-100 bg-orange-50/30">
          <p className="text-slate-500 text-sm font-medium mb-2">Workload</p>
          <h2 className="text-4xl font-bold text-orange-400 mb-2">94%</h2>
          <p className="text-slate-400 text-sm">Faculty</p>
        </div>
        <div className="p-5 rounded-xl border border-green-100 bg-green-50/30">
          <p className="text-slate-500 text-sm font-medium mb-2">Pass Rate</p>
          <h2 className="text-4xl font-bold text-emerald-500 mb-2">91%</h2>
          <p className="text-slate-400 text-sm">+4%</p>
        </div>
        <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/30">
          <p className="text-slate-500 text-sm font-medium mb-2">Approvals</p>
          <h2 className="text-4xl font-bold text-blue-500 mb-2">12</h2>
          <p className="text-slate-400 text-sm">Pending</p>
        </div>
      </div>

      {/* 2. TODAY'S MEETINGS */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-600">Today's Meetings</h3>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-slate-800 transition">
            <Plus size={16} className="mr-1" /> Schedule
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {meetings.map((meeting) => {
            // Dynamic styling based on status
            const styles = {
              progress: { bg: 'bg-green-100/50', border: 'border-l-emerald-500', text: 'text-emerald-600', badge: '● In Progress' },
              upcoming: { bg: 'bg-blue-50/50', border: 'border-l-blue-500', text: 'text-blue-600', badge: '● Upcoming' },
              done: { bg: 'bg-slate-100/50', border: 'border-l-slate-400', text: 'text-slate-500', badge: '✔ Done' }
            }[meeting.type];

            return (
              <div key={meeting.id} className={`flex items-center justify-between p-4 rounded-lg border border-slate-200 border-l-4 ${styles.bg} ${styles.border}`}>
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[60px]">
                    <p className="font-bold text-slate-800 text-lg">{meeting.time}</p>
                    <p className="text-xs text-slate-400">{meeting.duration}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{meeting.title}</h4>
                    <p className="text-sm text-slate-500">{meeting.desc}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold flex items-center gap-1 ${styles.text}`}>
                  {styles.badge}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CHARTS & APPROVALS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-48">
            <h4 className="font-bold text-slate-500 mb-4">Attendance by Dept</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="val" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-48">
            <h4 className="font-bold text-slate-500 mb-2">Faculty Workload</h4>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={workloadData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                    {workloadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pending Approvals Table */}
        <div>
          <h3 className="text-lg font-bold text-slate-500 mb-4">Pending Approvals</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 text-sm font-medium">Type</th>
                  <th className="p-3 text-sm font-medium">Details</th>
                  <th className="p-3 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((item, idx) => (
                  <tr key={item.id} className={idx !== approvals.length - 1 ? 'border-b border-slate-100' : ''}>
                    <td className="p-3 text-sm text-slate-600">{item.type}</td>
                    <td className="p-3 text-sm text-slate-600">{item.details}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition">
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <span className="text-slate-300">|</span>
                        <button className="p-1 bg-red-100 text-red-500 rounded hover:bg-red-200 transition">
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrincipalDashboard;