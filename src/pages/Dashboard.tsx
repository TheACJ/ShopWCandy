import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { 
  BarChart, 
  Users, 
  Package, 
  DollarSign,
  ShoppingBag,
  List,
  Settings,
  LogOut,
  Save,
  UserCircle,
  Search,
  Filter,
  CreditCard,
  Box,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  ChevronRight
} from 'lucide-react';
import Analytics from '@/components/Analytics';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface Order {
  id: number;
  created_at: string;
  user_id: string;
  status: string;
  total: number;
  customer_name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

// Products Table Component
const ProductsTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      if (currentCategory !== 'all') {
        query = query.eq('category', currentCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, currentCategory]);

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
          Product Inventory
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2.5 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-indigo-100/80 placeholder-indigo-100/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-5 w-5 text-indigo-100/50 absolute left-3 top-3" />
          </div>
          <select
            className="px-4 py-2.5 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-indigo-100/80 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="backdrop-blur-lg bg-white/5 p-4 rounded-xl border border-white/10 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:backdrop-blur-lg hover:bg-white/5 transition-colors duration-300">
                  <td className="px-4 py-3 text-indigo-100/80">{product.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-indigo-100/80">₦{product.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" 
                          style={{ width: `${Math.min((product.stock/100)*100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-indigo-100/60 text-sm">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// Orders Table Component
const OrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase.from('orders').select(`
        *,
        user_info:user_id (
          first_name,
          last_name
        )
      `);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      completed: { color: 'bg-gradient-to-r from-emerald-600 to-green-400', icon: <CheckCircle className="w-4 h-4" /> },
      pending: { color: 'bg-gradient-to-r from-amber-600 to-amber-400', icon: <Clock className="w-4 h-4" /> },
      cancelled: { color: 'bg-gradient-to-r from-rose-600 to-pink-400', icon: <AlertCircle className="w-4 h-4" /> }
    };

    return (
      <div className={`${statusConfig[status.toLowerCase() as keyof typeof statusConfig]?.color || 'bg-gray-500'} 
        px-3 py-1 rounded-full flex items-center gap-2 text-xs font-medium text-white`}
      >
        {statusConfig[status.toLowerCase() as keyof typeof statusConfig]?.icon}
        {status}
      </div>
    );
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
          Order Management
        </h3>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="px-4 py-2.5 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl text-indigo-100/80 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="p-2.5 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300">
            <Filter className="h-5 w-5 text-indigo-100/80" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="backdrop-blur-lg bg-white/5 p-4 rounded-xl border border-white/10 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-indigo-100/80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:backdrop-blur-lg hover:bg-white/5 transition-colors duration-300">
                  <td className="px-4 py-3 text-indigo-100/80">#{order.id}</td>
                  <td className="px-4 py-3 text-indigo-100/80">{order.customer_name}</td>
                  <td className="px-4 py-3 text-indigo-100/80">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 text-indigo-100/80">₦{order.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// Dashboard Stats Component
const DashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [ordersData, productsData, customersData] = await Promise.all([
        supabase.from('orders').select('total'),
        supabase.from('products').select('count', { count: 'exact' }),
        supabase.from('user_info').select('count', { count: 'exact' })
      ]);

      const totalRevenue = ordersData.data?.reduce((sum, order) => sum + order.total, 0) || 0;
      
      setStats({
        totalRevenue,
        totalOrders: ordersData.data?.length || 0,
        totalProducts: productsData.count || 0,
        totalCustomers: customersData.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-16"></div>
        </div>
      ))}
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { 
          title: 'Total Revenue',
          value: stats.totalRevenue,
          icon: CreditCard,
          color: 'from-indigo-600 to-cyan-500'
        },
        { 
          title: 'Total Orders',
          value: stats.totalOrders,
          icon: Box,
          color: 'from-emerald-600 to-green-400'
        },
        { 
          title: 'Customers',
          value: stats.totalCustomers,
          icon: Users,
          color: 'from-amber-600 to-amber-400'
        },
        { 
          title: 'Products',
          value: stats.totalProducts,
          icon: Globe,
          color: 'from-violet-600 to-fuchsia-400'
        }
      ].map((stat, index) => (
        <div key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100/60 mb-2">{stat.title}</p>
              <p className="text-2xl font-bold text-white">
                {stat.value.toLocaleString()}
                {stat.title === 'Total Revenue' && <span className="text-indigo-100/60 text-lg ml-1">NGN</span>}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" 
                style={{ width: `${Math.min((index+1)*25, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


// Main Dashboard Component
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart }, // New analytics menu item
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 mt-20">
      {/* Sidebar */}
      <div className="w-72 backdrop-blur-xl bg-black/30 border-r border-white/10">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 border-b border-white/10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
              ShopWCandy Admin
            </h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 text-white shadow-lg'
                          : 'text-indigo-100/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                      <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center mb-4 p-3 backdrop-blur-lg bg-white/5 rounded-xl">
              <UserCircle className="h-8 w-8 text-indigo-400/80" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-indigo-100/60">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors duration-300"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="backdrop-blur-xl bg-black/30 border-b border-white/10">
          <div className="px-8 py-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h2>
          </div>
        </header>

        <main className="p-8">
          {activeTab === 'dashboard' && (
            <>
              <DashboardStats />
              <div className="grid grid-cols-1 gap-8">
                <OrdersTable />
                <ProductsTable />
              </div>
            </>
          )}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'products' && <ProductsTable />}
          {activeTab === 'orders' && <OrdersTable />}
          {activeTab === 'customers' && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-6">
                Customer Management
              </h3>
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-indigo-400/30 mx-auto mb-4" />
                <p className="text-indigo-100/60">Customer analytics coming soon</p>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-6">
                System Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['General Settings', 'Payment Gateways', 'Notifications', 'Security'].map((setting) => (
                  <div key={setting} className="backdrop-blur-lg bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                    <h4 className="text-indigo-100/80 mb-2">{setting}</h4>
                    <p className="text-indigo-100/60 text-sm">Configure {setting.toLowerCase()} parameters</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
