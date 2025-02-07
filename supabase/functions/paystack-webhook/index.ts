// supabase/functions/paystack-webhook/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;

async function hexToBuffer(hex: string): Promise<Uint8Array> {
  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
}

async function verifySignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["verify"],
  );

  return await crypto.subtle.verify(
    "HMAC",
    key,
    await hexToBuffer(signature),
    new TextEncoder().encode(body),
  );
}

serve(async (req) => {
  try {
    // Verify signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) return new Response("Unauthorized", { status: 401 });

    const rawBody = await req.text();
    const valid = await verifySignature(rawBody, signature, PAYSTACK_SECRET_KEY);
    if (!valid) return new Response("Invalid signature", { status: 403 });

    // Process webhook
    const body = JSON.parse(rawBody);
    if (body.event === "charge.success") {
      const txData = body.data;
      
      // Verify transaction with Paystack API
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${txData.reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      
      const verification = await verifyRes.json();
      if (!verification.data?.status === "success") {
        throw new Error("Transaction verification failed");
      }

      // Update order in Supabase
      const { error } = await supabase
        .from("orders")
        .update({
          paid: true,
          payment_reference: txData.reference,
        })
        .eq("id", verification.data.metadata.order_id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});