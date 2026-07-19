-- Phase 3: Dynamic Wallet & Blockchain Ledger

-- 1. Wallet Balances Table
CREATE TABLE IF NOT EXISTS public.wallet_balances (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for wallet_balances
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance" 
ON public.wallet_balances FOR SELECT 
USING (auth.uid() = user_id);

-- Create a trigger to automatically create a wallet for new users
CREATE OR REPLACE FUNCTION public.create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallet_balances (user_id, balance)
  VALUES (NEW.id, 1000.00); -- Give everyone 1000 initial campus coins for testing
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe trigger creation
DROP TRIGGER IF EXISTS on_user_created_wallet ON auth.users;
CREATE TRIGGER on_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_wallet_for_new_user();

-- Insert wallets for existing users
INSERT INTO public.wallet_balances (user_id, balance)
SELECT id, 1000.00 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- 2. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  amount NUMERIC(10, 2) NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('debit', 'credit', 'transfer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
ON public.wallet_transactions FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Secure RPC for transferring money
CREATE OR REPLACE FUNCTION public.transfer_campus_coins(
  receiver_email TEXT,
  transfer_amount NUMERIC,
  transfer_title TEXT
)
RETURNS JSON AS $$
DECLARE
  sender_uuid UUID;
  receiver_uuid UUID;
  sender_balance NUMERIC;
BEGIN
  sender_uuid := auth.uid();
  
  IF sender_uuid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF transfer_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Amount must be greater than 0');
  END IF;

  -- Get receiver UUID
  SELECT id INTO receiver_uuid FROM public.users WHERE email = receiver_email;
  IF receiver_uuid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Receiver not found');
  END IF;

  IF sender_uuid = receiver_uuid THEN
    RETURN json_build_object('success', false, 'error', 'Cannot send to yourself');
  END IF;

  -- Check sender balance
  SELECT balance INTO sender_balance FROM public.wallet_balances WHERE user_id = sender_uuid FOR UPDATE;
  
  IF sender_balance < transfer_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  -- Perform transfer (Transactional)
  UPDATE public.wallet_balances SET balance = balance - transfer_amount WHERE user_id = sender_uuid;
  UPDATE public.wallet_balances SET balance = balance + transfer_amount WHERE user_id = receiver_uuid;

  INSERT INTO public.wallet_transactions (sender_id, receiver_id, amount, title, type)
  VALUES (sender_uuid, receiver_uuid, transfer_amount, transfer_title, 'transfer');

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Credential Ledger (Blockchain Simulator)
CREATE TABLE IF NOT EXISTS public.credential_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  credential_type TEXT NOT NULL,
  data_payload JSONB NOT NULL,
  cryptographic_hash TEXT NOT NULL UNIQUE,
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.credential_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credentials" 
ON public.credential_ledger FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials" 
ON public.credential_ledger FOR INSERT 
WITH CHECK (auth.uid() = user_id);
