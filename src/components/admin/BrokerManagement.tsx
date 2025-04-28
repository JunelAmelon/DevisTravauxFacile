import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  X,
  Check,
  BarChart2,
  PhoneCall,
  MessageSquare,
  ArrowUpDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { requireAdmin } from '../../lib/auth';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface Broker {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  bio: string;
  profile_image: string;
  address_id?: string;
  description?: string;
  call_clicks: number;
  message_clicks: number;
  created_at: string;
}

interface BrokerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  bio: string;
  profile_image: string;
  description?: string;
}

export default function BrokerManagement() {
  const navigate = useNavigate();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Broker>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState<Broker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [formData, setFormData] = useState<BrokerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    experience_years: 0,
    bio: '',
    profile_image: '',
    description: '',
  });

  useEffect(() => {
    const init = async () => {
      if (!requireAdmin(navigate)) return;
      fetchBrokers();
    };
    init();
  }, [navigate]);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setBrokers(data || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
      toast.error('Erreur lors du chargement des courtiers');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Broker) => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleDelete = async (broker: Broker) => {
    setBrokerToDelete(broker);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!brokerToDelete) return;

    try {
      const { error } = await supabase
        .from('brokers')
        .delete()
        .eq('id', brokerToDelete.id);

      if (error) throw error;

      setBrokers(prev => prev.filter(b => b.id !== brokerToDelete.id));
      toast.success('Courtier supprimé avec succès');
    } catch (error) {
      console.error('Error deleting broker:', error);
      toast.error('Erreur lors de la suppression du courtier');
    } finally {
      setShowDeleteModal(false);
      setBrokerToDelete(null);
    }
  };

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker);
    setFormData({
      first_name: broker.first_name,
      last_name: broker.last_name,
      email: broker.email,
      phone: broker.phone,
      license_number: broker.license_number,
      experience_years: broker.experience_years,
      bio: broker.bio,
      profile_image: broker.profile_image,
      description: broker.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBroker) {
        const { error } = await supabase
          .from('brokers')
          .update(formData)
          .eq('id', editingBroker.id);

        if (error) throw error;
        toast.success('Courtier mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('brokers')
          .insert([formData]);

        if (error) throw error;
        toast.success('Courtier ajouté avec succès');
      }

      setShowForm(false);
      setEditingBroker(null);
      fetchBrokers();
    } catch (error) {
      console.error('Error saving broker:', error);
      toast.error('Erreur lors de l\'enregistrement du courtier');
    }
  };

  const exportData = () => {
    const csv = [
      ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Licence', 'Expérience', 'Appels', 'Messages', 'Date de création'],
      ...brokers.map(broker => [
        broker.id,
        broker.last_name,
        broker.first_name,
        broker.email,
        broker.phone,
        broker.license_number,
        broker.experience_years,
        broker.call_clicks,
        broker.message_clicks,
        new Date(broker.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courtiers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredBrokers = brokers.filter(broker =>
    broker.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.phone.includes(searchTerm)
  );

  const pageCount = Math.ceil(filteredBrokers.length / itemsPerPage);
  const paginatedBrokers = filteredBrokers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics data
  const interactionData = [
    { name: 'Jan', appels: 65, messages: 45 },
    { name: 'Fév', appels: 59, messages: 49 },
    { name: 'Mar', appels: 80, messages: 62 },
    { name: 'Avr', appels: 81, messages: 66 },
    { name: 'Mai', appels: 56, messages: 48 },
    { name: 'Juin', appels: 55, messages: 45 },
  ];

  const topBrokers = brokers
    .sort((a, b) => (b.call_clicks + b.message_clicks) - (a.call_clicks + a.message_clicks))
    .slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Gestion des courtiers</h1>
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Interactions mensuelles</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appels" stroke="#e42c2c" />
                <Line type="monotone" dataKey="messages" stroke="#757650" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Top 5 courtiers</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBrokers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="first_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="call_clicks" name="Appels" fill="#e42c2c" />
                <Bar dataKey="message_clicks" name="Messages" fill="#757650" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un courtier..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingBroker(null);
                setFormData({
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  license_number: '',
                  experience_years: 0,
                  bio: '',
                  profile_image: '',
                  description: '',
                });
                setShowForm(true);
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un courtier
            </button>
            <button
              onClick={exportData}
              className="btn-secondary flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort('last_name')}
                  >
                    <span>Nom</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort('experience_years')}
                  >
                    <span>Expérience</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort('call_clicks')}
                  >
                    <span>Interactions</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBrokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={broker.profile_image}
                        alt={`${broker.first_name} ${broker.last_name}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {broker.first_name} {broker.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {broker.license_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{broker.email}</div>
                    <div className="text-sm text-gray-500">{broker.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {broker.experience_years} ans
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <PhoneCall className="h-4 w-4 mr-1" />
                        {broker.call_clicks}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {broker.message_clicks}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(broker)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(broker)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="px-6 py-4 flex justify-center">
            <div className="flex space-x-2">
              {[...Array(pageCount)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && brokerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le courtier {brokerToDelete.first_name} {brokerToDelete.last_name} ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broker Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {editingBroker ? 'Modifier le courtier' : 'Ajouter un courtier'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de licence
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Années d'expérience
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la photo de profil
                </label>
                <input
                  type="url"
                  value={formData.profile_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, profile_image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
                >
                  {editingBroker ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}