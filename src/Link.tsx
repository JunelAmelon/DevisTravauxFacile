import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import QuoteRequest from './components/QuoteRequest';

const Root: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/demander-un-devis" element={<QuoteRequest />} />
      </Routes>
    </Router>
  );
};

export default Root;