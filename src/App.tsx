import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Paintbrush, Lightbulb, Droplets, ToyBrick, Star, CheckCircle, Users, ArrowLeft, Menu, X, Thermometer, Shield, Calculator, Leaf, Home, AlertTriangle, MessageSquare, DoorOpen, Info,ShieldCheck} from 'lucide-react';
import { supabase } from './lib/supabase';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';

type EstimationCategory = {
  id: string;
  title: string;
  icon: React.ReactNode;
  image: string;
  questions: Question[];
};

type Question = {
  id: string;
  text: string;
  options: Option[];
  allowCustomValue?: boolean;
};

type Option = {
  text: string;
  value: number;
  nextQuestion?: string;
  isCustom?: boolean;
};

type Review = {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
};



const categories: EstimationCategory[] = [
  // 1. MURS & PEINTURE
  {
    id: 'walls',
    title: 'Peinture & Revêtements muraux',
    icon: <Paintbrush className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828",
    questions: [
      {
        id: 'surface',
        text: 'Surface totale à traiter (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 20m²', value: 250, nextQuestion: 'height' },
          { text: '20-40m²', value: 450, nextQuestion: 'height' },
          { text: '40-60m²', value: 650, nextQuestion: 'height' },
          { text: '60-80m²', value: 850, nextQuestion: 'height' },
          { text: '80-100m²', value: 1100, nextQuestion: 'height' },
          { text: '> 100m²', value: 1500, nextQuestion: 'height' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'height', isCustom: true }
        ]
      },
      {
        id: 'height',
        text: 'Hauteur sous plafond ?',
        allowCustomValue: true,
        options: [
          { text: 'Standard (< 2.4m)', value: 0, nextQuestion: 'angles' },
          { text: 'Intermédiaire (2.4m-2.7m)', value: 120, nextQuestion: 'angles' },
          { text: 'Haute (2.7m-3.0m)', value: 240, nextQuestion: 'angles' },
          { text: 'Très haute (> 3.0m)', value: 360, nextQuestion: 'angles' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'angles', isCustom: true }
        ]
      },
      {
        id: 'angles',
        text: 'Nombre d\'angles/complexité ?',
        allowCustomValue: true,
        options: [
          { text: 'Simple (4 angles)', value: 0, nextQuestion: 'condition' },
          { text: 'Moyen (5-6 angles)', value: 100, nextQuestion: 'condition' },
          { text: 'Complexe (7-8 angles)', value: 200, nextQuestion: 'condition' },
          { text: 'Très complexe (>8 angles/arrondis)', value: 320, nextQuestion: 'condition' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'condition', isCustom: true }
        ]
      },
      {
        id: 'condition',
        text: 'État actuel des murs ?',
        options: [
          { text: 'Bon état', value: 80, nextQuestion: 'preparation' },
          { text: 'Fissures légères', value: 180, nextQuestion: 'preparation' },
          { text: 'Fissures importantes', value: 280, nextQuestion: 'preparation' },
          { text: 'Dégâts majeurs', value: 420, nextQuestion: 'preparation' }
        ]
      },
      {
        id: 'preparation',
        text: 'Préparation nécessaire ?',
        options: [
          { text: 'Nettoyage simple', value: 80, nextQuestion: 'layers' },
          { text: 'Rebouchage léger', value: 180, nextQuestion: 'layers' },
          { text: 'Rebouchage/ponçage complet', value: 280, nextQuestion: 'layers' },
          { text: 'Enduit complet', value: 400, nextQuestion: 'layers' }
        ]
      },
      {
        id: 'layers',
        text: 'Nombre de couches de peinture ?',
        allowCustomValue: true,
        options: [
          { text: '1 couche', value: 0, nextQuestion: 'type' },
          { text: '2 couches', value: 120, nextQuestion: 'type' },
          { text: '3 couches', value: 220, nextQuestion: 'type' },
          { text: '4+ couches', value: 320, nextQuestion: 'type' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'type', isCustom: true }
        ]
      },
      {
        id: 'type',
        text: 'Type de finition ?',
        options: [
          { text: 'Peinture mate', value: 150, nextQuestion: 'quality' },
          { text: 'Peinture satinée', value: 250, nextQuestion: 'quality' },
          { text: 'Peinture brillante', value: 350, nextQuestion: 'quality' },
          { text: 'Revêtement spécial', value: 450, nextQuestion: 'quality' }
        ]
      },
      {
        id: 'quality',
        text: 'Gamme de produits ?',
        options: [
          { text: 'Entrée de gamme', value: 0, nextQuestion: 'colors' },
          { text: 'Milieu de gamme standard', value: 150, nextQuestion: 'colors' },
          { text: 'Milieu de gamme premium', value: 250, nextQuestion: 'colors' },
          { text: 'Haut de gamme', value: 350, nextQuestion: 'colors' }
        ]
      },
      {
        id: 'colors',
        text: 'Nombre de couleurs ?',
        allowCustomValue: true,
        options: [
          { text: 'Monochrome', value: 0, nextQuestion: 'access' },
          { text: '2 couleurs', value: 80, nextQuestion: 'access' },
          { text: '3 couleurs', value: 150, nextQuestion: 'access' },
          { text: '4+ couleurs/dégradé', value: 220, nextQuestion: 'access' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'access', isCustom: true }
        ]
      },
      {
        id: 'access',
        text: 'Conditions d\'accès ?',
        options: [
          { text: 'Accès facile', value: 0 },
          { text: 'Escaliers/accès limité', value: 150 },
          { text: 'Échafaudage nécessaire', value: 300 },
          { text: 'Accès très difficile', value: 450 }
        ]
      }
    ]
  },

  // 2. SOLS
  {
    id: 'floor',
    title: 'Revêtements de sol',
    icon: <ToyBrick className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://img.freepik.com/free-photo/tiler-working-renovation-apartment_23-2149278631.jpg",
    questions: [
      {
        id: 'surface',
        text: 'Surface à couvrir (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 20m²', value: 400, nextQuestion: 'type' },
          { text: '20-40m²', value: 700, nextQuestion: 'type' },
          { text: '40-60m²', value: 1000, nextQuestion: 'type' },
          { text: '60-80m²', value: 1300, nextQuestion: 'type' },
          { text: '80-100m²', value: 1600, nextQuestion: 'type' },
          { text: '> 100m²', value: 2000, nextQuestion: 'type' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'type', isCustom: true }
        ]
      },
      {
        id: 'type',
        text: 'Type de revêtement ?',
        options: [
          { text: 'Vinyle', value: 200, nextQuestion: 'material' },
          { text: 'Carrelage standard', value: 350, nextQuestion: 'material' },
          { text: 'Parquet stratifié', value: 450, nextQuestion: 'material' },
          { text: 'Parquet massif', value: 600, nextQuestion: 'material' },
          { text: 'Moquette', value: 400, nextQuestion: 'material' }
        ]
      },
      {
        id: 'material',
        text: 'Matériau spécifique ?',
        options: [
          { text: 'Céramique/PVC', value: 0, nextQuestion: 'pattern' },
          { text: 'Grès cérame', value: 150, nextQuestion: 'pattern' },
          { text: 'Pierre naturelle', value: 300, nextQuestion: 'pattern' },
          { text: 'Bois massif premium', value: 450, nextQuestion: 'pattern' },
          { text: 'Béton ciré', value: 600, nextQuestion: 'pattern' }
        ]
      },
      {
        id: 'pattern',
        text: 'Motif/pose spéciale ?',
        options: [
          { text: 'Droit standard', value: 0, nextQuestion: 'condition' },
          { text: 'Diagonal simple', value: 120, nextQuestion: 'condition' },
          { text: 'Chevrons', value: 220, nextQuestion: 'condition' },
          { text: 'Motif complexe', value: 350, nextQuestion: 'condition' }
        ]
      },
      {
        id: 'condition',
        text: 'État du sol actuel ?',
        options: [
          { text: 'Prêt à poser', value: 0, nextQuestion: 'preparation' },
          { text: 'Nettoyage nécessaire', value: 120, nextQuestion: 'preparation' },
          { text: 'Décapage', value: 240, nextQuestion: 'preparation' },
          { text: 'Démolition complète', value: 400, nextQuestion: 'preparation' }
        ]
      },
      {
        id: 'preparation',
        text: 'Travaux préparatoires ?',
        options: [
          { text: 'Aucun', value: 0, nextQuestion: 'underlay' },
          { text: 'Ragréage léger', value: 180, nextQuestion: 'underlay' },
          { text: 'Nivellement partiel', value: 300, nextQuestion: 'underlay' },
          { text: 'Nivellement complet', value: 450, nextQuestion: 'underlay' }
        ]
      },
      {
        id: 'underlay',
        text: 'Sous-couche ?',
        options: [
          { text: 'Non', value: 0, nextQuestion: 'sealing' },
          { text: 'Standard (2mm)', value: 100, nextQuestion: 'sealing' },
          { text: 'Épaisse (5mm)', value: 200, nextQuestion: 'sealing' },
          { text: 'Isolante/insonorisante', value: 300, nextQuestion: 'sealing' }
        ]
      },
      {
        id: 'sealing',
        text: 'Traitement de finition ?',
        options: [
          { text: 'Aucun', value: 0, nextQuestion: 'furniture' },
          { text: 'Imperméabilisation basique', value: 150, nextQuestion: 'furniture' },
          { text: 'Imperméabilisation renforcée', value: 250, nextQuestion: 'furniture' },
          { text: 'Traitement spécial', value: 350, nextQuestion: 'furniture' }
        ]
      },
      {
        id: 'furniture',
        text: 'Gestion du mobilier ?',
        options: [
          { text: 'Pièce vide', value: 0, nextQuestion: 'access' },
          { text: 'Déplacement léger', value: 150, nextQuestion: 'access' },
          { text: 'Déplacement complet', value: 300, nextQuestion: 'access' },
          { text: 'Démontage/remontage', value: 450, nextQuestion: 'access' }
        ]
      },
      {
        id: 'access',
        text: 'Contraintes d\'accès ?',
        options: [
          { text: 'Rez-de-chaussée', value: 0 },
          { text: 'Étage avec ascenseur', value: 120 },
          { text: 'Étage sans ascenseur', value: 240 },
          { text: 'Accès très restreint', value: 360 }
        ]
      }
    ]
  },

  // 3. RÉNOVATION ÉNERGÉTIQUE
  {
    id: 'energy-renovation',
    title: 'Rénovation Énergétique',
    icon: <Leaf className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115",
    questions: [
      {
        id: 'building-type',
        text: 'Type de bâtiment ?',
        options: [
          { text: 'Appartement', value: 0, nextQuestion: 'age' },
          { text: 'Maison individuelle', value: 500, nextQuestion: 'age' },
          { text: 'Bâtiment commercial < 100m²', value: 1000, nextQuestion: 'age' },
          { text: 'Bâtiment commercial > 100m²', value: 2000, nextQuestion: 'age' }
        ]
      },
      {
        id: 'age',
        text: 'Année de construction ?',
        options: [
          { text: 'Après 2010', value: 500, nextQuestion: 'surface' },
          { text: '2000-2010', value: 1000, nextQuestion: 'surface' },
          { text: '1980-2000', value: 1500, nextQuestion: 'surface' },
          { text: 'Avant 1980', value: 2500, nextQuestion: 'surface' }
        ]
      },
      {
        id: 'surface',
        text: 'Surface à rénover (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 50m²', value: 1000, nextQuestion: 'dpe' },
          { text: '50-75m²', value: 1800, nextQuestion: 'dpe' },
          { text: '75-100m²', value: 2600, nextQuestion: 'dpe' },
          { text: '100-125m²', value: 3400, nextQuestion: 'dpe' },
          { text: '> 125m²', value: 4500, nextQuestion: 'dpe' },
          { text: 'Autre surface', value: 0, nextQuestion: 'dpe', isCustom: true }
        ]
      },
      {
        id: 'dpe',
        text: 'Diagnostic actuel (DPE) ?',
        options: [
          { text: 'A/B (Déjà performant)', value: 500, nextQuestion: 'insulation' },
          { text: 'C/D (Moyenne performance)', value: 1500, nextQuestion: 'insulation' },
          { text: 'E/F (À améliorer)', value: 3000, nextQuestion: 'insulation' },
          { text: 'G (Passoire thermique)', value: 5000, nextQuestion: 'insulation' }
        ]
      },
      {
        id: 'insulation',
        text: 'Surface à isoler (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 30m²', value: 1500, nextQuestion: 'walls-insulation' },
          { text: '30-50m²', value: 2500, nextQuestion: 'walls-insulation' },
          { text: '50-70m²', value: 3500, nextQuestion: 'walls-insulation' },
          { text: '70-100m²', value: 5000, nextQuestion: 'walls-insulation' },
          { text: '> 100m²', value: 7000, nextQuestion: 'walls-insulation' },
          { text: 'Autre surface', value: 0, nextQuestion: 'walls-insulation', isCustom: true }
        ]
      },
      {
        id: 'walls-insulation',
        text: 'Type isolation murale ?',
        options: [
          { text: 'Non nécessaire', value: 0, nextQuestion: 'windows' },
          { text: 'ITI (Intérieur 5cm)', value: 1200, nextQuestion: 'windows' },
          { text: 'ITI (Intérieur 10cm)', value: 2000, nextQuestion: 'windows' },
          { text: 'ITE (Extérieur)', value: 3500, nextQuestion: 'windows' }
        ]
      },
      {
        id: 'windows',
        text: 'Nombre de fenêtres à remplacer ?',
        allowCustomValue: true,
        options: [
          { text: '1-3 fenêtres', value: 2000, nextQuestion: 'heating' },
          { text: '4-6 fenêtres', value: 3500, nextQuestion: 'heating' },
          { text: '7-9 fenêtres', value: 5000, nextQuestion: 'heating' },
          { text: '10-12 fenêtres', value: 7000, nextQuestion: 'heating' },
          { text: '> 12 fenêtres', value: 9000, nextQuestion: 'heating' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'heating', isCustom: true }
        ]
      },
      {
        id: 'heating',
        text: 'Puissance nécessaire (kW) ?',
        allowCustomValue: true,
        options: [
          { text: '< 5 kW', value: 4000, nextQuestion: 'ventilation' },
          { text: '5-7 kW', value: 5500, nextQuestion: 'ventilation' },
          { text: '7-10 kW', value: 7500, nextQuestion: 'ventilation' },
          { text: '10-12 kW', value: 9000, nextQuestion: 'ventilation' },
          { text: '> 12 kW', value: 12000, nextQuestion: 'ventilation' },
          { text: 'Autre puissance', value: 0, nextQuestion: 'ventilation', isCustom: true }
        ]
      },
      {
        id: 'ventilation',
        text: 'Type de ventilation ?',
        options: [
          { text: 'Existant OK', value: 0, nextQuestion: 'subsidies' },
          { text: 'VMC simple flux', value: 1500, nextQuestion: 'subsidies' },
          { text: 'VMC double flux standard', value: 3000, nextQuestion: 'subsidies' },
          { text: 'VMC double flux haut débit', value: 4500, nextQuestion: 'subsidies' }
        ]
      },
      {
        id: 'subsidies',
        text: 'Montant des aides souhaité ?',
        allowCustomValue: true,
        options: [
          { text: 'MaPrimeRénov\' (2000-4000€)', value: -3000 },
          { text: 'CEE (1000-3000€)', value: -2000 },
          { text: 'Éco-PTZ', value: -5000 },
          { text: 'Autre montant', value: 0, isCustom: true }
        ]
      }
    ]
  },

  // 4. RÉNOVATION COMPLÈTE
  {
    id: 'full-renovation',
    title: 'Rénovation Complète',
    icon: <Home className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
    questions: [
      {
        id: 'property-type',
        text: 'Type de bien ?',
        options: [
          { text: 'Studio', value: 0, nextQuestion: 'surface' },
          { text: 'Appartement', value: 2000, nextQuestion: 'surface' },
          { text: 'Maison', value: 4000, nextQuestion: 'surface' },
          { text: 'Local commercial', value: 6000, nextQuestion: 'surface' }
        ]
      },
      {
        id: 'surface',
        text: 'Surface totale (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 30m²', value: 10000, nextQuestion: 'state' },
          { text: '30-50m²', value: 15000, nextQuestion: 'state' },
          { text: '50-75m²', value: 22500, nextQuestion: 'state' },
          { text: '75-100m²', value: 30000, nextQuestion: 'state' },
          { text: '100-125m²', value: 40000, nextQuestion: 'state' },
          { text: '> 125m²', value: 50000, nextQuestion: 'state' },
          { text: 'Autre surface', value: 0, nextQuestion: 'state', isCustom: true }
        ]
      },
      {
        id: 'state',
        text: 'État actuel ?',
        options: [
          { text: 'À rafraîchir', value: 3000, nextQuestion: 'electric' },
          { text: 'À restructurer partiellement', value: 10000, nextQuestion: 'electric' },
          { text: 'À restructurer complètement', value: 20000, nextQuestion: 'electric' },
          { text: 'À démolir partiellement', value: 30000, nextQuestion: 'electric' }
        ]
      },
      {
        id: 'electric',
        text: 'Nombre de prises à installer ?',
        allowCustomValue: true,
        options: [
          { text: '1-5 prises', value: 2000, nextQuestion: 'plumbing' },
          { text: '6-10 prises', value: 4000, nextQuestion: 'plumbing' },
          { text: '11-15 prises', value: 6000, nextQuestion: 'plumbing' },
          { text: '16-20 prises', value: 8000, nextQuestion: 'plumbing' },
          { text: '> 20 prises', value: 12000, nextQuestion: 'plumbing' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'plumbing', isCustom: true }
        ]
      },
      {
        id: 'plumbing',
        text: 'Nombre de points d\'eau ?',
        allowCustomValue: true,
        options: [
          { text: '1-2 points', value: 4000, nextQuestion: 'kitchen' },
          { text: '3-4 points', value: 8000, nextQuestion: 'kitchen' },
          { text: '5-6 points', value: 12000, nextQuestion: 'kitchen' },
          { text: '> 6 points', value: 18000, nextQuestion: 'kitchen' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'kitchen', isCustom: true }
        ]
      },
      {
        id: 'kitchen',
        text: 'Surface cuisine (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 6m²', value: 5000, nextQuestion: 'bathroom' },
          { text: '6-8m²', value: 7500, nextQuestion: 'bathroom' },
          { text: '8-10m²', value: 10000, nextQuestion: 'bathroom' },
          { text: '10-12m²', value: 12500, nextQuestion: 'bathroom' },
          { text: '> 12m²', value: 15000, nextQuestion: 'bathroom' },
          { text: 'Autre surface', value: 0, nextQuestion: 'bathroom', isCustom: true }
        ]
      },
      {
        id: 'bathroom',
        text: 'Nombre de salles de bain ?',
        allowCustomValue: true,
        options: [
          { text: '1 salle de bain', value: 8000, nextQuestion: 'floor' },
          { text: '1 SdB + 1 WC', value: 12000, nextQuestion: 'floor' },
          { text: '2 salles de bain', value: 18000, nextQuestion: 'floor' },
          { text: '> 2 salles de bain', value: 25000, nextQuestion: 'floor' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'floor', isCustom: true }
        ]
      },
      {
        id: 'floor',
        text: 'Surface à carreler/parqueter (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 20m²', value: 5000, nextQuestion: 'walls' },
          { text: '20-30m²', value: 7000, nextQuestion: 'walls' },
          { text: '30-40m²', value: 9000, nextQuestion: 'walls' },
          { text: '40-50m²', value: 12000, nextQuestion: 'walls' },
          { text: '> 50m²', value: 15000, nextQuestion: 'walls' },
          { text: 'Autre surface', value: 0, nextQuestion: 'walls', isCustom: true }
        ]
      },
      {
        id: 'walls',
        text: 'Surface murale à traiter (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 40m²', value: 4000, nextQuestion: 'ceiling' },
          { text: '40-50m²', value: 5500, nextQuestion: 'ceiling' },
          { text: '50-60m²', value: 7000, nextQuestion: 'ceiling' },
          { text: '60-70m²', value: 8500, nextQuestion: 'ceiling' },
          { text: '> 70m²', value: 11000, nextQuestion: 'ceiling' },
          { text: 'Autre surface', value: 0, nextQuestion: 'ceiling', isCustom: true }
        ]
      },
      {
        id: 'ceiling',
        text: 'Surface des plafonds (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 30m²', value: 2000, nextQuestion: 'windows' },
          { text: '30-40m²', value: 3000, nextQuestion: 'windows' },
          { text: '40-50m²', value: 4000, nextQuestion: 'windows' },
          { text: '50-60m²', value: 5000, nextQuestion: 'windows' },
          { text: '> 60m²', value: 7000, nextQuestion: 'windows' },
          { text: 'Autre surface', value: 0, nextQuestion: 'windows', isCustom: true }
        ]
      },
      {
        id: 'windows',
        text: 'Nombre de fenêtres ?',
        allowCustomValue: true,
        options: [
          { text: '1-3 fenêtres', value: 5000, nextQuestion: 'thermal' },
          { text: '4-6 fenêtres', value: 9000, nextQuestion: 'thermal' },
          { text: '7-9 fenêtres', value: 12000, nextQuestion: 'thermal' },
          { text: '10-12 fenêtres', value: 16000, nextQuestion: 'thermal' },
          { text: '> 12 fenêtres', value: 20000, nextQuestion: 'thermal' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'thermal', isCustom: true }
        ]
      },
      {
        id: 'thermal',
        text: 'Surface à isoler (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 40m²', value: 8000, nextQuestion: 'heating' },
          { text: '40-50m²', value: 10000, nextQuestion: 'heating' },
          { text: '50-60m²', value: 12000, nextQuestion: 'heating' },
          { text: '60-70m²', value: 15000, nextQuestion: 'heating' },
          { text: '> 70m²', value: 20000, nextQuestion: 'heating' },
          { text: 'Autre surface', value: 0, nextQuestion: 'heating', isCustom: true }
        ]
      },
      {
        id: 'heating',
        text: 'Puissance chauffage (kW) ?',
        allowCustomValue: true,
        options: [
          { text: '< 8 kW', value: 8000, nextQuestion: 'lighting' },
          { text: '8-10 kW', value: 10000, nextQuestion: 'lighting' },
          { text: '10-12 kW', value: 12000, nextQuestion: 'lighting' },
          { text: '12-14 kW', value: 15000, nextQuestion: 'lighting' },
          { text: '> 14 kW', value: 18000, nextQuestion: 'lighting' },
          { text: 'Autre puissance', value: 0, nextQuestion: 'lighting', isCustom: true }
        ]
      },
      {
        id: 'lighting',
        text: 'Nombre de points lumineux ?',
        allowCustomValue: true,
        options: [
          { text: '1-5 points', value: 3000, nextQuestion: 'furniture' },
          { text: '6-10 points', value: 5000, nextQuestion: 'furniture' },
          { text: '11-15 points', value: 7000, nextQuestion: 'furniture' },
          { text: '16-20 points', value: 9000, nextQuestion: 'furniture' },
          { text: '> 20 points', value: 12000, nextQuestion: 'furniture' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'furniture', isCustom: true }
        ]
      },
      {
        id: 'furniture',
        text: 'Budget mobilier sur mesure ?',
        allowCustomValue: true,
        options: [
          { text: '< 3000€', value: 3000 },
          { text: '3000-5000€', value: 5000 },
          { text: '5000-7000€', value: 7000 },
          { text: '7000-10000€', value: 10000 },
          { text: '> 10000€', value: 15000 },
          { text: 'Autre budget', value: 0, isCustom: true }
        ]
      }
    ]
  },

  // 5. ÉLECTRICITÉ
  {
    id: 'electricity',
    title: 'Installation électrique',
    icon: <Lightbulb className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://img.freepik.com/free-photo/male-electrician-works-switchboard-with-electrical-connecting-cable_169016-15090.jpg",
    questions: [
      {
        id: 'scope',
        text: 'Type d\'intervention ?',
        options: [
          { text: 'Dépannage simple', value: 150, nextQuestion: 'panel' },
          { text: 'Ajout de circuits', value: 400, nextQuestion: 'panel' },
          { text: 'Mise aux normes', value: 800, nextQuestion: 'panel' },
          { text: 'Installation neuve', value: 1500, nextQuestion: 'panel' }
        ]
      },
      {
        id: 'panel',
        text: 'Tableau électrique ?',
        options: [
          { text: 'Existant OK', value: 0, nextQuestion: 'outlets' },
          { text: 'Modernisation partielle', value: 300, nextQuestion: 'outlets' },
          { text: 'Modernisation complète', value: 600, nextQuestion: 'outlets' },
          { text: 'Nouvelle installation', value: 1000, nextQuestion: 'outlets' }
        ]
      },
      {
        id: 'outlets',
        text: 'Nombre de prises à installer ?',
        allowCustomValue: true,
        options: [
          { text: '1-3 prises', value: 150, nextQuestion: 'lighting' },
          { text: '4-6 prises', value: 300, nextQuestion: 'lighting' },
          { text: '7-9 prises', value: 450, nextQuestion: 'lighting' },
          { text: '10-12 prises', value: 600, nextQuestion: 'lighting' },
          { text: '> 12 prises', value: 800, nextQuestion: 'lighting' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'lighting', isCustom: true }
        ]
      },
      {
        id: 'lighting',
        text: 'Points lumineux ?',
        allowCustomValue: true,
        options: [
          { text: '1-3 points', value: 150, nextQuestion: 'wiring' },
          { text: '4-6 points', value: 300, nextQuestion: 'wiring' },
          { text: '7-9 points', value: 450, nextQuestion: 'wiring' },
          { text: '10-12 points', value: 600, nextQuestion: 'wiring' },
          { text: '> 12 points', value: 800, nextQuestion: 'wiring' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'wiring', isCustom: true }
        ]
      },
      {
        id: 'wiring',
        text: 'Type de câblage ?',
        options: [
          { text: 'Apparent simple', value: 0, nextQuestion: 'voltage' },
          { text: 'Apparent gainé', value: 150, nextQuestion: 'voltage' },
          { text: 'Encastré simple', value: 250, nextQuestion: 'voltage' },
          { text: 'Encastré complexe', value: 400, nextQuestion: 'voltage' }
        ]
      },
      {
        id: 'voltage',
        text: 'Besoins en puissance ?',
        allowCustomValue: true,
        options: [
          { text: 'Basique (6kVA)', value: 0, nextQuestion: 'automation' },
          { text: 'Standard (9kVA)', value: 200, nextQuestion: 'automation' },
          { text: 'Confort (12kVA)', value: 400, nextQuestion: 'automation' },
          { text: 'Haute puissance (15kVA+)', value: 600, nextQuestion: 'automation' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'automation', isCustom: true }
        ]
      },
      {
        id: 'automation',
        text: 'Domotique ?',
        options: [
          { text: 'Aucune', value: 0, nextQuestion: 'safety' },
          { text: 'Partielle (éclairage)', value: 300, nextQuestion: 'safety' },
          { text: 'Partielle (prises)', value: 500, nextQuestion: 'safety' },
          { text: 'Complète', value: 900, nextQuestion: 'safety' }
        ]
      },
      {
        id: 'safety',
        text: 'Sécurité électrique ?',
        options: [
          { text: 'Standard', value: 0, nextQuestion: 'walls' },
          { text: 'Renforcée', value: 150, nextQuestion: 'walls' },
          { text: 'Haute sécurité', value: 300, nextQuestion: 'walls' },
          { text: 'Protection complète', value: 500, nextQuestion: 'walls' }
        ]
      },
      {
        id: 'walls',
        text: 'Type de murs ?',
        options: [
          { text: 'Plaque de plâtre', value: 0, nextQuestion: 'access' },
          { text: 'Brique/parpaing', value: 100, nextQuestion: 'access' },
          { text: 'Béton armé léger', value: 200, nextQuestion: 'access' },
          { text: 'Béton armé dense', value: 350, nextQuestion: 'access' }
        ]
      },
      {
        id: 'access',
        text: 'Accessibilité ?',
        options: [
          { text: 'Facile', value: 0 },
          { text: 'Passage technique', value: 150 },
          { text: 'Combles/caves', value: 300 },
          { text: 'Locaux techniques', value: 450 }
        ]
      }
    ]
  },

  // 6. PLOMBERIE
  {
    id: 'plumbing',
    title: 'Plomberie & Sanitaire',
    icon: <Droplets className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://images.unsplash.com/photo-1542013936693-884638332954",
    questions: [
      {
        id: 'type',
        text: 'Nature des travaux ?',
        options: [
          { text: 'Réparation simple', value: 150, nextQuestion: 'scope' },
          { text: 'Remplacement équipement', value: 400, nextQuestion: 'scope' },
          { text: 'Rénovation complète', value: 800, nextQuestion: 'scope' },
          { text: 'Installation neuve', value: 1200, nextQuestion: 'scope' }
        ]
      },
      {
        id: 'scope',
        text: 'Éléments concernés ?',
        options: [
          { text: '1 point d\'eau', value: 200, nextQuestion: 'pipes' },
          { text: 'Cuisine', value: 600, nextQuestion: 'pipes' },
          { text: 'Salle de bain', value: 1000, nextQuestion: 'pipes' },
          { text: 'Maison complète', value: 1800, nextQuestion: 'pipes' }
        ]
      },
      {
        id: 'pipes',
        text: 'Type de tuyauterie ?',
        options: [
          { text: 'PVC', value: 0, nextQuestion: 'water' },
          { text: 'PER', value: 150, nextQuestion: 'water' },
          { text: 'Cuivre standard', value: 250, nextQuestion: 'water' },
          { text: 'Cuivre renforcé', value: 400, nextQuestion: 'water' }
        ]
      },
      {
        id: 'water',
        text: 'Alimentation eau chaude ?',
        options: [
          { text: 'Ballon électrique 50L', value: 200, nextQuestion: 'heating' },
          { text: 'Ballon électrique 100L+', value: 400, nextQuestion: 'heating' },
          { text: 'Chaudière gaz standard', value: 600, nextQuestion: 'heating' },
          { text: 'Thermodynamique', value: 900, nextQuestion: 'heating' }
        ]
      },
      {
        id: 'heating',
        text: 'Système de chauffage ?',
        options: [
          { text: 'Aucun', value: 0, nextQuestion: 'fixtures' },
          { text: 'Radiateurs standard', value: 600, nextQuestion: 'fixtures' },
          { text: 'Radiateurs haute performance', value: 1000, nextQuestion: 'fixtures' },
          { text: 'Plancher chauffant', value: 1500, nextQuestion: 'fixtures' }
        ]
      },
      {
        id: 'fixtures',
        text: 'Équipements à installer ?',
        allowCustomValue: true,
        options: [
          { text: 'Lavabo simple', value: 200, nextQuestion: 'sewage' },
          { text: 'Douche standard', value: 400, nextQuestion: 'sewage' },
          { text: 'Baignoire', value: 600, nextQuestion: 'sewage' },
          { text: 'Sanitaire complet', value: 900, nextQuestion: 'sewage' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'sewage', isCustom: true }
        ]
      },
      {
        id: 'sewage',
        text: 'Évacuation des eaux ?',
        options: [
          { text: 'Existante OK', value: 0, nextQuestion: 'insulation' },
          { text: 'Modifications légères', value: 200, nextQuestion: 'insulation' },
          { text: 'Modifications importantes', value: 400, nextQuestion: 'insulation' },
          { text: 'Nouveau réseau', value: 700, nextQuestion: 'insulation' }
        ]
      },
      {
        id: 'insulation',
        text: 'Isolation tuyaux ?',
        options: [
          { text: 'Non nécessaire', value: 0, nextQuestion: 'walls' },
          { text: 'Partielle (points sensibles)', value: 100, nextQuestion: 'walls' },
          { text: 'Standard', value: 200, nextQuestion: 'walls' },
          { text: 'Complète/haute performance', value: 350, nextQuestion: 'walls' }
        ]
      },
      {
        id: 'walls',
        text: 'Type de percement ?',
        options: [
          { text: 'Aucun', value: 0, nextQuestion: 'access' },
          { text: 'Simple (placo)', value: 150, nextQuestion: 'access' },
          { text: 'Moyen (brique)', value: 300, nextQuestion: 'access' },
          { text: 'Complexe (béton armé)', value: 500, nextQuestion: 'access' }
        ]
      },
      {
        id: 'access',
        text: 'Accès technique ?',
        options: [
          { text: 'Facile', value: 0 },
          { text: 'Espace restreint', value: 200 },
          { text: 'Sous-sol/cave', value: 400 },
          { text: 'Accès très difficile', value: 600 }
        ]
      }
    ]
  },

  // 7. CHAUFFAGE & CLIMATISATION
  {
    id: 'heating',
    title: 'Chauffage & Climatisation',
    icon: <Thermometer className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f",
    questions: [
      {
        id: 'system',
        text: 'Type de système ?',
        options: [
          { text: 'Radiateurs électriques', value: 2000, nextQuestion: 'fuel' },
          { text: 'Radiateurs eau chaude', value: 3500, nextQuestion: 'fuel' },
          { text: 'Pompe à chaleur air/air', value: 6000, nextQuestion: 'fuel' },
          { text: 'Pompe à chaleur air/eau', value: 9000, nextQuestion: 'fuel' },
          { text: 'Climatisation réversible', value: 5000, nextQuestion: 'fuel' }
        ]
      },
      {
        id: 'fuel',
        text: 'Énergie utilisée ?',
        options: [
          { text: 'Électrique', value: 0, nextQuestion: 'zones' },
          { text: 'Gaz', value: 800, nextQuestion: 'zones' },
          { text: 'Fioul', value: 500, nextQuestion: 'zones' },
          { text: 'Géothermie', value: 1500, nextQuestion: 'zones' }
        ]
      },
      {
        id: 'zones',
        text: 'Nombre de zones ?',
        allowCustomValue: true,
        options: [
          { text: '1 zone', value: 0, nextQuestion: 'surface' },
          { text: '2 zones', value: 500, nextQuestion: 'surface' },
          { text: '3 zones', value: 800, nextQuestion: 'surface' },
          { text: '4 zones', value: 1100, nextQuestion: 'surface' },
          { text: '> 4 zones', value: 1500, nextQuestion: 'surface' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'surface', isCustom: true }
        ]
      },
      {
        id: 'surface',
        text: 'Surface à chauffer (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 40m²', value: 800, nextQuestion: 'existing' },
          { text: '40-60m²', value: 1200, nextQuestion: 'existing' },
          { text: '60-80m²', value: 1600, nextQuestion: 'existing' },
          { text: '80-100m²', value: 2000, nextQuestion: 'existing' },
          { text: '> 100m²', value: 2500, nextQuestion: 'existing' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'existing', isCustom: true }
        ]
      },
      {
        id: 'existing',
        text: 'Installation existante ?',
        options: [
          { text: 'Nouvelle installation', value: 0, nextQuestion: 'regulation' },
          { text: 'Remplacement partiel', value: -800, nextQuestion: 'regulation' },
          { text: 'Modernisation complète', value: 300, nextQuestion: 'regulation' },
          { text: 'Dépannage', value: -500, nextQuestion: 'regulation' }
        ]
      },
      {
        id: 'regulation',
        text: 'Système de régulation ?',
        options: [
          { text: 'Manuel', value: 0, nextQuestion: 'efficiency' },
          { text: 'Thermostat programmable', value: 200, nextQuestion: 'efficiency' },
          { text: 'Thermostat connecté', value: 400, nextQuestion: 'efficiency' },
          { text: 'Système intelligent', value: 700, nextQuestion: 'efficiency' }
        ]
      },
      {
        id: 'efficiency',
        text: 'Classe énergétique ?',
        options: [
          { text: 'Standard', value: 0, nextQuestion: 'distribution' },
          { text: 'A', value: 300, nextQuestion: 'distribution' },
          { text: 'A+', value: 500, nextQuestion: 'distribution' },
          { text: 'A++ ou mieux', value: 800, nextQuestion: 'distribution' }
        ]
      },
      {
        id: 'distribution',
        text: 'Type de distribution ?',
        options: [
          { text: 'Air', value: 0, nextQuestion: 'installation' },
          { text: 'Eau basse température', value: 200, nextQuestion: 'installation' },
          { text: 'Eau haute température', value: 400, nextQuestion: 'installation' },
          { text: 'Mixte air/eau', value: 600, nextQuestion: 'installation' }
        ]
      },
      {
        id: 'installation',
        text: 'Complexité d\'installation ?',
        options: [
          { text: 'Standard', value: 0, nextQuestion: 'access' },
          { text: 'Technique (gainage)', value: 400, nextQuestion: 'access' },
          { text: 'Très technique (perçage)', value: 800, nextQuestion: 'access' },
          { text: 'Installation complexe', value: 1200, nextQuestion: 'access' }
        ]
      },
      {
        id: 'access',
        text: 'Accès technique ?',
        options: [
          { text: 'Facile', value: 0 },
          { text: 'Toiture/combles', value: 300 },
          { text: 'Sous-sol étroit', value: 500 },
          { text: 'Accès très difficile', value: 800 }
        ]
      }
    ]
  },

  // 8. MENUISERIE
  {
    id: 'joinery',
    title: 'Menuiserie',
    icon: <DoorOpen className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://img.freepik.com/photos-gratuite/ouvrier-du-batiment-poncage-morceau-bois_23-2148748861.jpg?t=st=1744828828~exp=1744832428~hmac=1db971bb10cbeed3fd3744c7401110cd2d138814bedf6e4e514d87546d4ded3d&w=996",
    questions: [
      {
        id: 'type',
        text: 'Type de menuiserie ?',
        options: [
          { text: 'Fenêtre standard', value: 0, nextQuestion: 'material' },
          { text: 'Porte-fenêtre', value: 300, nextQuestion: 'material' },
          { text: 'Porte d\'entrée', value: 500, nextQuestion: 'material' },
          { text: 'Volet battant', value: 400, nextQuestion: 'material' },
          { text: 'Volet roulant', value: 600, nextQuestion: 'material' },
          { text: 'Fenêtre de toit', value: 800, nextQuestion: 'material' }
        ]
      },
      {
        id: 'material',
        text: 'Matériau ?',
        options: [
          { text: 'PVC', value: 0, nextQuestion: 'dimensions' },
          { text: 'Aluminium', value: 300, nextQuestion: 'dimensions' },
          { text: 'Bois', value: 500, nextQuestion: 'dimensions' },
          { text: 'Mixte (bois/aluminium)', value: 400, nextQuestion: 'dimensions' }
        ]
      },
      {
        id: 'dimensions',
        text: 'Dimensions (m²) ?',
        allowCustomValue: true,
        options: [
          { text: '< 1m²', value: 500, nextQuestion: 'glazing' },
          { text: '1-1.5m²', value: 800, nextQuestion: 'glazing' },
          { text: '1.5-2m²', value: 1100, nextQuestion: 'glazing' },
          { text: '2-2.5m²', value: 1400, nextQuestion: 'glazing' },
          { text: '> 2.5m²', value: 1800, nextQuestion: 'glazing' },
          { text: 'Autre dimension', value: 0, nextQuestion: 'glazing', isCustom: true }
        ]
      },
      {
        id: 'glazing',
        text: 'Type de vitrage ?',
        options: [
          { text: 'Simple vitrage', value: 0, nextQuestion: 'thermal' },
          { text: 'Double vitrage standard', value: 300, nextQuestion: 'thermal' },
          { text: 'Double vitrage argon', value: 500, nextQuestion: 'thermal' },
          { text: 'Triple vitrage', value: 800, nextQuestion: 'thermal' }
        ]
      },
      {
        id: 'thermal',
        text: 'Performance thermique ?',
        options: [
          { text: 'Standard', value: 0, nextQuestion: 'opening' },
          { text: 'BBC', value: 200, nextQuestion: 'opening' },
          { text: 'RT2012', value: 400, nextQuestion: 'opening' },
          { text: 'Passive House', value: 600, nextQuestion: 'opening' }
        ]
      },
      {
        id: 'opening',
        text: 'Type d\'ouverture ?',
        options: [
          { text: 'Fixé', value: 0, nextQuestion: 'color' },
          { text: 'Battant', value: 150, nextQuestion: 'color' },
          { text: 'Coulissant', value: 250, nextQuestion: 'color' },
          { text: 'Oscillo-battant', value: 350, nextQuestion: 'color' }
        ]
      },
      {
        id: 'color',
        text: 'Couleur/finition ?',
        options: [
          { text: 'Blanc standard', value: 0, nextQuestion: 'count' },
          { text: 'Couleur unie', value: 150, nextQuestion: 'count' },
          { text: 'Bois naturel', value: 300, nextQuestion: 'count' },
          { text: 'Finition spéciale', value: 450, nextQuestion: 'count' }
        ]
      },
      {
        id: 'count',
        text: 'Nombre d\'éléments ?',
        allowCustomValue: true,
        options: [
          { text: '1 élément', value: 0, nextQuestion: 'installation' },
          { text: '2-3 éléments', value: 200, nextQuestion: 'installation' },
          { text: '4-5 éléments', value: 400, nextQuestion: 'installation' },
          { text: '6-8 éléments', value: 600, nextQuestion: 'installation' },
          { text: '> 8 éléments', value: 900, nextQuestion: 'installation' },
          { text: 'Autre nombre', value: 0, nextQuestion: 'installation', isCustom: true }
        ]
      },
      {
        id: 'installation',
        text: 'Type d\'installation ?',
        options: [
          { text: 'Remplacement simple', value: 0, nextQuestion: 'access' },
          { text: 'Nouvelle ouverture', value: 500, nextQuestion: 'access' },
          { text: 'Démolition/reconstruction', value: 1000, nextQuestion: 'access' },
          { text: 'Sur mesure complexe', value: 1500, nextQuestion: 'access' }
        ]
      },
      {
        id: 'access',
        text: 'Accessibilité ?',
        options: [
          { text: 'Rez-de-chaussée', value: 0 },
          { text: 'Étage facile', value: 200 },
          { text: 'Étage difficile', value: 400 },
          { text: 'Toiture/hauteur', value: 600 }
        ]
      }
    ]
  },

  // 9. SÉCURITÉ & DOMOTIQUE
  {
    id: 'security',
    title: 'Sécurité & Domotique',
    icon: <Shield className="h-8 w-8" strokeWidth={1.5} />,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827",
    questions: [
      {
        id: 'type',
        text: 'Type de système ?',
        options: [
          { text: 'Alarme simple', value: 600, nextQuestion: 'coverage' },
          { text: 'Alarme complète', value: 1200, nextQuestion: 'coverage' },
          { text: 'Vidéosurveillance basique', value: 1000, nextQuestion: 'coverage' },
          { text: 'Vidéosurveillance complète', value: 2000, nextQuestion: 'coverage' },
          { text: 'Système intégré', value: 2500, nextQuestion: 'coverage' }
        ]
      },
      {
        id: 'coverage',
        text: 'Zone à couvrir ?',
        options: [
          { text: '1 entrée', value: 200, nextQuestion: 'devices' },
          { text: 'Appartement', value: 600, nextQuestion: 'devices' },
          { text: 'Maison', value: 1000, nextQuestion: 'devices' },
          { text: 'Propriété complète', value: 1500, nextQuestion: 'devices' }
        ]
      },
      {
        id: 'devices',
        text: 'Nombre de dispositifs ?',
        allowCustomValue: true,
        options: [
          { text: '1-2 éléments', value: 300, nextQuestion: 'connectivity' },
          { text: '3-4 éléments', value: 500, nextQuestion: 'connectivity' },
          { text: '5-6 éléments', value: 700, nextQuestion: 'connectivity' },
          { text: '7-8 éléments', value: 900, nextQuestion: 'connectivity' },
          { text: '> 8 éléments', value: 1200, nextQuestion: 'connectivity' },
          { text: 'Autre valeur', value: 0, nextQuestion: 'connectivity', isCustom: true }
        ]
      },
      {
        id: 'connectivity',
        text: 'Connectivité ?',
        options: [
          { text: 'Autonome', value: 0, nextQuestion: 'monitoring' },
          { text: 'WiFi basique', value: 150, nextQuestion: 'monitoring' },
          { text: 'WiFi sécurisé', value: 300, nextQuestion: 'monitoring' },
          { text: 'Filaire professionnel', value: 500, nextQuestion: 'monitoring' }
        ]
      },
      {
        id: 'monitoring',
        text: 'Surveillance ?',
        options: [
          { text: 'Locale', value: 0, nextQuestion: 'automation' },
          { text: 'Télé surveillance basique', value: 200, nextQuestion: 'automation' },
          { text: 'Télé surveillance avancée', value: 400, nextQuestion: 'automation' },
          { text: 'Centrale professionnelle', value: 700, nextQuestion: 'automation' }
        ]
      },
      {
        id: 'automation',
        text: 'Intégration domotique ?',
        options: [
          { text: 'Aucune', value: 0, nextQuestion: 'security' },
          { text: 'Partielle (éclairage)', value: 300, nextQuestion: 'security' },
          { text: 'Partielle (accès)', value: 500, nextQuestion: 'security' },
          { text: 'Complète', value: 900, nextQuestion: 'security' }
        ]
      },
      {
        id: 'security',
        text: 'Niveau de sécurité ?',
        options: [
          { text: 'Standard', value: 0, nextQuestion: 'redundancy' },
          { text: 'Renforcé', value: 200, nextQuestion: 'redundancy' },
          { text: 'Haute sécurité', value: 400, nextQuestion: 'redundancy' },
          { text: 'Professionnel', value: 700, nextQuestion: 'redundancy' }
        ]
      },
      {
        id: 'redundancy',
        text: 'Système de secours ?',
        options: [
          { text: 'Non', value: 0, nextQuestion: 'installation' },
          { text: 'Batterie 24h', value: 150, nextQuestion: 'installation' },
          { text: 'Batterie 72h', value: 300, nextQuestion: 'installation' },
          { text: 'Double alimentation', value: 500, nextQuestion: 'installation' }
        ]
      },
      {
        id: 'installation',
        text: 'Type d\'installation ?',
        options: [
          { text: 'Autonome', value: 0, nextQuestion: 'access' },
          { text: 'Semi-professionnelle', value: 200, nextQuestion: 'access' },
          { text: 'Professionnelle standard', value: 400, nextQuestion: 'access' },
          { text: 'Professionnelle haut de gamme', value: 700, nextQuestion: 'access' }
        ]
      },
      {
        id: 'access',
        text: 'Accès technique ?',
        options: [
          { text: 'Facile', value: 0 },
          { text: 'Passage de câbles', value: 150 },
          { text: 'Installation moyenne', value: 300 },
          { text: 'Installation complexe', value: 500 }
        ]
      }
    ]
  }
];

function App() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [estimation, setEstimation] = useState<number | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showEstimationModal, setShowEstimationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const reviews: Review[] = [
    {
      name: "Marie L.",
      role: "Rénovation salle de bain",
      content: "Estimation précise et artisan professionnel. Le résultat est magnifique !",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
    },
    {
      name: "Thomas B.",
      role: "Installation électrique",
      content: "Service rapide et efficace. Les prix correspondent parfaitement au devis initial.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
    },
    {
      name: "Sophie M.",
      role: "Peinture appartement",
      content: "Très satisfaite du travail réalisé. Je recommande vivement !",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const handleOptionSelect = (option: Option) => {
    if (option.isCustom) {
      setShowCustomInput(true);
      return;
    }

    if (!currentQuestion) return;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: option.value
    }));

    if (option.nextQuestion) {
      setCurrentQuestion(option.nextQuestion);
      setShowCustomInput(false);
      setCustomValue('');
    } else {
      const total = Object.values(answers).reduce((sum, val) => sum + val, 0) + option.value;
      setEstimation(total);
      setShowQuestionModal(false);
      setShowEstimationModal(true);
    }
  };

  const handleCustomValueSubmit = (nextQuestion: string) => {
    if (!currentQuestion || !customValue) return;

    const numericValue = parseFloat(customValue);
    if (isNaN(numericValue)) return;

    let calculatedValue = 0;
    const currentQuestionData = currentCategory?.questions.find(q => q.id === currentQuestion);
    
    if (currentQuestionData) {
      switch (currentQuestion) {
        case 'surface':
          calculatedValue = numericValue * 25;
          break;
        case 'height':
          calculatedValue = numericValue > 2.5 ? (numericValue - 2.5) * 100 : 0;
          break;
        case 'outlets':
        case 'lighting':
          calculatedValue = numericValue * 50;
          break;
        default:
          calculatedValue = numericValue * 30;
      }
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: calculatedValue
    }));

    setCurrentQuestion(nextQuestion);
    setShowCustomInput(false);
    setCustomValue('');
  };

  const resetEstimation = () => {
    setSelectedCategory(null);
    setCurrentQuestion(null);
    setAnswers({});
    setEstimation(null);
    setShowCustomInput(false);
    setCustomValue('');
    setShowQuestionModal(false);
    setShowEstimationModal(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setCurrentQuestion(category.questions[0].id);
      setShowQuestionModal(true);
    }
  };

  const currentCategory = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const currentQuestionData = currentQuestion && currentCategory 
    ? currentCategory.questions.find(q => q.id === currentQuestion)
    : null;

const renderQuestion = (questionData: Question | null) => {
    if (!questionData) return null;

    return (
      <div className="bg-white rounded-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={resetEstimation}
            className="flex items-center text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux catégories
          </button>
          {currentCategory && (
            <div className="flex items-center">
              {currentCategory.icon}
              <span className="ml-2 font-semibold">{currentCategory.title}</span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-2">{questionData.text}</h3>
          <div className="h-2 bg-gray-100 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ 
                width: `${
                  currentCategory 
                    ? ((currentCategory.questions.findIndex(q => q.id === currentQuestion) + 1) 
                      / currentCategory.questions.length) * 100
                    : 0
                }%` 
              }}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {questionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className={`group relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-300 ${
                option.isCustom 
                  ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                  : 'border-gray-100 hover:border-primary hover:bg-primary/5'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-lg font-medium block">{option.text}</span>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {showCustomInput && (
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium mb-4">Entrez votre valeur personnalisée</h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Votre valeur"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {currentQuestion === 'surface' ? 'm²' : currentQuestion === 'budget' ? '€' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Entrez une valeur numérique pour obtenir une estimation précise
                </p>
              </div>
              <button
                onClick={() => {
                  const option = questionData.options.find(o => o.isCustom);
                  if (option?.nextQuestion) {
                    handleCustomValueSubmit(option.nextQuestion);
                  }
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors whitespace-nowrap"
              >
                Valider
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEstimationComplete = () => (
    <div className="bg-white rounded-2xl p-8 shadow-xl text-center relative">
      <button 
        onClick={() => setShowEstimationModal(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
      
      <div className="mb-8">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-3xl font-bold mb-4">Votre estimation est prête !</h3>
        <p className="text-5xl font-bold text-primary mb-6">{estimation}€</p>
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold mb-2">Cette estimation comprend :</h4>
          <ul className="text-left text-secondary/70 space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              Main d'œuvre qualifiée
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              Matériaux de qualité
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              Garantie décennale
            </li>
          </ul>
        </div>

        <div className="relative mb-6">
          <button
            onClick={() => setShowWarning(!showWarning)}
            className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center justify-center mx-auto"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Voir les informations importantes
          </button>
          
          {showWarning && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-full max-w-md">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
                <p className="text-sm text-yellow-800">
                  Attention : Cette estimation indicative ne tient pas compte des aides financières et peut varier selon les matériaux choisis et l'état réel du bien. Le montant global inclut une marge pour imprévus.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => setShowContactModal(true)}
          className="btn-primary flex items-center justify-center"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Se faire contacter
        </button>
      <button 
  onClick={() => {
    navigate('/trouver-un-pro');
    window.scrollTo(0, 0); // Reset du scroll en haut de page
  }}
  className="btn-secondary flex items-center justify-center"
>
  <Users className="h-5 w-5 mr-2" />
  Trouver un pro
</button>
        <button 
          onClick={resetEstimation} 
          className="text-gray-500 hover:text-gray-700 flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
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
            <div className="flex items-center space-x-3">
              <img 
                src="https://ideogram.ai/assets/image/lossless/response/FQ8FZWJxSlqkC5xyicsGaw" 
                alt="Logo DevisTravauxFacile" 
                className="h-17 w-17 object-contain" 
              />
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="space-y-4">
            <a href="/" className="block text-gray-600 hover:text-primary">Accueil</a>
            <a href="/#estimate" className="block text-gray-600 hover:text-primary">Estimer vos travaux</a>
            <Link to="/demander-un-devis" className="block text-gray-600 hover:text-primary">Demander un devis</Link>
            <Link to="/trouver-un-pro" className="block text-gray-600 hover:text-primary">Trouver un pro</Link>
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
              <a href="/#estimate" className="text-gray-800 hover:text-primary transition-colors px-3">Estimer vos travaux</a>
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

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {renderQuestion(currentQuestionData)}
          </div>
        </div>
      )}

      {/* Estimation Modal */}
      {showEstimationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {renderEstimationComplete()}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          projectType={selectedCategory ? categories.find(c => c.id === selectedCategory)?.title || '' : ''}
          estimatedBudget={estimation || 0}
        />
      )}

      {/* Hero Section */}
      <section className="relative py-16 bg-dark overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://png.pngtree.com/thumb_back/fw800/background/20230831/pngtree-construction-drawings-showing-house-model-tools-image_13176097.jpg"
            alt="Rénovation intérieure"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Estimez vos travaux en <span className="text-primary">quelques clics</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Une solution <span className="font-semibold">Aximotravo</span> pour obtenir une estimation précise et instantanée de vos projets de rénovation
            </p>
            <div className="flex items-center mb-8">
              <img 
                src="https://www.aximotravo.com/wp-content/uploads/2022/11/logo-aximotravo-site.png" 
                alt="Aximotravo" 
                className="h-12 mr-4 bg-white/90 p-1 rounded"
              />
              <span className="text-white/80 text-sm">Propulsé par Aximotravo</span>
            </div>
            <a href="#estimate" className="btn-primary inline-flex items-center">
              Commencer l'estimation
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

 {/* About Section - Avec titres rouges */}
<section id="about" className="py-16 md:py-24 bg-white overflow-hidden">
  <div className="container-custom">
    <div className="relative">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
        {/* Colonne de gauche - Texte */}
        <div className="relative z-10">
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium mb-6 border border-gray-200">
            <Info className="h-4 w-4 mr-2 text-primary" />
            À propos de nous
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-gray-900">
            L'expertise <span className="text-primary">DevisTravauxFacile</span>
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-5 p-5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Estimation intelligente</h3>
                <p className="text-gray-600 leading-relaxed">Notre technologie analyse 50+ paramètres pour vous fournir une estimation au plus près de la réalité du marché.</p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Réseau certifié</h3>
                <p className="text-gray-600 leading-relaxed">Nous sélectionnons seulement les 15% meilleurs artisans après vérification de leurs références et assurances.</p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
             <h3 className="text-xl font-semibold mb-3 text-primary">Garantie décennale</h3>
<p className="text-gray-600 leading-relaxed">
  Tous nos artisans sont couverts par les garanties légales avec vérification régulière de leurs assurances.
</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <a href="#estimate" className="btn-primary inline-flex items-center px-8 py-3.5 rounded-lg hover:shadow-md transition-all">
              Commencer mon estimation
              <ArrowRight className="ml-3 h-5 w-5" />
            </a>
            
            <div className="flex items-center">
              <div className="flex -space-x-3 mr-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                   <img 
                      src={[
                        'https://img.freepik.com/photos-gratuite/confiant-entrepreneur-regardant-camera-bras-croises-souriant_1098-18840.jpg',
                        'https://img.freepik.com/photos-gratuite/smiley-homme-portant-chemise-blanche-coup-moyen_23-2149345111.jpg',
                        'https://img.freepik.com/photos-gratuite/coup-taille-femme-elegante-charmante-enthousiaste-charmante-portant-lunettes-soleil-mode-haut-raye_176420-31350.jpg'
                      ][i-1]} 
                      alt="Client satisfait" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/48'; // Fallback image
                      }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-medium text-gray-900">+350 clients</p>
                <p className="text-sm text-gray-500">ont choisi la sérénité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de droite - Image et stats */}
        <div className="relative h-full mt-8 lg:mt-0">
          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full min-h-[400px] md:min-h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
              alt="Chantier de rénovation professionnel" 
              className="w-full h-full object-cover absolute inset-0"
              loading="lazy"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent"></div>
            
            {/* Stats card - Version responsive */}
            <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 bg-white/90 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="grid grid-cols-3 gap-2 md:gap-0 md:divide-x divide-gray-200">
                {[
                  { value: '98%', label: 'Satisfaction' },
                  { value: '400+', label: 'Devis' },
                  { value: '50+', label: 'Experts' }
                ].map((stat, i) => (
                  <div key={i} className="px-2 md:px-4 text-center">
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 whitespace-nowrap">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Partner badge */}
            <div className="absolute top-4 md:top-6 right-4 md:right-6 bg-white rounded-lg shadow-xs px-3 py-1.5 md:px-4 md:py-2.5 flex items-center">
              <span className="text-xs md:text-sm text-gray-500 mr-2">Une solution</span>
              <img 
                src="https://www.aximotravo.com/wp-content/uploads/2022/11/logo-aximotravo-site.png" 
                alt="Aximotravo" 
                className="h-4 md:h-5"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Estimate Section */}
<section id="estimate" className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
  {/* Nouveaux éléments décoratifs plus subtils */}
  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-20" />
  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/10 to-transparent opacity-20" />
  
  <div className="container-custom relative z-10">
    <div className="text-center mb-16">
      <span className="inline-flex items-center px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 shadow-sm">
        <Calculator className="h-5 w-5 mr-2" />
        Estimation Gratuite
      </span>
    <h2 className="text-4xl md:text-5xl font-bold mb-6">
  Estimez vos travaux en{" "}
  <span className="text-primary whitespace-nowrap">2 minutes</span>   
</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        {!selectedCategory 
          ? 'Commencez par sélectionner votre type de projet' 
          : !estimation 
            ? 'Répondez à quelques questions simples pour une estimation personnalisée' 
            : 'Votre estimation détaillée'}
      </p>
    </div>

    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="group relative block text-left overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/30 to-transparent" />
            </div>
            
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="h-14 w-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 transition-all group-hover:bg-primary/90 group-hover:shadow-lg">
                {React.cloneElement(category.icon as React.ReactElement, {
                  className: "h-6 w-6 text-white transition-colors group-hover:text-white"
                })}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
              <div className="flex items-center text-white/90">
                <ArrowRight className="h-5 w-5 mr-2 opacity-0 group-hover:opacity-100 transition-all" />
                <span className="group-hover:underline">Commencer l'estimation</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Indicateur de progression pour les étapes suivantes */}
    {selectedCategory && (
      <div className="mt-16 max-w-2xl mx-auto">
        <div className="flex items-center">
          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: estimation ? '100%' : '33%' }}
            />
          </div>
          <div className="ml-4 text-sm font-medium text-gray-600">
            {estimation ? 'Étape 3/3' : 'Étape 1/3'}
          </div>
        </div>
      </div>
    )}
  </div>
</section>
     {/* Estimation Section */}
<section id="estimate" className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
  <div className="container-custom">
    <div className="text-center mb-16">
      <div className="inline-flex items-center justify-center px-6 py-2 bg-primary/10 rounded-full text-primary font-medium mb-4">
        <Calculator className="h-5 w-5 mr-2" />
        Estimation gratuite
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Estimez le coût de vos travaux</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Répondez à quelques questions simples pour obtenir une estimation personnalisée
      </p>
    </div>

    {!selectedCategory ? (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-left flex flex-col h-full"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold">{category.title}</h3>
            </div>
            <div className="mt-auto pt-4">
              <div className="h-48 rounded-lg overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    ) : (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Retour aux catégories
          </button>
          
          <div className="flex items-center">
            <div className="w-48 md:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 estimation-progress-bar"
                style={{ width: estimation ? '100%' : '33%' }}
              />
            </div>
            <div className="ml-4 text-sm font-medium text-gray-600">
              {estimation ? 'Étape 3/3' : 'Étape 1/3'}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</section>
     {/* Reviews Section */}
<section id="reviews" className="py-20 bg-gradient-to-b from-white to-gray-50">
  <div className="container-custom">
    <div className="text-center mb-16">
      <div className="inline-flex items-center justify-center px-6 py-2 bg-primary/10 rounded-full text-primary font-medium mb-4">
        <Star className="h-5 w-5 mr-2 fill-current" />
        Témoignages
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos clients parlent de nous</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Découvrez les expériences authentiques de ceux qui nous ont fait confiance
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
        >
          {/* Élément décoratif */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10"></div>
          
          <div className="flex items-center mb-6 relative z-10">
            <img
              src={review.image}
              alt={review.name}
              className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
            />
            <div>
              <h3 className="font-semibold text-lg">{review.name}</h3>
              <p className="text-gray-600 text-sm">{review.role}</p>
            </div>
          </div>
          
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`} 
              />
            ))}
          </div>
          
          <p className="text-gray-700 mb-6 relative z-10">"{review.content}"</p>
          
          <div className="text-primary text-sm font-medium flex items-center">
          
          </div>
        </div>
      ))}
    </div>

 
  </div>
</section>
      {/* Footer */}
<Footer />
    </div>
  );
}

export default App;