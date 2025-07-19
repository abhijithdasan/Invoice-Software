import React, { useState } from 'react';
import Login from './components/Login'; 
import InvoicePage from './components/StJohnsInvoiceSystem';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <InvoicePage />
      ) : (
        <Login onLogin={() => setIsAuthenticated(true)} />
      )}
    </>
  );
};

export default App;
