// import React from 'react'; // Not needed in React 17+ with JSX transform
import { Link } from 'react-router-dom';
import { Home, UserCheck, FileText, Mail, Phone, ShieldCheck, ScrollText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-800 footer-minheight">
      <div className="container-custom py-14">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-12">
          {/* Logo & Nom */}
          <div className="flex flex-col items-center space-y-3 text-center w-full max-w-xs mx-auto">
            <img 
              src="https://ideogram.ai/assets/image/lossless/response/FQ8FZWJxSlqkC5xyicsGaw" 
              alt="Logo DevisTravauxFacile" 
              className="h-16 w-16 object-contain rounded-2xl border-4 border-white shadow-lg bg-white/20 mx-auto"
            />
             <p className="text-white/80 text-sm mt-1">La plateforme simple et rapide pour estimer vos travaux et trouver un professionnel de confiance.</p>
          </div>
          {/* Liens principaux */}
          <div className="flex flex-col items-center space-y-4">
            {/* Bouton Estimation intelligent */}
<button
  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-semibold text-lg shadow transition-all"
  onClick={() => {
    if (window.location.pathname === '/') {
      const section = document.getElementById('estimate');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#estimate';
    }
  }}
>
  <Home className="w-5 h-5" /> Estimation
</button>
            <Link to="/trouver-un-pro" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-semibold text-lg shadow transition-all"><UserCheck className="w-5 h-5" /> Trouver un Pro</Link>
            <Link to="/demander-un-devis" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-semibold text-lg shadow transition-all"><FileText className="w-5 h-5" /> Demander un Devis</Link>
          </div>
          {/* Liens légaux */}
          <div className="flex flex-col items-center space-y-4">
            <Link to="/legal/mentions" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-semibold text-base shadow transition-all"><ScrollText className="w-5 h-5" /> Mentions légales</Link>
            <Link to="/legal/confidentialite" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-semibold text-base shadow transition-all"><ShieldCheck className="w-5 h-5" /> Confidentialité</Link>
            <Link to="/legal/cgu" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-semibold text-base shadow transition-all"><FileText className="w-5 h-5" /> CGU</Link>
          </div>
          {/* Contact Aximotravo */}
          <div className="flex flex-col items-center space-y-2 text-center max-w-xs mx-auto">
              <a href="mailto:contact@aximotravo.com" aria-label="Envoyer un email à contact@aximotravo.com" className="flex items-center gap-2 justify-center px-5 py-2 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-medium text-sm shadow transition-all mt-1"><Mail className="w-5 h-5" /> contact@aximotravo.com</a>
            <a href="tel:+33177623003" aria-label="Appeler le 01 77 62 30 03" className="flex items-center gap-2 justify-center px-5 py-2 rounded-xl bg-white/10 hover:bg-primary hover:text-white font-medium text-sm shadow transition-all"><Phone className="w-5 h-5" /> 01 77 62 30 03</a>
          </div>
        </div>
        <div className="border-t border-white/30 mt-12 pt-6 text-center text-sm text-white/80">
          © {new Date().getFullYear()} <span className="font-semibold">DevisTravauxFacile</span>. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}