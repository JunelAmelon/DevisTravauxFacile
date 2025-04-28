import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, ArrowUpDown, MapPinned, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Broker, SearchFilters, Address } from '../lib/types';

const BROKERS_PER_PAGE = 6;

export default function BrokerSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'experience',
    sortOrder: 'desc'
  });

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('brokers')
        .select(`
          *,
          address:addresses(*)
        `);

      // Si une recherche est en cours, filtrer par les champs d'adresse
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase().split(' ');
        query = query.or(
          searchTerms.map(term => `
            address.city.ilike.%${term}%,
            address.postal_code.ilike.%${term}%,
            address.street_name.ilike.%${term}%
          `).join(',')
        );
      }

      // Appliquer le tri
      if (filters.sortBy === 'experience') {
        query = query.order('experience_years', { ascending: filters.sortOrder === 'asc' });
      } else if (filters.sortBy === 'name') {
        query = query.order('last_name', { ascending: filters.sortOrder === 'asc' });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Formater les données des courtiers
      const formattedBrokers = data?.map(broker => ({
        ...broker,
        address: broker.address
      })) || [];

      setBrokers(formattedBrokers);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const searchTerms = query.toLowerCase().split(' ');
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .or(
          searchTerms.map(term => `
            city.ilike.%${term}%,
            postal_code.ilike.%${term}%,
            street_name.ilike.%${term}%
          `).join(',')
        )
        .limit(5);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Mettre à jour les résultats quand la recherche ou les filtres changent
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBrokers();
    }, 300); // Délai de 300ms pour éviter trop d'appels API

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, filters]);

  // Mettre à jour les suggestions pendant la saisie
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        fetchAddressSuggestions(searchQuery);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const totalPages = Math.ceil(brokers.length / BROKERS_PER_PAGE);
  const paginatedBrokers = brokers.slice(
    (currentPage - 1) * BROKERS_PER_PAGE,
    currentPage * BROKERS_PER_PAGE
  );

  const toggleSort = (field: 'experience' | 'name') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleSuggestionClick = (address: Address) => {
    setSearchQuery(`${address.street_name}, ${address.postal_code} ${address.city}`);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par ville, code postal ou rue..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring focus:ring-primary/20 transition-all text-lg"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              {suggestions.map((address) => (
                <button
                  key={address.id}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors"
                  onClick={() => handleSuggestionClick(address)}
                >
                  <MapPinned className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {address.street_number} {address.street_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.postal_code} {address.city}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">
          {brokers.length} courtier{brokers.length > 1 ? 's' : ''} trouvé{brokers.length > 1 ? 's' : ''}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toggleSort('experience')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              filters.sortBy === 'experience'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            <Clock className="h-4 w-4" />
            Expérience
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              filters.sortBy === 'name'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            Nom
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse broker-card">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
              <div className="mt-6 flex gap-3">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBrokers.map((broker) => (
              <div key={broker.id} className="broker-card">
                <div className="flex items-start gap-4">
                  <img
                    src={broker.profile_image}
                    alt={`${broker.first_name} ${broker.last_name}`}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold truncate">
                      {broker.first_name} {broker.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {broker.experience_years} ans d'expérience
                    </p>
                    <p className="text-sm text-gray-500">
                      License n°{broker.license_number}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {broker.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">
                          {broker.address.street_number} {broker.address.street_name}
                        </p>
                        <p>{broker.address.postal_code} {broker.address.city}</p>
                      </div>
                    </div>
                  )}
                  <p className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                    <span className="truncate">{broker.phone}</span>
                  </p>
                  <p className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                    <span className="truncate">{broker.email}</span>
                  </p>
                </div>

                <p className="mt-4 text-sm text-gray-700 line-clamp-3">
                  {broker.description}
                </p>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`mailto:${broker.email}`}
                    className="flex-1 btn-primary text-center text-sm py-2.5"
                  >
                    Contacter
                  </a>
                  <a
                    href={`tel:${broker.phone}`}
                    className="flex-1 btn-secondary text-center text-sm py-2.5"
                  >
                    Appeler
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 flex-wrap">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}