import { X } from 'lucide-react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  cartItems: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

export const Cart = ({ cartItems, onRemoveItem, onUpdateQuantity }: CartProps) => {
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-fit sticky top-8">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
      
      {cartItems.length === 0 ? (
        <p className="text-gray-500 text-center">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.product.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product.name}</h3>
                    <p className="text-gray-600">
                      ₦{item.product.price.toLocaleString()} × {item.quantity}
                    </p>
                    <p className="font-medium">
                      ₦{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="hover:bg-gray-200 rounded-lg px-2 py-1"
                      >
                        -
                      </button>
                      <span className="min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="hover:bg-gray-200 rounded-lg px-2 py-1"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};