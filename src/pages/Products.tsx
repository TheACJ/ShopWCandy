import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Filter, Search } from 'lucide-react';
import { useShoppingCart } from '../context/ShoppingCartContext'; // Add this import


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const category = searchParams.get('category');
  const { addToCart } = useShoppingCart(); // Add to Cart
  

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = category
    ? products.filter(product => product.category === category)
    : products;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 py-8 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 text-indigo-100/80 placeholder-indigo-100/50"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-indigo-100/50" />
            </div>
            <button className="flex items-center px-4 py-2.5 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-300 text-indigo-100/80">
              <Filter className="h-5 w-5 mr-2 text-indigo-100/80" />
              Filter
            </button>
          </div>
    
          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 shadow-2xl animate-pulse">
                  <div className="relative pb-[100%] bg-white/10" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-8 bg-gradient-to-r from-indigo-600/30 to-cyan-500/30 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                  <div className="relative pb-[100%] overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-indigo-100/80 mb-2">{product.name}</h3>
                    <p className="text-indigo-100/60 mb-4">₦{product.price.toLocaleString()}</p>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-2.5 rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-600 transition-all duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
}
