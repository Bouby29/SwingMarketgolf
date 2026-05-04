-- Create shipments table for Sendcloud integration
create table if not exists public.shipments (
  id bigserial primary key,
  order_id uuid not null references orders(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  
  -- Sendcloud parcel reference
  sendcloud_parcel_id bigint unique,
  sendcloud_carrier_code text,
  
  -- Shipping details
  tracking_number text unique,
  tracking_url text,
  weight_kg numeric(10, 2) default 1.0,
  
  -- Status tracking (enum: pending, label_created, picked_up, in_transit, delivered, failed)
  status text default 'pending' check (status in ('pending', 'label_created', 'picked_up', 'in_transit', 'delivered', 'failed')),
  
  -- Shipping cost (optional, for future invoicing)
  shipping_cost numeric(10, 2),
  currency text default 'EUR',
  
  -- Shipment info
  label_url text,
  label_pdf_url text,
  shipping_address jsonb,
  
  -- Metadata
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  constraint order_shipment_unique unique(order_id)
);

-- Create indexes for performance
create index if not exists shipments_order_id_idx on public.shipments(order_id);
create index if not exists shipments_seller_id_idx on public.shipments(seller_id);
create index if not exists shipments_buyer_id_idx on public.shipments(buyer_id);
create index if not exists shipments_status_idx on public.shipments(status);
create index if not exists shipments_tracking_number_idx on public.shipments(tracking_number);
create index if not exists shipments_created_at_idx on public.shipments(created_at);

-- Enable RLS
alter table public.shipments enable row level security;

-- RLS Policy 1: Sellers can view their own shipments
create policy "sellers_view_own_shipments"
  on public.shipments
  for select
  using (seller_id = auth.uid());

-- RLS Policy 2: Buyers can view their own shipments
create policy "buyers_view_own_shipments"
  on public.shipments
  for select
  using (buyer_id = auth.uid());

-- RLS Policy 3: Only authenticated users can insert (via trigger from orders)
create policy "authenticated_insert_shipments"
  on public.shipments
  for insert
  with check (auth.role() = 'authenticated');

-- RLS Policy 4: Only sellers can update their own shipments
create policy "sellers_update_own_shipments"
  on public.shipments
  for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

-- Create trigger for updated_at
create trigger shipments_updated_at
  before update on public.shipments
  for each row
  execute function public.set_updated_at();

-- Add comment
comment on table public.shipments is 'Stores shipment records for orders, integrated with Sendcloud for tracking and label generation';
