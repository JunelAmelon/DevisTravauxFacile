import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, ArrowUpDown, Calendar, DollarSign, Tag, Clock,
  FileText, CheckCircle, AlertCircle, XCircle, BarChart2,
  Phone, Mail, Building, User, Menu, X, ArrowLeft, Loader2
} from 'lucide-react';
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

interface Project {
  id: string;
  project_type: string;
  budget: number;
  deadline: string;
  status: string;
  description: string;
  client_name: string;
  client_email: string;
  created_at: string;
}

const PROJECT_TYPES = {
  renovation: 'Rénovation complète',
  painting: 'Peinture & Décoration',
  plumbing: 'Plomberie',
  electricity: 'Électricité',
  flooring: 'Sol & Carrelage',
  hvac: 'Climatisation & Chauffage'
};

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Project>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*, first_name, last_name, email')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = data?.map(request => ({
        id: request.id,
        project_type: request.project_type,
        budget: request.budget,
        deadline: request.deadline,
        status: request.status,
        description: request.description,
        client_name: `${request.first_name} ${request.last_name}`,
        client_email: request.email,
        created_at: request.created_at
      })) || [];

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Project) => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const getStatusCount = (status: string) => {
    return projects.filter(project => project.status === status).length;
  };

  const getTotalBudget = () => {
    return projects.reduce((sum, project) => sum + project.budget, 0);
  };

  // Données pour les graphiques
  const monthlyData = [
    { name: 'Jan', devis: 12, budget: 45000 },
    { name: 'Fév', devis: 19, budget: 65000 },
    { name: 'Mar', devis: 15, budget: 55000 },
    { name: 'Avr', devis: 22, budget: 78000 },
    { name: 'Mai', devis: 18, budget: 62000 },
    { name: 'Juin', devis: 25, budget: 85000 }
  ];

  const statusData = [
    { name: 'En attente', value: getStatusCount('pending') },
    { name: 'En cours', value: getStatusCount('processing') },
    { name: 'Terminé', value: getStatusCount('completed') },
    { name: 'Annulé', value: getStatusCount('cancelled') }
  ];

  const filteredProjects = projects.filter(project =>
    project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    PROJECT_TYPES[project.project_type as keyof typeof PROJECT_TYPES]
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des devis</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
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

          <div className="bg-white rounded-xl p-6 shadow-lg">
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

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget total</p>
                <p className="text-2xl font-bold">{getTotalBudget().toLocaleString()}€</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Évolution mensuelle</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="devis"
                  name="Nombre de devis"
                  stroke="#e42c2c"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="budget"
                  name="Budget total (€)"
                  stroke="#757650"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Répartition par statut</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#e42c2c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Derniers devis reçus</h2>
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center space-x-1"
                      onClick={() => handleSort('created_at')}
                    >
                      <span>Date</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center space-x-1"
                      onClick={() => handleSort('project_type')}
                    >
                      <span>Type de projet</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center space-x-1"
                      onClick={() => handleSort('budget')}
                    >
                      <span>Budget</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun projet trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProjects.slice(0, 10).map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{project.client_name}</div>
                        <div className="text-sm text-gray-500">{project.client_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {PROJECT_TYPES[project.project_type as keyof typeof PROJECT_TYPES]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.budget.toLocaleString()}€
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]
                        }`}>
                          {STATUS_ICONS[project.status as keyof typeof STATUS_ICONS]}
                          <span className="ml-1">{STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}