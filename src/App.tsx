import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import DocumentPreview from './components/DocumentPreview';
import SigningPage from './components/SigningPage';
import Header from './components/Header';
import { DocumentProvider } from './context/DocumentContext';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<DocumentUpload />} />
              <Route path="/document/:id" element={<DocumentPreview />} />
              <Route path="/sign/:documentId/:email" element={<SigningPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DocumentProvider>
  );
}

export default App;