import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileSignature,
  Home,
  Upload,
  Plus,
  BookTemplate as FileTemplate,
  Cpu,
  Menu,
  X,
} from "lucide-react";

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
      isActive(path)
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 min-w-0"
            onClick={() => setMenuOpen(false)}
          >
            <FileSignature className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 shrink-0" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              DocuSign Pro
            </span>
          </Link>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/" className={linkClass("/")}>
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link to="/upload" className={linkClass("/upload")}>
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>

            <Link to="/create" className={linkClass("/create")}>
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Link>

            <Link to="/templates" className={linkClass("/templates")}>
              <FileTemplate className="h-4 w-4" />
              <span>Templates</span>
            </Link>

            <Link to="/ai" className={linkClass("/ai")}>
              <Cpu className="h-4 w-4" />
              <span>AI</span>
            </Link>
          </nav>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1">
            <Link
              to="/"
              className={linkClass("/")}
              onClick={() => setMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/upload"
              className={linkClass("/upload")}
              onClick={() => setMenuOpen(false)}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Link>
            <Link
              to="/create"
              className={linkClass("/create")}
              onClick={() => setMenuOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Link>
            <Link
              to="/templates"
              className={linkClass("/templates")}
              onClick={() => setMenuOpen(false)}
            >
              <FileTemplate className="h-4 w-4" />
              <span>Templates</span>
            </Link>
            <Link
              to="/ai"
              className={linkClass("/ai")}
              onClick={() => setMenuOpen(false)}
            >
              <Cpu className="h-4 w-4" />
              <span>AI</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
