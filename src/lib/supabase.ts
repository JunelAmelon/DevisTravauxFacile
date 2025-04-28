import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ContactRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postal_code: string;
  project_type: string;
  estimated_budget: number;
  message?: string;
  professional_name?: string;
}

export async function sendContactRequest(data: ContactRequest) {
  try {
    const { data: result, error: dbError } = await supabase
      .from('contact_requests')
      .insert([{
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        postal_code: data.postal_code,
        project_type: data.project_type,
        estimated_budget: data.estimated_budget,
        message: data.message
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    return result;
  } catch (error) {
    console.error('Error in sendContactRequest:', error);
    throw error;
  }
}