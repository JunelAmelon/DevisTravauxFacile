import { Database } from './database.types';

export interface Address {
  id: string;
  street_number: string;
  street_name: string;
  city: string;
  postal_code: string;
  created_at: string;
}

export interface Broker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  bio: string;
  profile_image: string;
  address_id: string;
  description: string;
  address?: Address;
}

export interface SearchFilters {
  city?: string;
  postalCode?: string;
  sortBy?: 'experience' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ContactRequest {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postal_code: string;
  project_type: string;
  estimated_budget: number;
  message?: string;
  created_at?: string;
}