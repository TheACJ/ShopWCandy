import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Package, Settings, Clock, Edit, Save, X,
  ShoppingBag, MapPin, Phone, Mail, Shield, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import useNigeriaStates from '../hooks/useNigerianStates'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import toast from 'react-hot-toast';

  
  

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);



if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const ProfilePage = () => {
    const {
        states,
        availableLGAs,
        selectedState,
        selectedLGA,
        handleStateChange,
        handleLGAChange
      } = useNigeriaStates();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    address: '',
    lga: '',
    state: '',
    email: user?.email || '',
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
  }, [user]);

  useEffect(() => {
    // Update userInfo when state/LGA selections change
    if (selectedState || selectedLGA) {
      setUserInfo(prev => ({
        ...prev,
        state: selectedState,
        lga: selectedLGA
      }));
    }
  }, [selectedState, selectedLGA]);

  const fetchDefaultRoleId = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'user') // Assuming the role name is 'user'
      .single();
    
    if (error) {
      console.error('Error fetching default role:', error);
      toast.error(`Error fetching default role ${error}`);
      return null;
    }
    return data.id;
  };
  
  const fetchUserInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
  
      if (error) throw error;
  
      if (!data) {
        const defaultRoleId = await fetchDefaultRoleId();
        if (!defaultRoleId) throw new Error('Failed to get default role ID');
  
        const { data: newUserData, error: insertError } = await supabase
          .from('user_info')
          .insert([
            {
              user_id: user?.id,
              first_name: '',
              last_name: '',
              address: '',
              lga: '',
              state: '',
              role: defaultRoleId // ✅ Use the actual UUID
            }
          ])
          .select()
          .single();
  
        if (insertError) throw insertError;
  
/*         setUserInfo({
          ...userInfo,
          ...newUserData
        });
      } else {
        setUserInfo({
          ...userInfo,
          ...data
        });
      } */

       setUserInfo(newUserData); 
        // Initialize state/LGA selections if available
        if (newUserData.state) handleStateChange(newUserData.state);
        if (newUserData.lga) handleLGAChange(newUserData.lga);
      } else {
        setUserInfo(data);
        // Initialize state/LGA selections if available
        if (data.state) handleStateChange(data.state);
        if (data.lga) handleLGAChange(data.lga);
      }
    
    } catch (error) {
      console.error('Error fetching/creating user info:', error);
      toast.error(`Error fetching/creating user info: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(`Error fetching orders: ${error}`)
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('user_info')
        .update({
          first_name: userInfo.first_name,
          last_name: userInfo.last_name,
          address: userInfo.address,
          lga: selectedLGA,
          state: selectedState, 
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Error Updating Profile: ${error}`)
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen backdrop-blur-xl bg-black/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8  bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 mt-20">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px] backdrop-blur-xl bg-white/5 border border-white/10">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 data-[state=active]:text-white"
          >
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 data-[state=active]:text-white"
          >
            <Package className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                Personal Information
              </CardTitle>
              <CardDescription className="text-indigo-100/80">
                Manage your personal information and delivery details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  {isEditing ? (
                    <div className="space-x-2">
                      <Button
                        onClick={handleUpdateProfile}
                        className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="text-indigo-100/80 hover:bg-white/10"
                      >
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 text-indigo-100/80 hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['first_name', 'last_name'].map((field) => (
                    <div key={field}>
                      <label className="text-sm font-medium text-indigo-100/80 mb-2">
                        {field.split('_').join(' ').toUpperCase()}
                      </label>
                      <Input
                        disabled={!isEditing}
                        value={userInfo[field as keyof typeof userInfo]}
                        onChange={(e) =>
                          setUserInfo({ ...userInfo, [field]: e.target.value })
                        }
                        className="backdrop-blur-sm bg-white/5 border border-white/10 text-indigo-100/80"
                      />
                    </div>
                  ))}
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-indigo-100/80 mb-2">ADDRESS</label>
                    <Input
                      disabled={!isEditing}
                      value={userInfo.address}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, address: e.target.value })
                      }
                      className="backdrop-blur-sm bg-white/5 border border-white/10 text-indigo-100/80"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-indigo-100/80 mb-2">STATE</label>
                    <Select
                      disabled={!isEditing}
                      value={selectedState}
                      onValueChange={handleStateChange}
                    >
                      <SelectTrigger className="backdrop-blur-sm bg-white/5 border border-white/10 text-indigo-100/80">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-xl bg-slate-900/95 border border-white/10">
                        {states.map((state) => (
                          <SelectItem 
                            key={state} 
                            value={state}
                            className="hover:bg-white/10 focus:bg-white/10 text-indigo-100/80"
                          >
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-indigo-100/80 mb-2">LGA</label>
                    <Select
                      disabled={!isEditing || !selectedState}
                      value={selectedLGA}
                      onValueChange={handleLGAChange}
                    >
                      <SelectTrigger className="backdrop-blur-sm bg-white/5 border border-white/10 text-indigo-100/80">
                        <SelectValue placeholder="Select LGA" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-xl bg-slate-900/95 border border-white/10">
                        {availableLGAs.map((lga) => (
                          <SelectItem 
                            key={lga} 
                            value={lga}
                            className="hover:bg-white/10 focus:bg-white/10 text-indigo-100/80"
                          >
                            {lga}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                Order History
              </CardTitle>
              <CardDescription className="text-indigo-100/80">
                View and track your previous orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-indigo-400/30" />
                  <h3 className="mt-2 text-sm font-medium text-indigo-100/80">
                    No orders yet
                  </h3>
                  <Button
                    className="mt-4 bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 hover:bg-white/10 text-indigo-100/80"
                    onClick={() => navigate('/products')}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="backdrop-blur-sm bg-white/5 border border-white/10">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-indigo-100/80">
                              Order #{order.id}
                            </p>
                            <p className="text-sm text-indigo-100/60 mt-1">
                              <Clock className="inline-block h-4 w-4 mr-1" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-indigo-100/80">
                              ₦{order.total_amount}
                            </p>
                            <span className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${order.status === 'delivered' 
                                ? 'bg-gradient-to-r from-emerald-600/30 to-green-400/30 text-emerald-400' 
                                : order.status === 'processing' 
                                ? 'bg-gradient-to-r from-amber-600/30 to-amber-400/30 text-amber-400' 
                                : 'bg-gradient-to-r from-gray-600/30 to-gray-400/30 text-gray-400'}
                            `}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {order.order_items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-4 py-2 group"
                            >
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              </div>
                              <div>
                                <p className="font-medium text-indigo-100/80">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-indigo-100/60">
                                  Qty: {item.quantity} × ₦{item.product.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
                Account Settings
              </CardTitle>
              <CardDescription className="text-indigo-100/80">
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { icon: Mail, title: 'Email Address', desc: user?.email, action: 'Change Email' },
                  { icon: Shield, title: 'Password', desc: 'Last changed 3 months ago', action: 'Change Password' },
                  { icon: Bell, title: 'Notifications', desc: 'Manage notification preferences', action: 'Configure' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5 text-indigo-400/80" />
                      <div>
                        <p className="font-medium text-indigo-100/80">{item.title}</p>
                        <p className="text-sm text-indigo-100/60">{item.desc}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="text-indigo-100/80 hover:bg-white/10"
                    >
                      {item.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;