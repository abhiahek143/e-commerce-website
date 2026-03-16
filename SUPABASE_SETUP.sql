-- Supabase Database Schema for Premium E-Commerce (Auth + Products)
-- Run this in your Supabase SQL Editor (Authentication → Settings → Auth → Enable Email)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table for customer details (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for all
  using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger function
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  original_price decimal(10,2),
  category text,
  images text[],
  stock integer default 0,
  rating real default 4.5,
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Coupons table
create table coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  discount numeric(5,2) not null, -- 10.00 for 10%
  expiry_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User carts (profile-based)
create table carts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  items jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table products enable row level security;
alter table coupons enable row level security;
alter table carts enable row level security;

-- RLS Policies
create policy "Products public read" on products for select using (true);
create policy "Coupons public read" on coupons for select using (true);

-- Carts: users can read/write own cart
create policy "Users can view own cart" on carts for all 
  using (auth.uid() = user_id);

-- Indexes
create index idx_products_category on products(category);
create index idx_carts_user_id on carts(user_id);

-- Insert ALL 20 sample products to Supabase
insert into products 
(name, description, price, original_price, category, images, stock, rating, review_count)
values

(
'Wireless Headphones Pro',
'Premium wireless headphones with active noise cancellation and 40+ hours battery.',
299,399,'electronics',
array[
'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd',
'https://images.unsplash.com/photo-1585386959984-a41552231658'
],
50,4.7,2345
),

(
'iPhone 15 Pro Max',
'Flagship smartphone with titanium design and A17 chip.',
1199,1299,'electronics',
array[
'https://images.unsplash.com/photo-1690483055414-085f190a9c89',
'https://images.unsplash.com/photo-1512499617640-c2f999098c01',
'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
],
30,4.8,5678
),

(
'MacBook Pro M3',
'Powerful laptop for developers and creators.',
1999,2199,'electronics',
array[
'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
],
25,4.9,3456
),

(
'Smart Watch Ultra',
'Advanced smartwatch with health tracking and GPS.',
499,599,'electronics',
array[
'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1',
'https://images.unsplash.com/photo-1510017803434-a899398421b3'
],
75,4.6,1890
),

(
'Cotton T-Shirt',
'Premium cotton everyday t-shirt.',
29,49,'clothing',
array[
'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
'https://images.unsplash.com/photo-1503341504253-dff4815485f1',
'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f'
],
120,4.5,4567
),

(
'Leather Jacket',
'Classic genuine leather jacket.',
199,299,'clothing',
array[
'https://images.unsplash.com/photo-1551028719-00167b16eac5',
'https://images.unsplash.com/photo-1520975922284-3e8e8b5c4f2d',
'https://images.unsplash.com/photo-1520975661595-6453be3f7070'
],
40,4.8,1234
),

(
'Denim Jeans',
'Slim fit stretch denim jeans.',
89,129,'clothing',
array[
'https://images.unsplash.com/photo-1542272604-787c3835535d',
'https://images.unsplash.com/photo-1473966968600-fa801b869a1a',
'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'
],
90,4.4,2789
),

(
'Sneakers Pro',
'Lightweight sneakers with responsive cushioning.',
149,189,'clothing',
array[
'https://images.unsplash.com/photo-1549298916-b41d501d3772',
'https://images.unsplash.com/photo-1519741497674-611481863552',
'https://images.unsplash.com/photo-1528701800489-20be3c9a12ff'
],
65,4.7,3345
),

(
'Coffee Table Book',
'Beautiful photography coffee table book.',
45,65,'books',
array[
'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
'https://images.unsplash.com/photo-1512820790803-83ca3b5e',
'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'
],
35,4.6,890
),

(
'Programming Guide',
'Modern programming guide for developers.',
39,59,'books',
array[
'https://images.unsplash.com/photo-1481627834876-b7833e8f5570',
'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
],
80,4.8,1567
),

(
'Design Patterns',
'Complete design patterns reference book.',
59,79,'books',
array[
'https://images.unsplash.com/photo-1544716278-ca5e3f4abd40',
'https://images.unsplash.com/photo-1512820790803-83ca3b5e',
'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'
],
45,4.9,2234
),

(
'Laptop Stand',
'Aluminum ergonomic laptop stand.',
79,99,'electronics',
array[
'https://images.unsplash.com/photo-1587829741303-dc126ee40283',
'https://images.unsplash.com/photo-1587614382346-4ecf1c16c7a1',
'https://images.unsplash.com/photo-1517336714731-489689fd1ca8'
],
60,4.5,1678
),

(
'Summer Dress',
'Lightweight summer chiffon dress.',
69,89,'clothing',
array[
'https://images.unsplash.com/photo-1571115627081-fb883f39cf26',
'https://images.unsplash.com/photo-1520975922284-3e8e8b5c4f2d',
'https://images.unsplash.com/photo-1483985988355-763728e1935b'
],
55,4.7,2987
),

(
'Novel Bestseller',
'Thrilling bestselling novel.',
25,35,'books',
array[
'https://images.unsplash.com/photo-1512820790803-83ca3b5e',
'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f'
],
110,4.6,4567
),

(
'Modern Velvet Sofa',
'Luxury velvet sofa.',
1299,1599,'furniture',
array[
'https://images.unsplash.com/photo-1600210492493-0946911123f7',
'https://images.unsplash.com/photo-1493666438817-866a91353ca9',
'https://images.unsplash.com/photo-1505691938895-1758d7feb511'
],
15,4.8,789
),

(
'Yoga Mat Pro',
'High grip eco-friendly yoga mat.',
89,119,'sports',
array[
'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
'https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0',
'https://images.unsplash.com/photo-1554284126-aa88f22d8b74'
],
85,4.7,2345
),

(
'Hydration Pack',
'3L trail running hydration pack.',
129,169,'sports',
array[
'https://images.unsplash.com/photo-1553062398-0e9b58478f0f',
'https://images.unsplash.com/photo-1526403223892-5c0f0d3df1a0',
'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
],
70,4.5,1456
),

(
'Luminous Serum',
'Vitamin C brightening serum.',
95,125,'beauty',
array[
'https://images.unsplash.com/photo-1625772299842-081b951891ed',
'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6',
'https://images.unsplash.com/photo-1582094914270-7b5fc2b58511'
],
95,4.8,3890
),

(
'Sculpting Moisturizer',
'Peptide firming moisturizer.',
78,98,'beauty',
array[
'https://images.unsplash.com/photo-1582094914270-7b5fc2b58511',
'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd'
],
62,4.6,2678
),

(
'Ceramic Dinner Set',
'Handcrafted ceramic dinnerware set.',
199,249,'furniture',
array[
'https://images.unsplash.com/photo-1559655682-6158c4a5d4f6',
'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
'https://images.unsplash.com/photo-1492724441997-5dc865305da7'
],
28,4.9,1123
);

insert into coupons (code, discount, expiry_date) values
('WELCOME10', 0.10, '2025-12-31'),
('SAVE20', 0.20, '2024-12-31'),
('FREESHIP', 0.05, '2024-12-31');


