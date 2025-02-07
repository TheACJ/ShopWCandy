// src/pages/OrderConfirmation.tsx
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';


export default function OrderConfirmation() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const reference = params.get('reference');

  useEffect(() => {
    if (reference) {
      // Client-side verification (optional)
      supabase
        .from('orders')
        .select('*')
        .eq('payment_reference', reference)
        .single()
        .then(({ data }) => {
          if (data?.paid) {
            // Handle successful payment
          }
        });
    }
  }, [reference]);

  return (
    <div>
      {/* Your confirmation UI */}
    </div>
  );
}