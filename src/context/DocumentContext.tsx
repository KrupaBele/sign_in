import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Document {
  id: string;
  title: string;
  originalUrl: string;
  signedUrl?: string;
  status: 'draft' | 'sent' | 'completed';
  signatures: any[];
  recipients: any[];
  createdAt: string;
  note?: string;
}

interface DocumentContextType {
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
  currentDocument: Document | null;
  setCurrentDocument: (document: Document | null) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [userEmail, setUserEmail] = useState('user@example.com');

  const value = {
    documents,
    setDocuments,
    currentDocument,
    setCurrentDocument,
    userEmail,
    setUserEmail
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};