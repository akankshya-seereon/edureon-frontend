import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Upload, ArrowLeft, Clock, FileCheck, CheckCircle, CalendarDays, Award } from 'lucide-react';

const MOCK_DETAILS = {
  1: {
    id: 1, title: 'Calculus Problem Set 5', course: 'Advanced Mathematics',
    section: 'Calculus Fundamentals', dueDate: 'Jan 30, 2026', maximumMarks: 100, status: 'pending',
    instructions: 'Solve all problems from Chapter 5. Show all working steps clearly.',
    description: 'This assignment covers integration techniques, partial fractions, and applications of integrals. Please ensure all steps are clearly shown for full credit.',
  },
  2: {
    id: 2, title: 'Physics Lab Report - Mechanics', course: 'Physics',
    section: 'Mechanics Fundamentals', dueDate: 'Feb 2, 2026', maximumMarks: 100, status: 'pending',
    instructions: 'Write a comprehensive lab report on the mechanics experiment.',
    description: 'Include methodology, observations, calculations, and conclusions.',
  },
  3: {
    id: 3, title: 'Data Structures Implementation', course: 'Computer Science',
    section: 'Advanced Data Structures', dueDate: 'Jan 28, 2026', maximumMarks: 100, status: 'submitted',
    instructions: 'Implement the required data structures in your preferred language.',
    description: 'Submit source code and documentation for the implementation.',
  },
  4: {
    id: 4, title: 'Linear Algebra Assignment 3', course: 'Advanced Mathematics',
    section: 'Linear Algebra', dueDate: 'Jan 20, 2026', maximumMarks: 100, status: 'evaluated',
    instructions: 'Solve matrix problems and provide proofs for theorems.',
    description: 'All work must be shown. Partial credit will be given for correct methodology.',
  },
};

const STATUS_STYLES = {
  pending:   'bg-orange-100 text-orange-700 border border-orange-300',
  submitted: 'bg-blue-100 text-blue-700 border border-blue-300',
  evaluated: 'bg-green-100 text-green-700 border border-green-300',
};

const StatusIcon = ({ status, className = "w-4 h-4" }) => {
  if (status === 'pending')   return <Clock className={className} />;
  if (status === 'submitted') return <FileCheck className={className} />;
  if (status === 'evaluated') return <CheckCircle className={className} />;
  return null;
};

export default function AssignmentDetails() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const { state } = useLocation();

  // Prefer state passed via navigate, fall back to mock data
  const base = state?.assignment ?? MOCK_DETAILS[parseInt(id)] ?? null;

  const [assignment, setAssignment] = useState(base);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt]   = useState(
    base?.status === 'submitted' ? 'Previously submitted' : null
  );

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">Assignment not found.</p>
          <button onClick={() => navigate('/student/assignments')}
            className="text-blue-600 hover:underline text-sm">← Back to Assignments</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setAssignment(prev => ({ ...prev, status: 'submitted' }));
    setSubmittedAt(`${dateStr} at ${timeStr}`);
    setIsSubmitting(false);
  };

  const isSubmitted  = assignment.status === 'submitted';
  const isEvaluated  = assignment.status === 'evaluated';
  const canSubmit    = assignment.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate('/student/assignments')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </button>

        {/* ── Main Card ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-left">

          {/* Header */}
          <div className="p-6 border-b border-gray-200 text-left">
            <div className="flex items-start justify-between gap-4 flex-wrap text-left">
              <div className="flex-1 min-w-0 text-left">
                <h1 className="text-xl font-bold text-gray-900 mb-1 leading-tight text-left">{assignment.title}</h1>
                <p className="text-sm text-gray-500 text-left">
                  {assignment.course}{assignment.section ? ` • ${assignment.section}` : ''}
                </p>
              </div>
              <span className={`inline-flex text-left gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[assignment.status] ?? 'bg-gray-100 text-gray-600'}`}>
                <StatusIcon status={assignment.status} />
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-200 text-left">
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-left">
                <CalendarDays className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Due Date</p>
                <p className="text-sm font-bold text-gray-900">{assignment.dueDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-left">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium text-left">Maximum Marks</p>
                <p className="text-sm font-bold text-gray-900 text-left">{assignment.maximumMarks}</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 border-b border-gray-200 space-y-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide text-left">Instructions</h2>
            <p className="text-sm text-gray-700 leading-relaxed text-left">{assignment.instructions}</p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 leading-relaxed text-left">{assignment.description}</p>
            </div>
          </div>

          {/* Submit / Status Section */}
          <div className="p-6">

            {/* ── Evaluated ──────────────────────────────────────────────────── */}
            {isEvaluated && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-base font-bold text-green-700 mb-1">Assignment Evaluated</p>
                <p className="text-sm text-green-600">Your marks have been updated. Check your results page.</p>
              </div>
            )}

            {/* ── Submitted ──────────────────────────────────────────────────── */}
            {isSubmitted && !isEvaluated && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <FileCheck className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <p className="text-base font-bold text-blue-700 mb-1">Assignment Submitted!</p>
                <p className="text-sm text-blue-600 mb-1">
                  Your assignment has been successfully submitted and is awaiting evaluation.
                </p>
                {submittedAt && submittedAt !== 'Previously submitted' && (
                  <p className="text-xs text-blue-500 mt-3 pt-3 border-t border-blue-200">
                    Submitted on {submittedAt}
                  </p>
                )}
              </div>
            )}

            {/* ── Pending / Can Submit ────────────────────────────────────────── */}
            {canSubmit && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Click the button below to submit your completed assignment. Make sure all your work is ready before submitting.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2.5 transition-all duration-200 ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit Assignment
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submission Guidelines */}
        <div className="mt-5 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Submission Guidelines</h3>
          <ul className="space-y-2.5 text-sm text-gray-600">
            {[
              'Ensure all your work is legible and clearly labeled',
              'Submit only in PDF or document format',
              'Include your name and ID number on the submission',
              'Late submissions will be subject to a 10% deduction per day',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="text-blue-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}