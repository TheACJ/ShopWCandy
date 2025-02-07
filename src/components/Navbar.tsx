import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, ArrowRight, LogOut, ShirtIcon, Shirt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShoppingCart } from '../context/ShoppingCartContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartQuantity } = useShoppingCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="backdrop-blur-xl bg-black/30 border-b border-white/10 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent"
            >
              ShopWCandy
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-8">
              <div className="flex items-center gap-8">
                <Link 
                  to="/products" 
                  className="text-indigo-100/80 hover:text-white transition-colors duration-300 font-light text-lg"
                >
                  Collections
                </Link>
                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-indigo-100/80 hover:text-white transition-colors duration-300 font-light text-lg"
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              <div className="h-8 w-px bg-white/20 mx-4" />

              <div className="flex items-center gap-6">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
                    >
                      <User className="h-6 w-6 text-indigo-100/80" />
                    </Link>
                    <button
                      onClick={logout}
                      className="text-indigo-100/80 hover:text-white transition-colors duration-300 font-light text-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-indigo-100/80 hover:text-white transition-colors duration-300 font-light text-lg"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <Link
                  to="/checkout"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300 relative"
                >
                  <ShoppingCart className="h-6 w-6 text-indigo-100/80" />
                  {cartQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs shadow-md">
                      {cartQuantity}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
              >
                <Menu className="h-6 w-6 text-indigo-100/80" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-black/90 text-white p-4">
          <nav className=' mt-20'>
            <Link 
              to="/products" 
              className="block mb-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shirt className="h-6 w-6 text-indigo-100/80 inline-block" /> Collections
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="block mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-6 w-6 text-indigo-100/80 inline-block" /> Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block mb-2"
                >
                  <LogOut className="h-6 w-6 text-indigo-100/80 inline-block" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
            <Link
              to="/checkout"
              className="block"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="h-6 w-6 text-indigo-100/80 inline-block"  /> Checkout
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
