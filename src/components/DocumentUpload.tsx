import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import axios from 'axios';

const DocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const { userEmail } = useDocuments();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      alert('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', title);
      formData.append('ownerEmail', userEmail);
      formData.append('note', note);

      const response = await axios.post('http://localhost:3001/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        navigate(`/document/${response.data.document.id}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h1>
        
        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            {file ? (
              <div className="flex items-center justify-center space-x-4">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your PDF here, or{' '}
                  <label className="text-blue-600 cursor-pointer hover:text-blue-700">
                    browse
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) handleFileSelect(selectedFile);
                      }}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">Only PDF files are supported</p>
              </div>
            )}
          </div>

          {/* Document Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a note for recipients..."
              />
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || !title || uploading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;