//src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { CheckCircle, CreditCard, Loader, Truck } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface UserInfo {
  user_id: string;
  role: string;
  first_name: string;
  last_name: string;
  address: string;
  lga: string;
  state: string;
  zipCode: string;
}

export default function Checkout() {
  const { cartItems, cartQuantity, clearCart } = useShoppingCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [shippingInfo, setShippingInfo] = useState<ShippingForm>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    fetchUserInfo();
    fetchProducts();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoadingUserInfo(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoadingUserInfo(false);
        return;
      }

      // Fetch user info from public.user_info
      const { data: userInfo, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user info:', error);
        return;
      }

      // If user info exists (at least one row returned)
      if (userInfo && userInfo.length > 0) {
        const info = userInfo[0]; // Get the first row
        setShippingInfo({
          firstName: info.first_name || '',
          lastName: info.last_name || '',
          email: user.email || '',
          address: info.address || '',
          city: info.lga || '',
          state: info.state || '',
          zipCode: ''
        });
      } else {
        // If no user info exists yet, just set the email from auth
        setShippingInfo(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    } catch (error) {
      console.error('Error in fetchUserInfo:', error);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  const updateUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Check if user info exists
      const { data: existingUserInfo } = await supabase
        .from('user_info')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      const userInfoData = {
        first_name: shippingInfo.firstName,
        last_name: shippingInfo.lastName,
        address: shippingInfo.address,
        lga: shippingInfo.city,
        state: shippingInfo.state
      };

      if (existingUserInfo) {
        // Update existing user info
        const { error } = await supabase
          .from('user_info')
          .update(userInfoData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new user info
        const { error } = await supabase
          .from('user_info')
          .insert([{ ...userInfoData, user_id: user.id }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      throw error;
    }
  };

  async function fetchProducts() {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoadingProducts(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserInfo();
      // Continue with payment processing...
    } catch (error) {
      console.error('Error in form submission:', error);
      alert('Error updating user information');
    }
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const subtotal = cartItems.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  const shipping = 2500;
  const tax = subtotal * 0.075;
  const total = subtotal + shipping + tax;

  const validateShippingInfo = () => {
    return (
      shippingInfo.firstName &&
      shippingInfo.lastName &&
      shippingInfo.email &&
      shippingInfo.address &&
      shippingInfo.city &&
      shippingInfo.state &&
      shippingInfo.zipCode
    );
  };

  const handlePaystackPayment = async () => {
    if (!validateShippingInfo()) {
      alert('Please fill in all required shipping information.');
      return;
    }

    try {
      await updateUserInfo();
      
      const handler = (window as any).PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: shippingInfo.email,
        amount: total * 100,
        currency: 'NGN',
        callback: function(response: any) {
          alert('Payment successful! Reference: ' + response.reference);
          clearCart();
        },
        onClose: function() {
          alert('Payment window closed.');
        },
      });
      handler.openIframe();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const handleFlutterwavePayment = async () => {
    if (!validateShippingInfo()) {
      alert('Please fill in all required shipping information.');
      return;
    }

    try {
      await updateUserInfo();
      
      (window as any).FlutterwaveCheckout({
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now().toString(),
        amount: total,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: shippingInfo.email,
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        },
        callback: function(response: any) {
          alert('Payment successful! Transaction ID: ' + response.transaction_id);
          clearCart();
        },
        onclose: function() {
          alert('Payment window closed.');
        },
        customizations: {
          title: 'Your Store Name',
          description: 'Payment for items in cart',
        },
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 py-12 mt-9">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent mb-8">
            Secure Checkout
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="space-y-6">
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center mb-6">
                  <Truck className="h-8 w-8 text-indigo-400 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                    Shipping Details
                  </h2>
                </div>
                {loadingUserInfo ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader className="h-8 w-8 text-indigo-400 animate-spin" />
                    <p className="text-indigo-100/60">Loading your information...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-100/80 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-400/30 focus:outline-none text-indigo-100/80 placeholder-indigo-100/50"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Payment Methods */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-8 w-8 text-indigo-400 mr-3" />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                    Payment Options
                  </h2>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={handlePaystackPayment}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-4 rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Continue with Paystack
                  </button>
                  <button
                    onClick={handleFlutterwavePayment}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-400 text-white py-4 rounded-xl font-medium hover:from-emerald-700 hover:to-green-500 transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Continue with Flutterwave
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent mb-6">
                Order Summary
              </h2>
              <div className="space-y-6">
                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader className="h-8 w-8 text-indigo-400 animate-spin" />
                    <p className="text-indigo-100/60">Loading your cart...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const product = getProductById(item.id);
                        return product ? (
                          <div key={item.id} className="flex items-center justify-between backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              </div>
                              <div>
                                <h3 className="font-medium text-indigo-100/80">{product.name}</h3>
                                <p className="text-sm text-indigo-100/60">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-medium text-indigo-100/80">
                              ₦{(product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-indigo-100/80">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-indigo-100/80">
                        <span>Shipping</span>
                        <span>₦{shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-indigo-100/80">
                        <span>Tax (7.5%)</span>
                        <span>₦{tax.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between font-semibold text-indigo-100/80">
                          <span>Total</span>
                          <span className="text-lg">₦{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}