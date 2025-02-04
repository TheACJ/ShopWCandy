export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image_url: string;
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
  }