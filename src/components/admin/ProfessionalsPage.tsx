import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowUpDown, Phone, Mail, Edit, Trash2, AlertTriangle,
  X, Star, MapPin, Award, CheckCircle, PhoneCall, MessageSquare,
  Users, BarChart2, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ProfessionalForm from './ProfessionalForm';

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  region: string;
  image: string;
  description: string;
  experience: number;
  specialties: string[];
  certifications: string[];
  completed_projects: number;
  call_clicks: number;
  message_clicks: number;
  created_at: string;
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Professional>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast.error('Erreur lors du chargement des professionnels');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Professional) => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleDelete = async (pro: Professional) => {
    setSelectedPro(pro);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPro) return;
    
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', selectedPro.id);

      if (error) throw error;
      toast.success('Professionnel supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedPro(null);
      fetchProfessionals();
    } catch (error) {
      console.error('Error deleting professional:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (pro: Professional) => {
    setSelectedPro(pro);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedPro(null);
    setShowForm(true);
  };

  const filteredPros = professionals.filter(pro => 
    pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pro.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total interactions
  const totalCalls = professionals.reduce((sum, pro) => sum + (pro.call_clicks || 0), 0);
  const totalMessages = professionals.reduce((sum, pro) => sum + (pro.message_clicks || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Gestion des professionnels</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des pros</p>
                <p className="text-xl sm:text-2xl font-bold">{professionals.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des appels</p>
                <p className="text-xl sm:text-2xl font-bold">{totalCalls}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(totalCalls / professionals.length).toFixed(1)} appels/pro
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <PhoneCall className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des messages</p>
                <p className="text-xl sm:text-2xl font-bold">{totalMessages}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(totalMessages / professionals.length).toFixed(1)} messages/pro
                </p>
              </div>
              <div className="h-12 w-12 bg

-blue-50 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total interactions</p>
                <p className="text-xl sm:text-2xl font-bold">{totalCalls + totalMessages}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((totalCalls + totalMessages) / professionals.length).toFixed(1)} par pro
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un professionnel..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un professionnel
          </button>
        </div>
      </div>

      {/* Professionals Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort('name')}
                  >
                    <span>Professionnel</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort('region')}
                  >
                    <span>Région</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort('experience')}
                  >
                    <span>Expérience</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              ) : filteredPros.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun professionnel trouvé
                  </td>
                </tr>
              ) : (
                filteredPros.map((pro) => (
                  <tr key={pro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={pro.image}
                          alt={pro.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pro.name}</div>
                          <div className="text-sm text-gray-500">{pro.specialties.join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pro.email}</div>
                      <div className="text-sm text-gray-500">{pro.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{pro.region}</div>
                          <div className="text-sm text-gray-500">Dép. {pro.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm text-gray-900">{pro.experience} ans</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(pro)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pro)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-xl font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le professionnel {selectedPro.name} ?
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

      {/* Professional Form Modal */}
      {showForm && (
        <ProfessionalForm
          professional={selectedPro || undefined}
          onClose={() => setShowForm(false)}
          onSuccess={fetchProfessionals}
        />
      )}
    </div>
  );
}