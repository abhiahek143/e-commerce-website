require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const app = express()
const PORT = process.env.PORT || 5001

// Env validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.error('❌ Missing required env vars:', missingVars.join(', '))
  console.error('💡 Copy backend/.env.example to .env and fill your Supabase credentials')
  process.exit(1)
}

console.log('✅ Env vars validated')

// Supabase
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: true, // Allow all for dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(morgan('dev'))

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: false })
    
    if (error) throw error
    
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      productsCount: count || 0,
      supabase: 'connected'
    })
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message })
  }
})

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API running!' })
})

// Products routes
const { sampleProducts } = require('../frontend/src/pages/sampleProducts')

app.get('/api/products', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


app.get('/api/products/:id', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    if (!data) return res.status(404).json({ error: 'Product not found' })
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Cart routes (service role upsert bypasses RLS)
app.post('/api/cart', async (req, res) => {
  const { user_id, items } = req.body
  
  try {
    const { data, error } = await supabase
      .from('carts')
      .upsert({ 
        user_id, 
        items, 
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id'
      })
      .select()
      .single()
    
    if (error) throw error
    
    res.json({ success: true, cart: data })
  } catch (error) {
    console.error('Cart API error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Orders tables RLS (add to SUPABASE_SETUP.sql if not run)
app.post('/api/_admin/setup-orders', async (req, res) => {
  try {
    // Orders table
    await supabase.rpc('execute_sql', { sql: `
      create table if not exists orders (
        id uuid default uuid_generate_v4() primary key,
        user_id uuid references auth.users(id) on delete cascade not null,
        status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
        subtotal decimal(10,2) not null,
        tax decimal(10,2) default 0,
        delivery_fee decimal(10,2) default 50,
        total decimal(10,2) not null,
        address jsonb not null,
        payment_method text not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
      alter table orders enable row level security;
      create policy "Users can view own orders" on orders for all using (auth.uid() = user_id);
      create policy "Service can manage orders" on orders for all using (true) with check (true);
      
      -- Order items
      create table if not exists order_items (
        id uuid default uuid_generate_v4() primary key,
        order_id uuid references orders(id) on delete cascade not null,
        product_id uuid references products(id) not null,
        quantity integer not null,
        price_at_purchase decimal(10,2) not null,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
      alter table order_items enable row level security;
      create policy "Users can view own order items" on order_items 
        for all using (exists (select 1 from orders where id = order_id and auth.uid() = user_id));
      create policy "Service can manage order items" on order_items for all using (true) with check (true);
      
      create index idx_orders_user on orders(user_id);
      create index idx_orders_status on orders(status);
      create index idx_order_items_order on order_items(order_id);
    ` });
    
    res.json({ success: true, message: 'Orders tables ready' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order API
app.post('/api/orders', async (req, res) => {
  const { user_id, subtotal, tax, delivery_fee, total, address, payment_method, items } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }
  
  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  
  try {
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        user_id,
        subtotal,
        tax: tax || subtotal * 0.1,
        delivery_fee: delivery_fee || 50,
        total,
        address,
        payment_method
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }));
    
    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Fetch complete order with items
    const { data: completeOrder } = await client
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, price, images)
        )
      `)
      .eq('id', order.id)
      .single();
    
    res.json({ success: true, order: completeOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Coupon validation endpoint
app.post('/api/coupons/validate', async (req, res) => {
  const { code } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, message: 'Code required' });
  }
  
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('code, discount, expiry_date')
.ilike('code', code.trim().toUpperCase())

      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      res.json({ 
        valid: true, 
        code: data.code, 
        discount: Number(data.discount),
        expires: data.expiry_date 
      });
    } else {
      res.json({ valid: false, message: 'Invalid or expired code' });
    }
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

// Get user orders
app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (id, name, price, images)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

