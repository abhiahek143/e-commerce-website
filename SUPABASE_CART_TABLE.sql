-- Run this in Supabase SQL Editor to fix carts table error
-- Your exact schema + RLS

CREATE TABLE IF NOT EXISTS public.carts (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  items jsonb NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, NOW()),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_unique UNIQUE (user_id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts USING btree (user_id) TABLESPACE pg_default;

-- RLS policies
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON public.carts 
  FOR ALL USING (auth.uid() = user_id);
