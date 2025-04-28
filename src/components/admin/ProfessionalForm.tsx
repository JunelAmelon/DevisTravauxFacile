import React, { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Professional {
  id?: string;
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
}

interface ProfessionalFormProps {
  professional?: Professional;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfessionalForm({ professional, onClose, onSuccess }: ProfessionalFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<Professional>(professional || {
    name: '',
    email: '',
    phone: '',
    department: '',
    region: '',
    image: '',
    description: '',
    experience: 0,
    specialties: [],
    certifications: []
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      setImageFile(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `professionals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Erreur lors du téléchargement de l\'image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const professionalData = {
        ...formData,
        image: imageUrl
      };

      const { error } = professional?.id 
        ? await supabase
            .from('professionals')
            .update(professionalData)
            .eq('id', professional.id)
        : await supabase
            .from('professionals')
            .insert([professionalData]);

      if (error) throw error;

      toast.success(professional ? 'Professionnel mis à jour' : 'Professionnel ajouté');
      await onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving professional:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {showConfirmation ? (
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-xl font-bold">Confirmer les modifications</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir {professional ? 'modifier' : 'ajouter'} ce professionnel ?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Confirmer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {professional ? 'Modifier le professionnel' : 'Ajouter un professionnel'}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Département
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="75"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région
              </label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Île-de-France"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo de profil
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {(formData.image || imageFile) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                )}
                <label className="cursor-pointer relative overflow-hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="h-5 w-5 mr-2" />
                  {imageFile ? 'Changer l\'image' : 'Ajouter une image'}
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Format JPG, PNG. 5MB maximum.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Années d'expérience
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spécialités (séparées par des virgules)
              </label>
              <input
                type="text"
                value={formData.specialties.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Rénovation, Construction, Aménagement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certifications (séparées par des virgules)
              </label>
              <input
                type="text"
                value={formData.certifications.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="RGE, Qualibat..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}