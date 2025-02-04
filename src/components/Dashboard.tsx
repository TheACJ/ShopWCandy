import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Eye, ShoppingBag, ChevronRight, Package2, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'shipped' | 'delivered';
  total: number;
  items: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

interface SectionState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

export default function Dashboard() {
  const { user, supabase } = useAuth();
  const [orders, setOrders] = useState<SectionState<Order>>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [recentlyViewed, setRecentlyViewed] = useState<SectionState<Product>>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [latestProducts, setLatestProducts] = useState<SectionState<Product>>({
    data: [],
    isLoading: true,
    error: null,
  });

  // ... keep existing data fetching logic ...

  // Loading skeleton for orders
  const OrderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 backdrop-blur-lg bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-lg bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-4 w-20 bg-white/10 ml-auto" />
            <Skeleton className="h-6 w-24 bg-white/10 rounded-full ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for products
  const ProductSkeleton = () => (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-3 backdrop-blur-lg bg-white/5 rounded-xl border border-white/10">
          <Skeleton className="w-16 h-16 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-white/10" />
            <Skeleton className="h-3 w-1/2 bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );

  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const statusConfig = {
      pending: { color: 'bg-gradient-to-r from-amber-600 to-amber-400', icon: <Clock className="w-4 h-4" /> },
      shipped: { color: 'bg-gradient-to-r from-blue-600 to-cyan-400', icon: <Package className="w-4 h-4" /> },
      delivered: { color: 'bg-gradient-to-r from-emerald-600 to-green-400', icon: <CheckCircle className="w-4 h-4" /> }
    };

    return (
      <div className={`${statusConfig[status].color} text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm`}>
        {statusConfig[status].icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                Welcome, {user?.email}
              </h1>
              <p className="text-indigo-200/80 mt-2 text-lg">
                Your personalized fashion dashboard
              </p>
            </div>
            <div className="mt-4 md:mt-0 grid grid-cols-2 gap-4">
              <Link 
                to="/orders" 
                className="backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 transition-all duration-300"
              >
                <div className="text-indigo-400/80 text-sm">Total Orders</div>
                <div className="text-2xl font-bold text-white">{orders.data.length}</div>
              </Link>
              <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-xl p-4">
                <div className="text-indigo-400/80 text-sm">Wishlisted Items</div>
                <div className="text-2xl font-bold text-white">12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
              Recent Orders
            </h2>
            <Link 
              to="/orders" 
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-300"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          {orders.error ? (
            <Alert className="backdrop-blur-lg bg-red-500/10 border border-red-400/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">{orders.error}</AlertDescription>
            </Alert>
          ) : orders.isLoading ? (
            <OrderSkeleton />
          ) : orders.data.length === 0 ? (
            <div className="text-center py-8 backdrop-blur-lg bg-white/5 rounded-xl">
              <p className="text-indigo-200/60">No recent orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.data.map((order) => (
                <div 
                  key={order.id} 
                  className="group backdrop-blur-lg bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-600/30 to-indigo-400/30 rounded-lg">
                        <Package2 className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                        <p className="text-indigo-200/60 text-sm mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xl font-bold text-white">
                        ₦{order.total.toLocaleString()}
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recently Viewed */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                Recently Viewed
              </h2>
              <Eye className="w-6 h-6 text-indigo-400/80" />
            </div>
            
            {recentlyViewed.error ? (
              <Alert className="backdrop-blur-lg bg-red-500/10 border border-red-400/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{recentlyViewed.error}</AlertDescription>
              </Alert>
            ) : recentlyViewed.isLoading ? (
              <ProductSkeleton />
            ) : recentlyViewed.data.length === 0 ? (
              <div className="text-center py-8 backdrop-blur-lg bg-white/5 rounded-xl">
                <p className="text-indigo-200/60">No recently viewed items</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {recentlyViewed.data.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group backdrop-blur-lg bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative overflow-hidden rounded-lg w-16 h-16">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{product.name}</h3>
                        <p className="text-indigo-200/60 text-sm mt-1">
                          {product.category} • ₦{product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Latest Products */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                New Arrivals
              </h2>
              <ShoppingBag className="w-6 h-6 text-indigo-400/80" />
            </div>
            
            {latestProducts.error ? (
              <Alert className="backdrop-blur-lg bg-red-500/10 border border-red-400/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{latestProducts.error}</AlertDescription>
              </Alert>
            ) : latestProducts.isLoading ? (
              <ProductSkeleton />
            ) : latestProducts.data.length === 0 ? (
              <div className="text-center py-8 backdrop-blur-lg bg-white/5 rounded-xl">
                <p className="text-indigo-200/60">No new products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {latestProducts.data.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group backdrop-blur-lg bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative overflow-hidden rounded-lg w-16 h-16">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{product.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-indigo-400/80 text-sm">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <span className="text-white/30">•</span>
                          <span className="text-emerald-400/80 text-sm">
                            Just Added
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}