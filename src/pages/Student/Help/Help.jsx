import { useState } from 'react';
import { AlertCircle, Plus, MessageSquare, Check, Clock, X } from 'lucide-react';

export default function Help() {
  const [activeTab, setActiveTab] = useState('help'); // 'help' or 'myTickets'
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage?.getItem('support_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    attachment: null,
  });

  const [errors, setErrors] = useState({});

  // Mock tickets for demo
  const mockTickets = [
    {
      id: 'TKT-001',
      issueType: 'Technical Issue',
      description: 'Unable to access course materials',
      status: 'Resolved',
      createdDate: 'Feb 10, 2026',
      resolvedDate: 'Feb 12, 2026',
    },
    {
      id: 'TKT-002',
      issueType: 'Account Issue',
      description: 'Password reset request',
      status: 'In Progress',
      createdDate: 'Feb 14, 2026',
      resolvedDate: null,
    },
  ];

  const issueTypes = [
    'Technical Issue',
    'Account Issue',
    'Course Related',
    'Fee Related',
    'Other',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your issue';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          attachment: 'File size must be less than 5MB',
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        attachment: file.name,
      }));
      setErrors(prev => ({
        ...prev,
        attachment: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      issueType: formData.issueType,
      description: formData.description,
      attachment: formData.attachment,
      status: 'Open',
      createdDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      resolvedDate: null,
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage?.setItem('support_tickets', JSON.stringify(updatedTickets));

    // Reset form
    setFormData({
      issueType: '',
      description: '',
      attachment: null,
    });
    setErrors({});

    // Show success message
    alert('Ticket created successfully! We will get back to you soon.');
  };

  const handleClear = () => {
    setFormData({
      issueType: '',
      description: '',
      attachment: null,
    });
    setErrors({});
  };

  const handleResetTickets = () => {
    if (window.confirm('Reset all tickets?')) {
      localStorage?.removeItem('support_tickets');
      setTickets([]);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-700 border-blue-300',
      'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      Closed: 'bg-slate-100 text-slate-700 border-slate-300',
    };
    return colors[status] || colors.Open;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Resolved':
      case 'Closed':
        return <Check className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const displayTickets = tickets.length > 0 ? tickets : mockTickets;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-left md:text-5xl font-bold text-slate-900 mb-2">Help & Support</h1>
          <p className="text-lg text-slate-600 text-left">Get help with your queries and issues</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('help')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'help'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Create Ticket
          </button>
          <button
            onClick={() => setActiveTab('myTickets')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'myTickets'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            My Tickets
          </button>
        </div>

        {/* Help Tab */}
        {activeTab === 'help' && (
          <>
            {/* Before Creating Ticket Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Before creating a ticket</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      Check our FAQ section for common questions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      Review the user guide for step-by-step instructions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      Search existing tickets for similar issues
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Create Support Ticket Form */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Support Ticket</h2>
              <p className="text-slate-600 mb-6">Fill in the details below and we'll get back to you soon</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type */}
                <div>
                  <label className="block text-md text-left font-semibold text-slate-900 mb-2">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 text-slate-700 transition-all ${
                      errors.issueType ? 'border-red-500' : 'border-slate-200'
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select issue type</option>
                    {issueTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.issueType && (
                    <p className="text-red-500 text-md mt-1">{errors.issueType}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-left text-md font-semibold text-slate-900 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your issue in detail..."
                    rows="5"
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 text-slate-700 transition-all ${
                      errors.description ? 'border-red-500' : 'border-slate-200'
                    } focus:outline-none focus:border-blue-500 resize-none`}
                  />
                  <p className="text-md text-left text-slate-500 mt-2">
                    Provide as much detail as possible to help us resolve your issue quickly
                  </p>
                  {errors.description && (
                    <p className="text-red-500 text-md mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-left text-md font-semibold text-slate-900 mb-2">
                    Attachment (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-slate-400 transition-all">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-slate-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="font-semibold text-slate-900">Click to upload file</p>
                      <p className="text-md text-slate-500">Images, PDF, or DOC (max 5MB)</p>
                      {formData.attachment && (
                        <p className="text-md text-emerald-600 mt-2">✓ {formData.attachment}</p>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                  </label>
                  {errors.attachment && (
                    <p className="text-red-500 text-md mt-1">{errors.attachment}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Submit Ticket
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Other Ways to Reach Us */}
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Other Ways to Reach Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Email */}
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Email</h3>
                  <p className="text-lg font-bold text-slate-900">support@university.edu</p>
                </div>

                {/* Phone */}
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Phone</h3>
                  <p className="text-lg font-bold text-slate-900">+1 (555) 123-4567</p>
                </div>

                {/* Office Hours */}
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Office Hours</h3>
                  <p className="text-lg font-bold text-slate-900">Mon-Fri, 9 AM - 5 PM</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'myTickets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">My Support Tickets</h2>
              {tickets.length > 0 && (
                <button
                  onClick={handleResetTickets}
                  className="px-4 py-2 text-red-600 hover:text-red-800 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {displayTickets.length > 0 ? (
              <div className="space-y-4">
                {displayTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{ticket.issueType}</h3>
                        <p className="text-md text-slate-500">Ticket ID: {ticket.id}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-md font-semibold border flex items-center gap-1 ${getStatusColor(
                          ticket.status,
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-slate-700 mb-4">{ticket.description}</p>

                    <div className="flex items-center justify-between text-md text-slate-500">
                      <div className="flex gap-6">
                        <span>Created: {ticket.createdDate}</span>
                        {ticket.resolvedDate && <span>Resolved: {ticket.resolvedDate}</span>}
                      </div>
                      {ticket.attachment && (
                        <span className="text-blue-600 cursor-pointer hover:text-blue-800">
                          📎 {ticket.attachment}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-500 font-medium">No tickets yet</p>
                <p className="text-slate-400">Create a support ticket to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}