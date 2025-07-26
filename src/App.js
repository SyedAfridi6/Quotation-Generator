import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import QuotationCalculator from './components/core/QuotationCalculator';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <QuotationCalculator />
      </div>
    </HelmetProvider>
  );
}

export default App;
