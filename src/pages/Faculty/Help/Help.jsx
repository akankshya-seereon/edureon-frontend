import { useState } from "react";
import {
  Send,
  Paperclip,
  ChevronDown,
  BookOpen,
  Users,
  ClipboardList,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
} from "lucide-react";

export const Help = () => {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const issueTypes = [
    "Technical Issue",
    "Account Problem",
    "Course Related",
    "Assignment Issue",
    "Attendance Problem",
    "Exam Related",
    "Other",
  ];

  const quickHelp = [
    {
      title: "How to mark attendance?",
      description: "Go to Attendance → Mark Attendance, select class and date",
      icon: <Users size={18} />,
      color: "blue",
    },
    {
      title: "Create assignments",
      description: "Navigate to Assignments → Create Assignment",
      icon: <ClipboardList size={18} />,
      color: "green",
    },
    {
      title: "Upload course content",
      description: "Go to Courses → Select Course → Add Module",
      icon: <BookOpen size={18} />,
      color: "purple",
    },
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: "text-blue-500 bg-blue-100",
      title: "text-blue-700",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-100",
      icon: "text-green-500 bg-green-100",
      title: "text-green-700",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-100",
      icon: "text-purple-500 bg-purple-100",
      title: "text-purple-700",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueType || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIssueType("");
      setDescription("");
      setAttachment(null);
    }, 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Help &amp; Support</h1>
        <p className="text-gray-500 mt-1">Get assistance with any issues or questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submit Ticket */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-left text-gray-800 mb-6">Submit Support Ticket</h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ticket Submitted!</h3>
                <p className="text-gray-500">
                  We've received your request. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Issue Type */}
                <div>
                  <label className="block text-md text-left font-medium text-gray-700 mb-2">
                    Issue Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-500 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <span className={issueType ? "text-gray-800" : ""}>
                        {issueType || "Select issue type"}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {issueTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setIssueType(type);
                              setDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 text-md transition"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-left text-md font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Please describe your issue in detail..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-left text-md font-medium text-gray-700 mb-2">
                    Attachment (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition">
                      <span className="text-gray-500 text-md">
                        {attachment ? attachment.name : "Choose File  No file chosen"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <Paperclip size={18} className="text-gray-400" />
                    </label>
                  </div>
                  <p className="text-md text-gray-400 mt-1">
                    Max file size: 5MB (JPG, PNG, PDF, DOC)
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!issueType || !description.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Send size={16} />
                    Submit Ticket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Quick Help + Contact */}
        <div className="space-y-6">
          {/* Quick Help */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Help</h2>
            <div className="space-y-3">
              {quickHelp.map((item) => {
                const c = colorMap[item.color];
                return (
                  <div
                    key={item.title}
                    className={`p-4 rounded-xl border ${c.bg} ${c.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${c.icon} flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={`font-semibold text-md ${c.title}`}>{item.title}</p>
                        <p className="text-md text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-md text-gray-500">Email Support</p>
                  <p className="text-md font-medium text-gray-800">support@edumanage.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Phone size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="text-md text-gray-500">Phone Support</p>
                  <p className="text-md font-medium text-gray-800">+1 (800) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <MessageCircle size={18} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-md text-gray-500">Live Chat</p>
                  <p className="text-md font-medium text-gray-800">Available 9AM – 6PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;