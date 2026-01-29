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

-- 1. Create storage bucket for uploads (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to files (Read)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

-- 3. Allow anonymous uploads (Write) 
CREATE POLICY "Allow Anon Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- 4. Allow updates and deletes (for editing/removing photos)
CREATE POLICY "Allow Anon Update" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads');
CREATE POLICY "Allow Anon Delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');
