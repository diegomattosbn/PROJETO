-- Execute estes comandos no "SQL Editor" do seu painel do Supabase

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('buy', 'pay')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity INTEGER,
  unit_price NUMERIC(10,2),
  total NUMERIC(10,2),
  amount NUMERIC(10,2),
  method TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  obs TEXT
);
