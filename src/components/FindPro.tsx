import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Phone, Mail, Menu, X, MessageSquare,Star, ChevronRight,
  Eye, Clock, Award, XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Footer from './Footer';

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
}

const steps = [
  {
    number: "1",
    title: "Décrivez votre projet",
    description: "Remplissez notre formulaire détaillé pour nous expliquer vos besoins en rénovation"
  },
  {
    number: "2", 
    title: "Trouvez votre expert",
    description: "Nous vous mettons en relation avec un professionnel qualifié dans votre région"
  },
  {
    number: "3",
    title: "Planifiez une visite",
    description: "Organisez une visite sur site pour une évaluation précise de vos travaux"
  },
  {
    number: "4",
    title: "Recevez votre devis",
    description: "Obtenez un devis détaillé et transparent pour votre projet"
  },
  {
    number: "5",
    title: "Démarrez vos travaux",
    description: "Lancez votre projet avec un professionnel de confiance"
  }
];

export default function FindPro() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPros, setShowAllPros] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast.error('Erreur lors du chargement des professionnels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowAllPros(true);
  };

  const handleProfileClick = (pro: Professional) => {
    setSelectedPro(pro);
    document.body.style.overflow = 'hidden';
  };

  const closeProfile = () => {
    setSelectedPro(null);
    document.body.style.overflow = 'auto';
  };

  const trackInteraction = async (proId: string, type: 'call' | 'message') => {
    try {
      const { error } = await supabase
        .from('professional_interactions')
        .insert({ professional_id: proId, interaction_type: type });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleCall = (pro: Professional) => {
    trackInteraction(pro.id, 'call');
    window.location.href = `tel:${pro.phone}`;
  };

  const handleMessage = (pro: Professional) => {
    trackInteraction(pro.id, 'message');
    window.location.href = `mailto:${pro.email}`;
  };

  const filteredPros = professionals.filter(pro => 
    pro.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedPros = searchQuery ? filteredPros : (showAllPros ? professionals : professionals.slice(0, 3));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <img 
              src="https://ideogram.ai/assets/image/lossless/response/FQ8FZWJxSlqkC5xyicsGaw" 
              alt="Logo DevisTravauxFacile" 
              className="h-17 w-17 object-contain" 
            />
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="space-y-4">
            <Link to="/" className="block text-gray-800 hover:text-primary transition-colors">Accueil</Link>
            <Link to="/" onClick={() => { setTimeout(() => { document.getElementById('estimate')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="block text-gray-800 hover:text-primary transition-colors">Estimer vos travaux</Link>
            <Link to="/demander-un-devis" className="block text-gray-800 hover:text-primary transition-colors">Demander un devis</Link>
            <Link to="/trouver-un-pro" className="block text-gray-800 hover:text-primary transition-colors">Trouver un pro</Link>
            
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="relative bg-white py-0">
        <div className="container-custom">
          <nav className="flex items-center justify-between gap-6">
            <a href="#" className="flex items-center">
              <img 
                src="https://ideogram.ai/assets/image/lossless/response/FQ8FZWJxSlqkC5xyicsGaw" 
                alt="Logo DevisTravauxFacile" 
                className="h-24 w-24 object-contain" 
              />
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-800 hover:text-primary transition-colors px-3">Accueil</a>
              <Link to="/" onClick={() => { setTimeout(() => { document.getElementById('estimate')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="text-gray-800 hover:text-primary transition-colors px-3">Estimer vos travaux</Link>
              <Link to="/demander-un-devis" className="text-gray-800 hover:text-primary transition-colors px-3">Demander un devis</Link>
              <Link to="/trouver-un-pro" className="text-gray-800 hover:text-primary transition-colors px-3">Trouver un pro</Link>
             
            </div>
            <button 
              className="md:hidden text-gray-800 p-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-dark overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80"
            alt="Professional contractor"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark/50" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Trouvez le <span className="text-primary">professionnel idéal</span> pour vos travaux
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Des experts qualifiés à votre service dans toute la France pour réaliser vos projets de rénovation et d'amélioration
            </p>
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="2 chiffres de votre departement.."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      {!searchQuery && (
  <section className="py-20 bg-gray-50/50 relative overflow-hidden">
    {/* Fond décoratif */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(#e42c2c_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/30"></div>
    </div>

    <div className="container-custom mb-12 relative">
      <div className="text-center mb-16">
        <span className="text-primary font-medium mb-2 block">NOTRE PROCESSUS</span>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Comment trouver un professionnel avec DevisTravauxFacile ?
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Un processus simple et efficace pour réaliser vos projets de rénovation
        </p>
      </div>

      <div className="relative">
        {/* Process steps */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div key={index} className={`relative ${
              index % 2 === 0 ? 'lg:mt-0' : 'lg:mt-32'
            }`}>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 backdrop-blur-sm">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop curved path */}
        <div className="absolute top-24 left-0 w-full hidden lg:block">
          <svg className="w-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 C300,180 600,20 900,100 C1050,140 1150,100 1200,100"
              stroke="#e42c2c"
              strokeWidth="2"
              strokeDasharray="6,6"
              fill="none"
            />
            <circle cx="0" cy="100" r="8" fill="#e42c2c" />
            <circle cx="300" cy="180" r="8" fill="#e42c2c" />
            <circle cx="600" cy="20" r="8" fill="#e42c2c" />
            <circle cx="900" cy="100" r="8" fill="#e42c2c" />
            <circle cx="1200" cy="100" r="8" fill="#e42c2c" />
          </svg>
        </div>

        {/* Mobile curved path */}
        <div className="absolute inset-0 block lg:hidden">
          <svg className="h-full w-24 mx-auto" viewBox="0 0 100 500" preserveAspectRatio="none">
            <path
              d="M50,0 C30,100 70,200 50,300 C30,400 50,500 50,500"
              stroke="#e42c2c"
              strokeWidth="2"
              strokeDasharray="6,6"
              fill="none"
            />
            <circle cx="50" cy="0" r="8" fill="#e42c2c" />
            <circle cx="50" cy="125" r="8" fill="#e42c2c" />
            <circle cx="50" cy="250" r="8" fill="#e42c2c" />
            <circle cx="50" cy="375" r="8" fill="#e42c2c" />
            <circle cx="50" cy="500" r="8" fill="#e42c2c" />
          </svg>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/demander-un-devis"
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-light transition-colors shadow-lg hover:shadow-xl relative z-50"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Demander un devis gratuit
          </Link>
        </div>
      </div>
    </div>
  </section>
)}
      {/* Professionals Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {searchQuery ? "Résultats de votre recherche" : "Notre réseau d'experts"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {searchQuery
                ? "Voici les professionnels correspondant à votre recherche"
                : "Des professionnels qualifiés et expérimentés pour vous accompagner dans vos projets"}
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {searchQuery && filteredPros.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun pro trouvé</h3>
                  <p className="text-gray-600">
                    Aucun professionnel ne correspond à votre recherche. Essayez un autre département.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedPros.map((pro) => (
                    <div 
                      key={pro.id}
                      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative p-8">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden">
                              <img
                                src={pro.image}
                                alt={pro.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-lg px-2 py-1 text-xs font-medium">
                              Expert
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{pro.name}</h3>
                            <p className="text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-primary" />
                              Département {pro.department}
                            </p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-center mb-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          </div>
                          <p className="text-gray-600 line-clamp-2">{pro.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleProfileClick(pro)}
                            className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleCall(pro)}
                            className="flex items-center justify-center w-full px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
                          >
                            <Phone className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!searchQuery && professionals.length > 3 && !showAllPros && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setShowAllPros(true)}
                    className="inline-flex items-center px-8 py-4 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors shadow-lg hover:shadow-xl"
                  >
                    Voir tous nos experts
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Professional Profile Modal */}
      {selectedPro && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeProfile}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="relative">
                    <img
                      src={selectedPro.image}
                      alt={selectedPro.name}
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <div className="absolute bottom-4 right-4 bg-primary text-white rounded-lg px-3 py-1.5 text-sm font-medium">
                      Expert
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Expérience</p>
                        <p className="font-medium">{selectedPro.experience} ans</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Projets réalisés</p>
                        <p className="font-medium">{selectedPro.completed_projects}+</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Zone d'intervention</p>
                        <p className="font-medium">Département {selectedPro.department}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCall(selectedPro)}
                      className="flex items-center justify-center px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Appeler
                    </button>
                    <button
                      onClick={() => handleMessage(selectedPro)}
                      className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Email
                    </button>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold mb-2">{selectedPro.name}</h2>
                  <div className="flex items-center mb-4">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">À propos</h3>
                    <p className="text-gray-600">{selectedPro.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Spécialités</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPro.specialties?.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPro.certifications?.map((certification, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 rounded-full px-4 py-1.5 text-sm"
                        >
                          {certification}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}