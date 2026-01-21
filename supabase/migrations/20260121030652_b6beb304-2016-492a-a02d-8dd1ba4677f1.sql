-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'operator');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'owner',
    company_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, company_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND company_id = get_user_company_id()
  )
$$;

-- 4. Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  AND company_id = get_user_company_id()
  LIMIT 1
$$;

-- 5. RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 6. Create vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    client_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    placa TEXT NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER,
    cor TEXT,
    tipo TEXT NOT NULL DEFAULT 'moto',
    km_atual INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (company_id, placa)
);

-- Enable RLS on vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 7. Create trigger for updated_at
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. RLS policies for vehicles

-- SELECT: All authenticated users from same company can view
CREATE POLICY "Users can view vehicles from their company"
ON public.vehicles FOR SELECT
USING (company_id = get_user_company_id() AND deleted_at IS NULL);

-- INSERT: All roles can create (admin, owner, operator)
CREATE POLICY "Users can create vehicles in their company"
ON public.vehicles FOR INSERT
WITH CHECK (company_id = get_user_company_id());

-- UPDATE: Admin and Owner can update
CREATE POLICY "Admin and Owner can update vehicles"
ON public.vehicles FOR UPDATE
USING (
    company_id = get_user_company_id() 
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
);

-- DELETE: Only Admin and Owner can soft-delete
CREATE POLICY "Admin and Owner can delete vehicles"
ON public.vehicles FOR DELETE
USING (
    company_id = get_user_company_id() 
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'))
);

-- 9. Create index for faster lookups
CREATE INDEX idx_vehicles_company_id ON public.vehicles(company_id);
CREATE INDEX idx_vehicles_client_id ON public.vehicles(client_id);
CREATE INDEX idx_vehicles_placa ON public.vehicles(placa);