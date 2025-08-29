import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileSignature,
  Home,
  Upload,
  Plus,
  BookTemplate as FileTemplate,
} from "lucide-react";

const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FileSignature className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              DocuSign Pro
            </span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/upload"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/upload")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>

            <Link
              to="/create"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/create")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Link>

            <Link
              to="/templates"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive("/templates")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FileTemplate className="h-4 w-4" />
              <span>Templates</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
