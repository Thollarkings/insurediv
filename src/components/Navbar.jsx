import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 glass border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <Shield className="text-gold w-10 h-10" />
                        <span className="text-3xl font-bold text-navy-900 tracking-tight">DIVINE <span className="text-gold">INSURE</span></span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-navy-800 hover:text-gold transition-colors font-medium">Home</Link>
                        <Link to="/about" className="text-navy-800 hover:text-gold transition-colors font-medium">About</Link>
                        <Link to="/contact" className="text-navy-800 hover:text-gold transition-colors font-medium">Contact Us</Link>
                        <Link
                            to="/contact"
                            className="bg-navy-900 text-white px-6 py-2.5 rounded-full hover:bg-gold hover:text-navy-900 transition-all duration-300 shadow-lg font-semibold"
                        >
                            Get a Quote
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-navy-900">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass border-t border-white/20 py-4 px-6 space-y-4">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block text-navy-800 font-medium">Home</Link>
                    <Link to="/about" onClick={() => setIsOpen(false)} className="block text-navy-800 font-medium">About</Link>
                    <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-navy-800 font-medium">Contact Us</Link>
                    <Link
                        to="/contact"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center bg-navy-900 text-white px-6 py-2.5 rounded-full font-semibold"
                    >
                        Get a Quote
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
