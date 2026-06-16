import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-[999] bg-[#082e23]/92 backdrop-blur-md border-b border-emerald-900/35">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-2 cursor-pointer animate-fade-in">
          <div className="bg-emerald-300 text-emerald-950 rounded-full px-2 py-1 text-xs font-bold">
            KN
          </div>
          <span className="site-title text-xl font-bold  text-emerald-100">
            KONGU NEET
          </span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm">
          <a href="#home" className="text-emerald-100 hover:text-white transition-colors">
            Home
          </a>
          <a href="#about" className="text-emerald-100 hover:text-white transition-colors">
            About
          </a>
          <a href="#features" className="text-emerald-100 hover:text-white transition-colors">
            Features
          </a>
          <a href="#contact" className="text-emerald-100 hover:text-white transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => navigate("/student/login")}
            className="site-btn-ghost text-sm px-4 py-2 hidden sm:inline-flex"
          >
            Student Login
          </button> */}
          <button onClick={() => navigate("/admin/login", { state: { forceLogin: true } })} className="site-btn-primary text-sm px-4 py-2 hidden sm:inline-flex">
            Admin Login
          </button>
          <button type="button" className="md:hidden admin-secondary-btn !px-3 !py-2" onClick={() => setIsMenuOpen(prev => !prev)}>
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="md:hidden border-t border-emerald-900/40 px-4 pb-4 pt-3 space-y-2 bg-[#0a3a2c]">
          <a href="#home" className="block text-emerald-100" onClick={() => setIsMenuOpen(false)}>
            Home
          </a>
          <a href="#about" className="block text-emerald-100" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="#features" className="block text-emerald-100" onClick={() => setIsMenuOpen(false)}>
            Features
          </a>
          <a href="#contact" className="block text-emerald-100" onClick={() => setIsMenuOpen(false)}>
            Contact
          </a>
          <button onClick={() => navigate("/student/login", { state: { forceLogin: true } })} className="site-btn-ghost text-sm px-4 py-2 w-full">
            Student Login
          </button>
          <button onClick={() => navigate("/admin/login", { state: { forceLogin: true } })} className="site-btn-primary text-sm px-4 py-2 w-full mt-1">
            Admin Login
          </button>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
