import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { submitContactRequest } from '../lib/api';
import toast from 'react-hot-toast';
import type { ContactRequest } from '../lib/types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectType: string;
  estimatedBudget: number;
}

export default function ContactModal({ isOpen, onClose, projectType, estimatedBudget }: ContactModalProps) {
  const [formData, setFormData] = useState<Omit<ContactRequest, 'id' | 'created_at' | 'broker_id'>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    postal_code: '',
    project_type: projectType,
    estimated_budget: estimatedBudget,
    message: ''
  });

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setFormData(prev => ({ ...prev, postal_code: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.postal_code.length !== 2) {
      toast.error('Veuillez entrer les deux chiffres de votre département');
      return;
    }

    try {
      // Disable form during submission
      const form = e.target as HTMLFormElement;
      const inputs = form.getElementsByTagName('input');
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

      for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
      }
      submitButton.disabled = true;

      await submitContactRequest(formData);
      toast.success('Votre demande a été envoyée avec succès !');
      onClose();

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        postal_code: '',
        project_type: projectType,
        estimated_budget: estimatedBudget,
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact request:', error);
      toast.error('Une erreur est survenue lors de l\'envoi de votre demande');
    } finally {
      const form = e.target as HTMLFormElement;
      const inputs = form.getElementsByTagName('input');
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;

      for (let i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
      }
      submitButton.disabled = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Se faire contacter</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                inputMode="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département (2 chiffres)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={formData.postal_code}
                onChange={handlePostalCodeChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="75"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {formData.postal_code.length}/2
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Entrez les deux chiffres de votre département (ex: 75 pour Paris)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optionnel)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Précisez vos besoins..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}