import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle, Send, Eye, Trash2 } from "lucide-react";
import { useDocuments } from "../context/DocumentContext";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { documents, setDocuments, userEmail } = useDocuments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [userEmail]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/documents/user/${userEmail}`
      );
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(`${API_URL}/api/documents/${documentId}`);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "sent":
        return <Send className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Document Dashboard</h1>
        <Link
          to="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>New Document</span>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by uploading your first document for signing.
          </p>
          <Link
            to="/upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {document.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created{" "}
                      {new Date(document.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(document.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        document.status
                      )}`}
                    >
                      {document.status.charAt(0).toUpperCase() +
                        document.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/document/${document.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Document"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {document.recipients && document.recipients.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Recipients:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {document.recipients.map((recipient, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs ${
                          recipient.status === "signed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {recipient.name} ({recipient.email})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
