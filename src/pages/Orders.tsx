import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package2, Search, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'shipped' | 'delivered';
  total: number;
  items: number;
}

interface OrdersState {
  data: Order[];
  isLoading: boolean;
  error: string | null;
}

export default function Orders() {
  const { user, supabase } = useAuth();
  const [orders, setOrders] = useState<OrdersState>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        setOrders({
          data: data || [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setOrders(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load orders'
        }));
      }
    };

    fetchOrders();
  }, [user, supabase, statusFilter]);

  const filteredOrders = orders.data.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const OrderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-6 border rounded-lg bg-white">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600 mt-2">
            View and manage all your orders in one place
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search orders..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                // className="w-full"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.error ? (
            <Alert variant="destructive">
              <AlertDescription>{orders.error}</AlertDescription>
            </Alert>
          ) : orders.isLoading ? (
            <OrderSkeleton />
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Package2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'When you make a purchase, your orders will appear here'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-white rounded-lg shadow-sm border hover:border-gray-300 transition duration-150"
              >
                <div className="flex items-center space-x-4">
                  <Package2 className="w-12 h-12 text-indigo-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:text-right">
                  <p className="font-medium text-gray-900">₦{order.total.toLocaleString()}</p>
                  <span className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}