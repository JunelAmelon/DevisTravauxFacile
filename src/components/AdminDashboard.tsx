import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, LogOut, Search, Filter, Download, Clock, CheckCircle,
  XCircle, AlertCircle, Loader2, ChevronDown, RefreshCcw, Eye,
  Calendar, Phone, Mail, Building, DollarSign, MessageSquare,
  User, Briefcase, Settings, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { requireAdmin, logout } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface QuoteRequest {
  id: string;
  project_type: string;
  budget: number;
  deadline: string;
  services: Record<string, boolean>;
  description: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string | null;
  preferred_contact: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4" />,
  processing: <Loader2 className="h-4 w-4 animate-spin" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />
};

const STATUS_LABELS = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

const PROJECT_TYPES = {
  renovation: 'Rénovation complète',
  painting: 'Peinture & Décoration',
  plumbing: 'Plomberie',
  electricity: 'Électricité',
  flooring: 'Sol & Carrelage',
  hvac: 'Climatisation & Chauffage'
};

const SERVICES = {
  design: 'Conception et plans',
  demolition: 'Démolition et préparation',
  materials: 'Fourniture des matériaux',
  installation: 'Installation complète',
  finishing: 'Finitions',
  cleanup: 'Nettoyage chantier'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof QuoteRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!requireAdmin(navigate)) {
        return;
      }
      fetchQuoteRequests();
    };
    init();
  }, [navigate]);

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        console.log('Data fetched:', data);
        const formattedData = data.map(request => ({
          ...request,
          services: request.services || {},
          status: request.status || 'pending',
          budget: Number(request.budget) || 0,
          created_at: request.created_at || new Date().toISOString(),
          deadline: request.deadline || new Date().toISOString()
        }));
        setQuoteRequests(formattedData);
      } else {
        console.warn('No data returned from Supabase');
        setQuoteRequests([]);
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      toast.error('Erreur lors du chargement des demandes de devis');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: QuoteRequest['status']) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      setQuoteRequests(prev =>
        prev.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );

      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Déconnexion réussie');
  };

  const downloadCSV = () => {
    const headers = [
      'ID',
      'Date de création',
      'Prénom',
      'Nom',
      'Email',
      'Téléphone',
      'Entreprise',
      'Type de projet',
      'Budget',
      'Date souhaitée',
      'Services',
      'Description',
      'Contact préféré',
      'Statut'
    ];

    const csvData = quoteRequests.map(request => [
      request.id,
      new Date(request.created_at).toLocaleString('fr-FR'),
      request.first_name,
      request.last_name,
      request.email,
      request.phone,
      request.company || '-',
      PROJECT_TYPES[request.project_type as keyof typeof PROJECT_TYPES],
      `${request.budget.toLocaleString()}€`,
      new Date(request.deadline).toLocaleDateString('fr-FR'),
      Object.entries(request.services)
        .filter(([_, selected]) => selected)
        .map(([service]) => SERVICES[service as keyof typeof SERVICES])
        .join(', '),
      request.description,
      request.preferred_contact,
      STATUS_LABELS[request.status]
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `devis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: keyof QuoteRequest) => {
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedAndFilteredRequests = quoteRequests
    .filter(request => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        request.first_name.toLowerCase().includes(searchLower) ||
        request.last_name.toLowerCase().includes(searchLower) ||
        request.email.toLowerCase().includes(searchLower) ||
        request.phone.includes(searchTerm) ||
        (request.company && request.company.toLowerCase().includes(searchLower));

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === 'budget') {
        return sortDirection === 'asc' ? a.budget - b.budget : b.budget - a.budget;
      }
      if (sortField === 'created_at') {
        return sortDirection === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return sortDirection === 'asc'
        ? String(a[sortField]).localeCompare(String(b[sortField]))
        : String(b[sortField]).localeCompare(String(a[sortField]));
    });

  const getStatusCount = (status: QuoteRequest['status']) => {
    return quoteRequests.filter(request => request.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
             
               <a href="#" className="flex items-center">
        <img 
          src="https://ideogram.ai/assets/image/lossless/response/FQ8FZWJxSlqkC5xyicsGaw" 
          alt="Logo DevisTravauxFacile" 
          className="h-24 w-24 object-contain" // Taille du logo réduite de 25 %
        />
      </a>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-1">
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg bg-primary/5 text-primary"
            >
              <FileText className="h-5 w-5" />
              <span> </span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <User className="h-5 w-5" />
              <span>Clients</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Briefcase className="h-5 w-5" />
              <span>Projets</span>
            </button>
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Settings className="h-5 w-5" />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold"></h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchQuoteRequests()}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                title="Rafraîchir"
              >
                <RefreshCcw className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-primary transition-colors"
              >
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total des demandes</p>
                  <p className="text-2xl font-bold">{quoteRequests.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En attente</p>
                  <p className="text-2xl font-bold">{getStatusCount('pending')}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En cours</p>
                  <p className="text-2xl font-bold">{getStatusCount('processing')}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Terminées</p>
                  <p className="text-2xl font-bold">{getStatusCount('completed')}</p>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="w-full lg:w-1/2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="processing">En cours</option>
                      <option value="completed">Terminé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={downloadCSV}
                    className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors whitespace-nowrap"
                  >
                    <Download className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Exporter CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('created_at')}
                          >
                            <span>Date</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              sortField === 'created_at' && sortDirection === 'desc' ? 'transform rotate-180' : ''
                            }`} />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('last_name')}
                          >
                            <span>Client</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              sortField === 'last_name' && sortDirection === 'desc' ? 'transform rotate-180' : ''
                            }`} />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('project_type')}
                          >
                            <span>Projet</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              sortField === 'project_type' && sortDirection === 'desc' ? 'transform rotate-180' : ''
                            }`} />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('budget')}
                          >
                            <span>Budget</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              sortField === 'budget' && sortDirection === 'desc' ? 'transform rotate-180' : ''
                            }`} />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('status')}
                          >
                            <span>Statut</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${
                              sortField === 'status' && sortDirection === 'desc' ? 'transform rotate-180' : ''
                            }`} />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedAndFilteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.first_name} {request.last_name}
                            </div>
                            {request.company && (
                              <div className="text-sm text-gray-500">{request.company}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{request.email}</div>
                            <div className="text-sm text-gray-500">{request.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {PROJECT_TYPES[request.project_type as keyof typeof PROJECT_TYPES]}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Object.entries(request.services)
                                .filter(([_, selected]) => selected)
                                .map(([service]) => SERVICES[service as keyof typeof SERVICES])
                                .join(', ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.budget.toLocaleString()}€
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative inline-block">
                              <select
                                value={request.status}
                                onChange={(e) => handleStatusChange(request.id, e.target.value as QuoteRequest['status'])}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  STATUS_COLORS[request.status]
                                } border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                              >
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsModalOpen(true);
                              }}
                              className="text-primary hover:text-primary-light transition-colors"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Détails de la demande</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informations client</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="text-sm font-medium">
                      {selectedRequest.first_name} {selectedRequest.last_name}
                    </p>
                  </div>
                  {selectedRequest.company && (
                    <div>
                      <p className="text-sm text-gray-500">Entreprise</p>
                      <p className="text-sm font-medium">{selectedRequest.company}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-sm font-medium">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact préféré</p>
                    <p className="text-sm font-medium">{selectedRequest.preferred_contact}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Détails du projet</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Type de projet</p>
                    <p className="text-sm font-medium">
                      {PROJECT_TYPES[selectedRequest.project_type as keyof typeof PROJECT_TYPES]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="text-sm font-medium">{selectedRequest.budget.toLocaleString()}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date souhaitée</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedRequest.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Services demandés</p>
                    <ul className="mt-1 space-y-1">
                      {Object.entries(selectedRequest.services)
                        .filter(([_, selected]) => selected)
                        .map(([service]) => (
                          <li key={service} className="text-sm font-medium">
                            • {SERVICES[service as keyof typeof SERVICES]}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-sm font-medium whitespace-pre-wrap">
                      {selectedRequest.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {STATUS_ICONS[selectedRequest.status]}
                  <span className={`text-sm font-medium ${STATUS_COLORS[selectedRequest.status]}`}>
                    {STATUS_LABELS[selectedRequest.status]}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}