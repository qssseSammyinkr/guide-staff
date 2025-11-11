import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://brxyerypbsgtkyffttob.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeHllcnlwYnNndGt5ZmZ0dG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NDIyMzUsImV4cCI6MjA3ODQxODIzNX0.pKjf9VXRjBlyr-VmjCCF0MI8bamn4zA3xDWQzd3BTko';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
