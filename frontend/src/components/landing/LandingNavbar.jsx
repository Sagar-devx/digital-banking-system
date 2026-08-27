import React from 'react';
import { Link } from 'react-router-dom';
import { Building } from 'lucide-react';

export default function LandingNavbar({ isScrolled, onOpenAccessModal }) {
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 text-white">
            <Building className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">DigitalBank</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
          <a href="#architecture" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Architecture</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenAccessModal}
            className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
          >
            Access Account
          </button>
          <Link 
            to="/accounts/create"
            className="hidden sm:flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>
      </div>
    </nav>
  );
}
