import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl font-bold text-slate-800 mt-4">Page Not Found</h2>
      <p className="text-slate-500 mt-2 max-w-md">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
        
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Home size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
};