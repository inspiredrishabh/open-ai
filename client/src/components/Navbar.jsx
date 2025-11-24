import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/";
  
  const handleBack = () => {
    navigate(-1);
  };

  const scrollToSection = (sectionId) => {
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page and then scroll
      navigate('/', { state: { scrollTo: sectionId } });
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-white dark:text-neutral-900" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
              SafeGuard AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4 xl:space-x-8">
            {!isHomePage && (
              <button
                onClick={handleBack}
                className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
            
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 px-1 sm:px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 px-1 sm:px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 whitespace-nowrap"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 px-1 sm:px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              About
            </button>
            
            <Link 
              to="/analyze"
              className="bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm lg:text-base font-medium px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Start Analysis
            </Link>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-500 transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle main menu"
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              {/* Hamburger Icon */}
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span 
                  className={`bg-current block h-0.5 w-6 rounded-sm transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                  }`}
                />
                <span 
                  className={`bg-current block h-0.5 w-6 rounded-sm transition-all duration-300 my-1 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span 
                  className={`bg-current block h-0.5 w-6 rounded-sm transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            {!isHomePage && (
              <button
                onClick={() => {
                  handleBack();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-3 text-base font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
            
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left px-3 py-3 text-base font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-all duration-200"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-3 py-3 text-base font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-all duration-200"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-3 py-3 text-base font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md transition-all duration-200"
            >
              About
            </button>
            
            <div className="pt-2">
              <Link
                to="/analyze"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-base font-medium px-6 py-3 mx-3 rounded-lg transition-all duration-200 shadow-sm"
              >
                Start Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}