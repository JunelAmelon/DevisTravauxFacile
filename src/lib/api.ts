import { supabase } from './supabase';

interface ContactSubmission {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postal_code: string;
  project_type: string;
  estimated_budget: number;
  message?: string;
}

export async function submitContactRequest(data: ContactSubmission) {
  try {
    // Validation de base
    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'postal_code', 'project_type', 'estimated_budget'];
    const missingFields = requiredFields.filter(field => !data[field as keyof ContactSubmission]);
    
    if (missingFields.length > 0) {
      throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
    }

    const { data: result, error } = await supabase
      .from('contact_requests')
      .insert([{
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        postal_code: data.postal_code,
        project_type: data.project_type,
        estimated_budget: data.estimated_budget,
        message: data.message || '',
        status: 'pending' // Added status field with default value
      }])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error: any) {
    console.error('Erreur lors de la soumission:', error);
    throw new Error(`Erreur: ${error.message}`);
  }
}