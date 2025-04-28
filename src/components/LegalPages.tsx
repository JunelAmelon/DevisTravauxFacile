
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';

const legalContent = {
  mentions: {
    title: "Mentions Légales",
    content: [
      {
        title: "1. Informations légales",
        text: `
DevisTravauxFacile est une marque de la société Aximotravo
Société par actions simplifiée (SAS) au capital de 5 000,00 euros
Siège social : le Cetir ZA Pic Pyrénées Innovation 4B Route de Toulouse 65150 Saint-Laurent-de-Neste
SIREN : 815 247 812 R.C.S. Tarbes
Directeur de la publication : Junel BOKO ASSOGBA
Contact : junel.dev@aximotravo.com
        `
      },
      {
        title: "2. Hébergement",
        text: `
Le site DevisTravauxFacile est hébergé par :
LWS - Linux Web Services
10 Rue de Penthièvre
75008 Paris, France
SIREN : 450453881 RCS Paris
Téléphone : +33 1 77 62 30 03
        `
      },
      {
        title: "3. Propriété intellectuelle",
        text: `
L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est protégé par le droit d'auteur. Toute reproduction, même partielle, est soumise à notre autorisation préalable.
        `
      }
    ]
  },
  confidentialite: {
    title: "Politique de Confidentialité",
    content: [
      {
        title: "1. Collecte des données",
        text: `
Nous collectons les données suivantes :
- Informations d'identification (nom, prénom, email)
- Coordonnées de contact
- Informations relatives aux projets de travaux
- Données de navigation
        `
      },
      {
        title: "2. Utilisation des données",
        text: `
Vos données sont utilisées pour :
- Traiter vos demandes de devis
- Vous mettre en relation avec des professionnels
- Améliorer nos services
- Vous envoyer des communications relatives à vos projets
        `
      },
      {
        title: "3. Protection des données",
        text: `
Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès, modification, divulgation ou destruction non autorisée.
        `
      },
      {
        title: "4. Vos droits",
        text: `
Conformément au RGPD, vous disposez des droits suivants :
- Droit d'accès
- Droit de rectification
- Droit à l'effacement
- Droit à la limitation du traitement
- Droit à la portabilité
- Droit d'opposition
        `
      }
    ]
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    content: [
      {
        title: "1. Objet",
        text: `
Les présentes CGU définissent les modalités d'utilisation du service DevisTravauxFacile, plateforme de mise en relation entre particuliers et professionnels du bâtiment.
        `
      },
      {
        title: "2. Services proposés",
        text: `
DevisTravauxFacile propose :
- Estimation de travaux en ligne
- Mise en relation avec des professionnels qualifiés
- Demande de devis personnalisés
- Conseils et accompagnement de projets
        `
      },
      {
        title: "3. Responsabilités",
        text: `
DevisTravauxFacile agit comme intermédiaire et ne peut être tenu responsable :
- De la qualité des travaux réalisés
- Des relations contractuelles entre clients et professionnels
- Des litiges éventuels
        `
      },
      {
        title: "4. Engagements des utilisateurs",
        text: `
Les utilisateurs s'engagent à :
- Fournir des informations exactes
- Utiliser le service de manière loyale
- Respecter les droits des autres utilisateurs
- Ne pas détourner le service de sa finalité
        `
      }
    ]
  }
};

export default function LegalPages() {
  const { page } = useParams<{ page: 'mentions' | 'confidentialite' | 'cgu' }>();
  const content = page ? legalContent[page] : null;

  if (!content) {
    return <div>Page non trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white py-6 border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="https://ideogram.ai/assets/image/lossless/response/FQ8FZWJxSlqkC5xyicsGaw" 
                alt="Logo DevisTravauxFacile" 
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl font-bold">DevisTravauxFacile</span>
            </Link>
            <Link to="/" className="flex items-center text-gray-600 hover:text-primary">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-8">{content.title}</h1>
            
            <div className="space-y-8">
              {content.content.map((section, index) => (
                <section key={index} className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                  <div className="text-gray-600 whitespace-pre-line">
                    {section.text}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

