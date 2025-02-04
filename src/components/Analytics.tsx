import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { Loader } from 'lucide-react';

const Analytics = () => {
  const [dailySales, setDailySales] = useState<{ date: string; total: number; }[]>([]);
  const [categorySales, setCategorySales] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const GLASS_STYLE = 'backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Daily Sales
      const { data: salesData } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('payment_status', 'paid');

      const dailySales = salesData?.reduce((acc, { created_at, total_amount }) => {
        const date = new Date(created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + total_amount;
        return acc;
      }, {});

      setDailySales(Object.entries(dailySales || {}).map(([date, total]) => ({
        date,
        total: Number(total)
      })));

      // Category Sales
      const { data: categoryData } = await supabase
        .from('order_items')
        .select('quantity, lineitem_total, products (category)');

      const categorySales = categoryData?.reduce((acc, { lineitem_total, products }) => {
        const category = products?.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + lineitem_total;
        return acc;
      }, {});

      setCategorySales(Object.entries(categorySales || {}).map(([category, total]) => ({
        category,
        total: Number(total)
      })));

      // Product Performance
      const { data: productData } = await supabase
        .from('order_items')
        .select('quantity, lineitem_total, products (name)')
        .order('lineitem_total', { ascending: false })
        .limit(5);

      const productPerformance = productData?.map(({ quantity, lineitem_total, products }) => ({
        name: products?.name || 'Unknown',
        revenue: Number(lineitem_total),
        quantity: quantity
      }));

      setProductPerformance(productPerformance || []);

      // Order Status
      const { data: statusData } = await supabase
        .from('orders')
        .select('status, count(*)')
        .group('status');

      setOrderStatus(statusData?.map(({ status, count }) => ({
        status,
        count: Number(count)
      })) || []);

    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="backdrop-blur-xl bg-black/30 p-4 rounded-lg border border-white/10 shadow-lg">
        <p className="text-indigo-100/80 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-indigo-100/60" style={{ color: entry.color }}>
            {entry.name}: ₦{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-indigo-100/60">
          <Loader className="h-8 w-8 animate-spin" />
          <p>Crunching analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Daily Sales Chart */}
      <div className={GLASS_STYLE}>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-6">
          Daily Sales Trend
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#a5b4fc" 
                tick={{ fill: '#c7d2fe' }} 
              />
              <YAxis 
                stroke="#a5b4fc" 
                tick={{ fill: '#c7d2fe' }}
                tickFormatter={(value) => `₦${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-indigo-100/80">{value}</span>
                )}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#818cf8" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2 }}
                name="Daily Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Sales Chart */}
      <div className={GLASS_STYLE}>
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-6">
          Category Performance
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categorySales}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <XAxis 
                dataKey="category" 
                stroke="#a5b4fc" 
                tick={{ fill: '#c7d2fe' }} 
              />
              <YAxis 
                stroke="#a5b4fc" 
                tick={{ fill: '#c7d2fe' }}
                tickFormatter={(value) => `₦${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-indigo-100/80">{value}</span>
                )}
              />
              <Bar 
                dataKey="total" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]}
                name="Category Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className={GLASS_STYLE}>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-6">
            Top Performing Products
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis 
                  type="number" 
                  stroke="#a5b4fc" 
                  tick={{ fill: '#c7d2fe' }}
                  tickFormatter={(value) => `₦${value.toLocaleString()}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#a5b4fc" 
                  tick={{ fill: '#c7d2fe' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span className="text-indigo-100/80">{value}</span>
                  )}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]}
                  name="Product Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className={GLASS_STYLE}>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-6">
            Order Status Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, percent }) => 
                    `${status}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {orderStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="#1e1b4b"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span className="text-indigo-100/80">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;