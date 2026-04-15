import { Eye, Trash2, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const statusStyles = {
  Active: "bg-green-100 text-green-700 border border-green-300",
  Suspended: "bg-red-100 text-red-700 border border-red-300",
  Trial: "bg-blue-100 text-blue-700 border border-blue-300",
};

const formatText = (text = "") =>
  text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export default function Institute() {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const storedInstitutes =
      JSON.parse(localStorage.getItem("institutes")) || [];
    setInstitutes(storedInstitutes);
    setFilteredInstitutes(storedInstitutes);
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let filtered = [...institutes];

    if (searchTerm) {
      filtered = filtered.filter((inst) =>
        inst?.organisation?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "All") {
      filtered = filtered.filter(
        (inst) => inst?.organisation?.type === typeFilter
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((inst) => inst?.status === statusFilter);
    }

    setFilteredInstitutes(filtered);
  }, [searchTerm, typeFilter, statusFilter, institutes]);

  /* ================= DELETE ================= */
  const deleteInstitute = (id) => {
    if (window.confirm("Are you sure you want to delete this institute?")) {
      const updated = institutes.filter((inst) => inst?.id !== id);
      setInstitutes(updated);
      localStorage.setItem("institutes", JSON.stringify(updated));
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const toggleStatus = (id, currentStatus) => {
    const updated = institutes.map((inst) =>
      inst?.id === id
        ? {
            ...inst,
            status: currentStatus === "Active" ? "Suspended" : "Active",
          }
        : inst
    );

    setInstitutes(updated);
    localStorage.setItem("institutes", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-10xl">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
              Institute Master List
            </h1>
            <p className="text-gray-700 text-xl md:text-base">
              View and manage all registered institutes
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/institute/form")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition shadow-md w-full md:w-auto"
          >
            <Plus size={20} /> Add Institute
          </button>
        </div>

        {/* ================= STATS (MOVED TO TOP) ================= */}
        {institutes.length > 0 && (
          <div className="grid text-xl grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total" value={institutes.length} />
            <StatCard
              title="Active"
              value={institutes.filter((i) => i.status === "Active").length}
              color="text-green-600"
            />
            <StatCard
              title="Suspended"
              value={institutes.filter((i) => i.status === "Suspended").length}
              color="text-red-600"
            />
            <StatCard
              title="Trial"
              value={institutes.filter((i) => i.status === "Trial").length}
              color="text-blue-600"
            />
          </div>
        )}

        {/* ================= FILTERS ================= */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search institutes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="College">College</option>
              <option value="School">School</option>
              <option value="Institute">Institute</option>
              <option value="University">University</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Trial">Trial</option>
            </select>

            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Plans</option>
              <option>Premium</option>
              <option>Standard</option>
              <option>Trial</option>
            </select>
          </div>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-100 text-gray-800 text-lg">
              <tr>
                <th className="px-4 py-3 text-center">Organisation</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-center">Location</th>
                <th className="px-4 py-3 text-center">Plan</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInstitutes.map((inst) => (
                <tr key={inst?.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold">
                      {formatText(inst?.organisation?.name)}
                    </div>
                    <div className="text-md text-gray-500">
                      {inst?.organisation?.email}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {inst?.organisation?.type}
                  </td>

                  <td className="px-4 py-4">
                    {formatText(inst?.organisation?.city)},{" "}
                    {formatText(inst?.organisation?.state)}
                  </td>

                  <td className="px-4 py-4">
                    {inst?.plan || "Premium"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-md font-semibold ${statusStyles[inst?.status]}`}
                    >
                      {inst?.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {inst?.createdAt
                      ? new Date(inst.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/institute/${inst?.id}/view`, {
                            state: { institute: inst },
                          })
                        }
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() =>
                          toggleStatus(inst?.id, inst?.status)
                        }
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                      >
                        <CheckCircle size={16} />
                      </button>

                      <button
                        onClick={() => deleteInstitute(inst?.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="md:hidden space-y-4">
          {filteredInstitutes.map((inst) => (
            <div
              key={inst?.id}
              className="bg-white rounded-xl shadow-sm p-4 space-y-2"
            >
              <div className="font-semibold text-lg">
                {formatText(inst?.organisation?.name)}
              </div>
              <div className="text-md text-gray-500">
                {inst?.organisation?.email}
              </div>

              <div className="text-md">
                <strong>Type:</strong> {inst?.organisation?.type}
              </div>
              <div className="text-md">
                <strong>Location:</strong>{" "}
                {formatText(inst?.organisation?.city)},{" "}
                {formatText(inst?.organisation?.state)}
              </div>
              <div className="text-md">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-md ${statusStyles[inst?.status]}`}
                >
                  {inst?.status}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() =>
                    navigate(`/admin/institute/${inst?.id}/view`, {
                      state: { institute: inst },
                    })
                  }
                  className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg"
                >
                  View
                </button>

                <button
                  onClick={() =>
                    toggleStatus(inst?.id, inst?.status)
                  }
                  className="flex-1 bg-green-100 text-green-600 py-2 rounded-lg"
                >
                  Toggle
                </button>

                <button
                  onClick={() => deleteInstitute(inst?.id)}
                  className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE STAT CARD ================= */
function StatCard({ title, value, color = "text-gray-800" }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div className="text-md text-gray-500">{title}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}