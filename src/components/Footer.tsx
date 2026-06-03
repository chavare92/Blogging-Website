import { Link } from "react-router";
import { PenLine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-gray-900">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <PenLine size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">Flowbotiq</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/write" className="hover:text-gray-900 transition-colors">Write</Link>
            <Link to="/about" className="hover:text-gray-900 transition-colors">About</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 Flowbotiq</p>
        </div>
      </div>
    </footer>
  );
}

