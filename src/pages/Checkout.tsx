//src/pages/Checkout.tsx
import { useState, useEffect } from 'react';
import { useShoppingCart } from '../context/ShoppingCartContext';
import { CheckCircle, CreditCard, Loader, Truck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';




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

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp.slice(-8)}${random}`;
  };

  

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

  const createOrder = async () => {
    try {
      // Get current user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to complete your purchase');
      }
  
      const orderNumber = generateOrderNumber();
  
      // Ensure there are items in the cart
      if (!cartItems.length) {
        throw new Error('Your cart is empty');
      }
  
      // Prepare the order items payload by validating product availability and prices
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = getProductById(item.id);
          if (!product) {
            throw new Error(`Product not found: ${item.id}`);
          }
          console.log('Product:', product.price);
          console.log('Item:', item.quantity);
          console.log('Total:', product.price * item.quantity);
          return {
            product_id: item.id,
            quantity: item.quantity,
            lineitem_total: product.price * item.quantity, // Calculate line total
          };
        })
      );
  
      // Create the order without embedding order items directly
      const orderData = {
        user_id: user.id, // This is a valid UUID string from Supabase Auth
        order_number: orderNumber,
        status: 'pending',
        total: total, // Ensure this is calculated correctly elsewhere
        shipping_fee: shipping,
        discount: 0,
        payment_method: null,
        paid: false,
      };
  
      // Insert the order into the orders table and return the inserted order row
      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
  
      if (error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }
      if (!order) {
        throw new Error('Order creation failed');
      }
  
      // Build payload for order_items by adding the order_id to each item
      const orderItemsPayload = orderItems.map((item) => ({
        order_id: order.id, // Use the id from the newly created order
        product_id: item.product_id,
        quantity: item.quantity,
        lineitem_total: item.lineitem_total,
      }));
  
      // Insert all order items into the order_items table
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);
  
      if (orderItemsError) {
        throw new Error(`Failed to create order items: ${orderItemsError.message}`);
      }
  
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error; // Propagate the error to be handled by the calling function
    }
  };
  

  const handlePaystackPayment = async () => {
    if (!validateShippingInfo()) {
      alert('Please fill in all required shipping information.');
      return;
    }
  
    try {
      // First update user info
      await updateUserInfo();
      
      // Create the order first
      const order = await createOrder();
      
      if (!order) {
        throw new Error('Failed to create order');
      }
  
      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: shippingInfo.email,
        amount: total * 100, // Convert to kobo (smallest currency unit)
        currency: 'NGN',
        metadata: {
          order_id: order.id,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.order_number
            }
          ]
        },
        callback: function(response: any) {
          if (response.status === 'success') {
            alert('Payment successful! Reference: ' + response.reference);
            clearCart();
            // Optionally redirect to a success page
            // window.location.href = '/order-success';
          } else {
            alert('Payment failed. Please try again.');
          }
        },
        onClose: function() {
          // Handle what happens when the payment modal is closed
          const userResponse = confirm('Are you sure you want to cancel the payment?');
          if (userResponse) {
            // Optionally handle cancelled payment
            // You might want to mark the order as cancelled in your database
          } else {
            // Reopen the payment modal
            handler.openIframe();
          }
        },
      });
  
      handler.openIframe();
    } catch (error) {
      // Properly handle and display the error
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Payment processing failed: ${errorMessage}`);
    }
  };

  const handleFlutterwavePayment = async () => {
    if (!validateShippingInfo()) {
      alert('Please fill in all required shipping information.');
      return;
    }

    try {
      await updateUserInfo();
      const order = await createOrder();
      
      (window as any).FlutterwaveCheckout({
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: order.order_number,
        amount: total,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: shippingInfo.email,
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        },
        meta: {
          order_id: order.id
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