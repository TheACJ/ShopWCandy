import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomeDashboard from './components/Dashboard';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/ProfilePage'
import { ShoppingCartProvider } from './context/ShoppingCartContext';
import { AuthProvider} from './context/AuthContext';
import { RequireAdmin } from './components/RequireAdmin';


function App() {
  return (
    <AuthProvider>
      <ShoppingCartProvider>
        <Router>
          <div className="flex flex-col min-h-screen  bg-gradient-to-br  from-indigo-900 via-slate-900/50 to-indigo-900">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                 {/* Protected admin route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            } 
          />
          {/* Add more admin routes as needed */}
                <Route path='/dashboard' element={<HomeDashboard />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" />
        </Router>
      </ShoppingCartProvider>
    </AuthProvider>
  );
}

export default App;