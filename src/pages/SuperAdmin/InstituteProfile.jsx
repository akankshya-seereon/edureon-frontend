import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Building2, 
  Phone, 
  Users, 
  FileText, 
  MapPin, 
  Loader2,  
  AlertCircle
} from "lucide-react";
import { adminService } from "../../services/adminService";

// Helper component to display fields cleanly and handle "N/A"
const DisplayField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium break-words">
      {value ? value : <span className="text-slate-400 italic">N/A</span>}
    </div>
  </div>
);

export const InstituteProfile = () => {
  const { id } = useParams(); // Gets the ID from the URL (e.g., /super-admin/institutes/2/view)
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstituteData = async () => {
      try {
        setLoading(true);
        // Fetch the full heavy JSON data from the backend
        const response = await adminService.getInstituteById(id);
        if (response.success) {
          setInstitute(response.data);
        } else {
          setError("Failed to load institute data.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInstituteData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 font-medium">Loading full profile data...</p>
      </div>
    );
  }

  if (error || !institute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-slate-600 mt-2">{error}</p>
      </div>
    );
  }

  const { organisation, directors, legal, branches, institute_code, admin_email, status } = institute;

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Institute Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Viewing comprehensive details and configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 block uppercase font-bold">Institute Code</span>
            <span className="text-lg font-bold text-blue-700">{institute_code || "N/A"}</span>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-bold ${status === 'Active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <span className="text-xs block uppercase text-opacity-70">Status</span>
            {status || "N/A"}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: ORGANISATION DETAILS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Organisation Details</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DisplayField label="Registered Name" value={organisation?.name} />
            <DisplayField label="Organisation Type" value={organisation?.type} />
            <DisplayField label="Head Office Location" value={organisation?.headOffice} />
            <DisplayField label="Official Email" value={organisation?.email} />
            <DisplayField label="Secondary Email" value={organisation?.secondaryEmail} />
            <DisplayField label="Phone Number" value={organisation?.phone} />
            <DisplayField label="Alternate Phone" value={organisation?.altPhone} />
            <DisplayField label="Admin Login Email" value={admin_email} />
            <DisplayField label="Address Line 1" value={organisation?.address1} />
            <DisplayField label="Address Line 2" value={organisation?.address2} />
            <DisplayField label="City" value={organisation?.city} />
            <DisplayField label="State" value={organisation?.state} />
            <DisplayField label="PIN Code" value={organisation?.pin} />
          </div>
        </div>

        {/* SECTION 2: DIRECTORS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Partners / Directors</h2>
          </div>

          {directors && directors.length > 0 ? (
            <div className="space-y-8">
              {directors.map((dir, idx) => (
                <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Director {idx + 1}: {dir.name || "N/A"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DisplayField label="Email" value={dir.email} />
                    <DisplayField label="Contact Number" value={dir.contact} />
                    <DisplayField label="Gender" value={dir.gender} />
                    <DisplayField label="Date of Birth" value={dir.dob} />
                    <DisplayField label="% of Interest" value={dir.interest} />
                    <DisplayField label="Father's Name" value={dir.father} />
                    <DisplayField label="PAN Number" value={dir.documents?.panNo} />
                    <DisplayField label="Aadhaar Number" value={dir.documents?.aadhaarNo} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No director details found.</p>
          )}
        </div>

        {/* SECTION 3: LEGAL DOCUMENTS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Legal & Certifications</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DisplayField label="PAN Number" value={legal?.panNo} />
            <DisplayField label="GSTIN Number" value={legal?.gstinNo} />
            <DisplayField label="Trust Deed / Society Reg." value={legal?.trustDeed} />
            <DisplayField label="DISE Code" value={legal?.diseCode} />
            <DisplayField label="Property Deed Ref" value={legal?.propertyDeed} />
            <DisplayField label="Building Approval" value={legal?.buildingApproval} />
            <DisplayField label="Fire Dept NOC" value={legal?.fireNOC} />
            <DisplayField label="Police NOC" value={legal?.policeNOC} />
            <DisplayField label="Pollution Control NOC" value={legal?.pollutionNOC} />
            <DisplayField label="Education Dept NOC" value={legal?.educationDeptNOC} />
            <DisplayField label="Child Protection Policy" value={legal?.childProtectionPolicy} />
          </div>
        </div>

        {/* SECTION 4: BRANCHES */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <MapPin size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Branch Locations</h2>
          </div>

          {branches && branches.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {branches.map((branch, idx) => (
                <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">
                    {branch.shortName ? `[${branch.shortName}] ` : ''} {branch.name || "Branch " + (idx + 1)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DisplayField label="Contact Person" value={branch.contactPerson} />
                    <DisplayField label="Contact Number" value={branch.contactNo} />
                    <DisplayField label="Branch Email" value={branch.email} />
                    <DisplayField label="Branch GSTIN" value={branch.gstin} />
                    <div className="sm:col-span-2">
                      <DisplayField label="Address" value={`${branch.address1 || ''} ${branch.address2 || ''}, ${branch.city || ''}, ${branch.state || ''} - ${branch.pin || ''}`.trim() || null} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No branch details found.</p>
          )}
        </div>

      </div>
    </div>
  );
};