import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Building2, Paintbrush, Lightbulb, Droplets, 
  ToyBrick, Fan, Upload, Calendar, CheckCircle, ChevronRight, 
  ChevronLeft, Phone, Mail, Building, User, Menu, X} from 'lucide-react';
import Footer from './Footer';

type ProjectType = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
};

const projectTypes: ProjectType[] = [
  {
    id: 'renovation',
    title: 'Rénovation complète',
    icon: <Building2 className="h-8 w-8" />,
    description: 'Transformation totale de votre espace',
  },
  {
    id: 'painting',
    title: 'Peinture & Décoration',
    icon: <Paintbrush className="h-8 w-8" />,
    description: 'Rafraîchissement et embellissement',
  },
  {
    id: 'plumbing',
    title: 'Plomberie',
    icon: <Droplets className="h-8 w-8" />,
    description: 'Installation et réparation',
  },
  {
    id: 'electricity',
    title: 'Électricité',
    icon: <Lightbulb className="h-8 w-8" />,
    description: 'Mise aux normes et installation',
  },
  {
    id: 'flooring',
    title: 'Sol & Carrelage',
    icon: <ToyBrick className="h-8 w-8" />,
    description: 'Pose et rénovation',
  },
  {
    id: 'hvac',
    title: 'Climatisation & Chauffage',
    icon: <Fan className="h-8 w-8" />,
    description: 'Installation et maintenance',
  },
];

const availableServices: Service[] = [
  {
    id: 'design',
    name: 'Conception et plans',
    description: 'Plans détaillés et conception 3D',
  },
  {
    id: 'demolition',
    name: 'Démolition et préparation',
    description: 'Travaux préparatoires et démolition',
  },
  {
    id: 'materials',
    name: 'Fourniture des matériaux',
    description: 'Matériaux de qualité professionnelle',
  },
  {
    id: 'installation',
    name: 'Installation complète',
    description: 'Pose et installation par des experts',
  },
  {
    id: 'finishing',
    name: 'Finitions',
    description: 'Travaux de finition soignés',
  },
  {
    id: 'cleanup',
    name: 'Nettoyage chantier',
    description: 'Nettoyage complet post-travaux',
  },
];

export default function QuoteRequest() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    budget: 5000,
    deadline: '',
    services: {} as Record<string, boolean>,
    description: '',
    files: [] as File[],
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    preferredContact: 'email',
    gdprConsent: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...acceptedFiles],
    }));
    toast.success(`${acceptedFiles.length} fichier(s) ajouté(s)`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 5242880, // 5MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!selectedProject || !formData.gdprConsent) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('quote_requests')
        .insert({
          project_type: selectedProject,
          budget: formData.budget,
          deadline: formData.deadline,
          services: Object.entries(formData.services)
            .filter(([key, selected]) => selected)
            .reduce((acc, [id]) => ({ ...acc, [id]: true }), {}),
          description: formData.description,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || null,
          preferred_contact: formData.preferredContact,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Votre demande a été envoyée avec succès !');
      
      // Reset form
      setStep(1);
      setSelectedProject(null);
      setFormData({
        budget: 5000,
        deadline: '',
        services: {},
        description: '',
        files: [],
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        preferredContact: 'email',
        gdprConsent: false,
      });
    } catch (error) {
      console.error('Error submitting quote request:', error);
      toast.error('Une erreur est survenue lors de l\'envoi de votre demande');
    }
  };

const renderStep1 = () => ( 
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    {projectTypes.map((type) => (
      <button
        key={type.id}
        onClick={() => setSelectedProject(type.id)}
        className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-500 ${
          selectedProject === type.id
            ? 'bg-gradient-to-br from-primary to-primary-dark shadow-xl border-2 border-primary/20'
            : 'bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-primary/30'
        }`}
      >
        {/* Effet de fond animé */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          selectedProject === type.id ? 'opacity-100' : ''
        }`}>
          <div className="absolute -top-1 -left-1 w-64 h-64 bg-primary/5 rounded-full filter blur-xl"></div>
          <div className="absolute -bottom-1 -right-1 w-64 h-64 bg-secondary/5 rounded-full filter blur-xl"></div>
        </div>

        {/* Contenu de la carte */}
        <div className="relative z-10">
          <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center transition-all ${
            selectedProject === type.id 
              ? 'bg-white/20 text-white'
              : 'bg-primary/10 text-primary'
          }`}>
            {React.cloneElement(type.icon as React.ReactElement, {
              className: "w-6 h-6"
            })}
          </div>
          
          <h3 className={`text-2xl font-bold mb-3 transition-colors ${
            selectedProject === type.id ? 'text-white' : 'text-gray-900'
          }`}>
            {type.title}
          </h3>
          
          <p className={`text-base leading-relaxed ${
            selectedProject === type.id ? 'text-white/80' : 'text-gray-600'
          }`}>
            {type.description}
          </p>
          
          {/* Indicateur de sélection */}
          <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            selectedProject === type.id 
              ? 'border-white bg-primary'
              : 'border-gray-300 group-hover:border-primary'
          }`}>
            {selectedProject === type.id && (
              <div className="w-3 h-3 bg-white rounded-full"></div>
            )}
          </div>
        </div>
      </button>
    ))}
  </div>
);

  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Budget estimé
        </label>
        <div className="relative">
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={formData.budget}
            onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            title="Budget estimé"
            aria-label="Budget estimé"
          />
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary text-white px-3 py-1 rounded-lg text-sm">
              {formData.budget.toLocaleString()}€
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date souhaitée de début
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            title="Date souhaitée de début"
            aria-label="Date souhaitée de début"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services souhaités
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          {availableServices.map((service) => (
            <label
              key={service.id}
              className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all ${
                formData.services[service.id] 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-white border-gray-200'
              } border-2`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.services[service.id] || false}
                  onChange={() => setFormData(prev => ({
                    ...prev,
                    services: {
                      ...prev.services,
                      [service.id]: !prev.services[service.id],
                    },
                  }))}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className={`font-medium ${
                    formData.services[service.id] ? 'text-primary' : 'text-gray-700'
                  }`}>
                    {service.name}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description détaillée
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Décrivez votre projet en détail..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documents & Références
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Déposez les fichiers ici...'
              : 'Glissez-déposez vos fichiers ici ou cliquez pour sélectionner'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Formats acceptés : JPG, PNG, PDF (max 5MB)
          </p>
        </div>
        {formData.files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers sélectionnés :</h4>
            <ul className="space-y-2">
              {formData.files.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
              title="Prénom"
              aria-label="Prénom"
              placeholder="Votre prénom"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
              title="Nom"
              aria-label="Nom"
              placeholder="Votre nom"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email professionnel
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
              title="Email professionnel"
              aria-label="Email professionnel"
              placeholder="votre@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
              title="Téléphone"
              aria-label="Téléphone"
              placeholder="Votre numéro de téléphone"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entreprise (optionnel)
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            title="Entreprise (optionnel)"
            aria-label="Entreprise (optionnel)"
            placeholder="Nom de votre entreprise (optionnel)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Moyen de contact préféré
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
              formData.preferredContact === 'email'
                ? 'bg-primary/10 border-primary'
                : 'bg-white border-gray-200'
            } border-2`}
          >
            <input
              type="radio"
              name="preferredContact"
              value="email"
              checked={formData.preferredContact === 'email'}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
              className="sr-only"
            />
            <Mail className={`h-5 w-5 mr-2 ${
              formData.preferredContact === 'email' ? 'text-primary' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              formData.preferredContact === 'email' ? 'text-primary' : 'text-gray-700'
            }`}>
              Email
            </span>
          </label>

          <label
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
              formData.preferredContact === 'phone'
                ? 'bg-primary/10 border-primary'
                : 'bg-white border-gray-200'
            } border-2`}
          >
            <input
              type="radio"
              name="preferredContact"
              value="phone"
              checked={formData.preferredContact === 'phone'}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredContact: e.target.value }))}
              className="sr-only"
            />
            <Phone className={`h-5 w-5 mr-2 ${
              formData.preferredContact === 'phone' ? 'text-primary' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              formData.preferredContact === 'phone' ? 'text-primary' : 'text-gray-700'
            }`}>
              Téléphone
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.gdprConsent}
            onChange={(e) => setFormData(prev => ({ ...prev, gdprConsent: e.target.checked }))}
            className="mt-1"
            required
          />
          <span className="text-sm text-gray-600">
            J'accepte que mes données personnelles soient traitées conformément à la{' '}
            <a href="#" className="text-primary hover:underline">
              politique de confidentialité
            </a>
            . Ces informations sont nécessaires pour le traitement de votre demande et ne seront pas utilisées à des fins commerciales.
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
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
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Fermer le menu" title="Fermer le menu">
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

      {/* Header principal */}
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
              aria-label="Ouvrir le menu"
              title="Ouvrir le menu"
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
            src="https://img.freepik.com/free-photo/payment-payslip-invoice-template-concept_53876-128003.jpg?t=st=1741586446~exp=1741590046~hmac=4ddbaff23671c75a09224c5cb1f79285e501cde996d15fdc64363828b5b735f7&w=1060"
            alt="Rénovation intérieure"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/80 to-dark/50" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Obtenez un devis <span className="text-primary" >personnalisé</span> pour vos travaux
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Remplissez notre formulaire intelligent et recevez une estimation détaillée de votre projet
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="#devis-form" className="btn-primary" style={{ backgroundColor: '#757650' }}>
                Commencer maintenant
              </a>
              <Link to="/" className="btn-secondary">
                Allez à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="devis-form" className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32" />
              
              <div className="relative">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      Demande de devis
                    </h2>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            s === step
                              ? 'bg-primary scale-125'
                              : s < step
                              ? 'bg-primary/30'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {step === 1 && 'Sélectionnez le type de projet qui correspond à vos besoins'}
                    {step === 2 && 'Décrivez votre projet en détail pour obtenir un devis précis'}
                    {step === 3 && 'Renseignez vos informations de contact pour finaliser la demande'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}

                  <div className="mt-8 flex justify-between">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="btn-secondary flex items-center group"
                      >
                        <ChevronLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                        Précédent
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={step === 1 && !selectedProject}
                      className={`btn-primary flex items-center ml-auto group ${
                        step === 1 && !selectedProject ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {step === 3 ? (
                        <>
                          Envoyer la demande
                          <CheckCircle className="h-5 w-5 ml-2 transition-transform group-hover:scale-110" />
                        </>
                      ) : (
                        <>
                          Suivant
                          <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}