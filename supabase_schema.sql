-- Create apartments table
CREATE TABLE apartments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  floor INTEGER,
  rooms INTEGER,
  area NUMERIC,
  price NUMERIC,
  status TEXT DEFAULT 'available',
  description TEXT,
  images TEXT[] DEFAULT '{}',
  image_url TEXT
);

-- Create investments table
CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}'
);

-- Create news table
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  content TEXT,
  image TEXT
);

-- Create storage bucket for uploads
-- Note: Buckets are usually created via the UI or a separate script
-- But you can also do it via SQL if you have the permission
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
