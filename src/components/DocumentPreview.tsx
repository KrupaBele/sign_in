// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Send,
//   Download,
//   Plus,
//   X,
//   FileText,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
// } from "lucide-react";
// import { Document, Page, pdfjs } from "react-pdf";
// import SignatureCanvas from "./SignatureCanvas";
// import { useDocuments } from "../context/DocumentContext";
// import axios from "axios";

// // Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// interface Recipient {
//   name: string;
//   email: string;
//   status: "pending" | "sent" | "signed";
// }

// const DocumentPreview = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentDocument, setCurrentDocument, userEmail } = useDocuments();
//   const [loading, setLoading] = useState(true);
//   const [showSignature, setShowSignature] = useState(false);
//   const [signaturePosition, setSignaturePosition] = useState({
//     x: 0,
//     y: 0,
//     page: 0,
//   });
//   const [recipients, setRecipients] = useState<Recipient[]>([]);
//   const [newRecipient, setNewRecipient] = useState({ name: "", email: "" });
//   const [sendMessage, setSendMessage] = useState("");
//   const [sending, setSending] = useState(false);
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pdfError, setPdfError] = useState(false);
//   const [zoom, setZoom] = useState(1.0);
//   const baseWidth = 600; // Base width for coordinate calculations

//   useEffect(() => {
//     if (id) {
//       fetchDocument(id);
//     }
//   }, [id]);

//   const fetchDocument = async (documentId: string) => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/documents/${documentId}`
//       );
//       setCurrentDocument(response.data);
//       setRecipients(response.data.recipients || []);
//     } catch (error) {
//       console.error("Failed to fetch document:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//     setPdfError(false);
//   };

//   const onDocumentLoadError = (error: any) => {
//     console.error("PDF load error:", error);
//     setPdfError(true);
//   };

//   const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
//     if (showSignature) return;

//     const pageElement = e.currentTarget;
//     const rect = pageElement.getBoundingClientRect();

//     // Get the actual click position relative to the page element
//     const clickX = e.clientX - rect.left;
//     const clickY = e.clientY - rect.top;

//     // Convert to base coordinates by dividing by zoom level
//     // This normalizes the coordinates to what they would be at 100% zoom
//     const x = clickX / zoom;
//     const y = clickY / zoom;

//     console.log("Click position:", {
//       clickX,
//       clickY,
//       zoom,
//       normalizedX: x,
//       normalizedY: y,
//       page: pageNumber - 1,
//     });

//     setSignaturePosition({ x, y, page: pageNumber - 1 });
//     setShowSignature(true);
//   };

//   const handleSignatureComplete = async (signatureData: string) => {
//     if (!currentDocument) return;

//     console.log("Adding signature at position:", signaturePosition);
//     console.log("Signature data length:", signatureData.length);

//     try {
//       const response = await axios.post(
//         `${API_URL}/api/signatures/${currentDocument._id}/sign`,
//         {
//           signerEmail: userEmail,
//           signerName: "Document Owner",
//           signatureData,
//           position: signaturePosition,
//         }
//       );

//       if (response.data.success) {
//         setCurrentDocument(response.data.document);
//         setShowSignature(false);

//         // Refresh the document to show updated status
//         if (id) {
//           fetchDocument(id);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to add signature:", error);
//       alert("Failed to add signature");
//     }
//   };

//   const handleZoomIn = () => {
//     setZoom((prev) => Math.min(prev + 0.25, 3.0));
//   };

//   const handleZoomOut = () => {
//     setZoom((prev) => Math.max(prev - 0.25, 0.5));
//   };

//   const handleResetZoom = () => {
//     setZoom(1.0);
//   };

//   const addRecipient = () => {
//     if (newRecipient.name && newRecipient.email) {
//       setRecipients([...recipients, { ...newRecipient, status: "pending" }]);
//       setNewRecipient({ name: "", email: "" });
//     }
//   };

//   const removeRecipient = (index: number) => {
//     setRecipients(recipients.filter((_, i) => i !== index));
//   };

//   const sendForSignature = async () => {
//     if (recipients.length === 0) {
//       alert("Please add at least one recipient");
//       return;
//     }

//     setSending(true);
//     try {
//       // Update document with recipients
//       await axios.put(
//         `${API_URL}/api/documents/${currentDocument?._id}/recipients`,
//         {
//           recipients,
//         }
//       );

//       // Send emails
//       await axios.post(
//         `${API_URL}/api/email/send/${currentDocument?._id}`,
//         {
//           recipients,
//           message: sendMessage,
//         }
//       );

//       alert("Document sent successfully!");
//       navigate("/");
//     } catch (error) {
//       console.error("Failed to send document:", error);
//       alert("Failed to send document");
//     } finally {
//       setSending(false);
//     }
//   };

//   const downloadDocument = () => {
//     if (currentDocument?.status === "completed" && currentDocument?.signedUrl) {
//       console.log("Downloading signed PDF via server route");
//       window.open(
//         `${API_URL}/api/documents/download/${currentDocument._id}`,
//         "_blank"
//       );
//     } else if (currentDocument?.originalUrl) {
//       console.log("Downloading original PDF:", currentDocument.originalUrl);
//       window.open(currentDocument.originalUrl, "_blank");
//     } else {
//       alert("No document available for download");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!currentDocument) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-red-500">Document not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* Document Preview */}
//       <div className="lg:col-span-2">
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-900">
//               {currentDocument.title}
//             </h2>
//             <div className="flex items-center space-x-2">
//               {/* Zoom Controls */}
//               <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
//                 <button
//                   onClick={handleZoomOut}
//                   disabled={zoom <= 0.5}
//                   className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
//                   title="Zoom Out"
//                 >
//                   <ZoomOut className="h-4 w-4" />
//                 </button>
//                 <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
//                   {Math.round(zoom * 100)}%
//                 </span>
//                 <button
//                   onClick={handleZoomIn}
//                   disabled={zoom >= 3.0}
//                   className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
//                   title="Zoom In"
//                 >
//                   <ZoomIn className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={handleResetZoom}
//                   className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
//                   title="Reset Zoom"
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//               </div>

//               <button
//                 onClick={downloadDocument}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
//               >
//                 <Download className="h-4 w-4" />
//                 <span>Download</span>
//               </button>
//             </div>
//           </div>

//           {/* PDF Preview - Scrollable Pages */}
//           <div className="border rounded-lg overflow-hidden bg-gray-100">
//             {pdfError ? (
//               <div className="w-full h-96 flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600 mb-4">
//                     Unable to preview PDF. Click below to view in new tab.
//                   </p>
//                   <button
//                     onClick={() =>
//                       window.open(currentDocument.originalUrl, "_blank")
//                     }
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Open PDF
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="max-h-[800px] overflow-y-auto">
//                 <Document
//                   file={currentDocument.originalUrl}
//                   onLoadSuccess={onDocumentLoadSuccess}
//                   onLoadError={onDocumentLoadError}
//                   loading={
//                     <div className="w-full h-96 flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     </div>
//                   }
//                 >
//                   {Array.from(new Array(numPages), (el, index) => (
//                     <div
//                       key={`page_${index + 1}`}
//                       className="relative mb-4 last:mb-0"
//                     >
//                       <div
//                         className="relative cursor-crosshair border border-gray-200 bg-white"
//                         onClick={(e) => handlePageClick(e, index + 1)}
//                       >
//                         <Page
//                           pageNumber={index + 1}
//                           width={baseWidth * zoom}
//                           scale={1.0}
//                           renderTextLayer={false}
//                           renderAnnotationLayer={false}
//                         />

//                         {/* Page number indicator */}
//                         <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
//                           Page {index + 1}
//                         </div>

//                         {/* Existing signatures overlay for this page */}
//                         {currentDocument.signatures
//                           ?.filter((sig: any) => sig.position?.page === index)
//                           .map((signature: any, sigIndex: number) => (
//                             <div
//                               key={sigIndex}
//                               className="absolute pointer-events-none border-2 border-blue-300 bg-blue-50 rounded p-1"
//                               style={{
//                                 left: signature.position.x * zoom - 60 * zoom,
//                                 top: signature.position.y * zoom - 20 * zoom,
//                                 width: `${120 * zoom}px`,
//                                 height: `${40 * zoom}px`,
//                               }}
//                             >
//                               <img
//                                 src={signature.signatureData}
//                                 alt="Signature"
//                                 className="w-full h-full object-contain"
//                               />
//                               <p className="text-xs text-blue-700 text-center mt-1 leading-none">
//                                 {signature.signerName}
//                               </p>
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   ))}
//                 </Document>
//               </div>
//             )}

//             {/* Signature Overlay */}
//             {showSignature && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-medium">Add Your Signature</h3>
//                     <button
//                       onClick={() => setShowSignature(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <SignatureCanvas
//                     onSignatureComplete={handleSignatureComplete}
//                     onCancel={() => setShowSignature(false)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//             <p className="text-sm text-blue-700 font-medium mb-2">
//               How to sign:
//             </p>
//             <ol className="text-sm text-blue-600 space-y-1">
//               <li>
//                 1. Scroll through the document to find where you want to sign
//               </li>
//               <li>
//                 2. Click anywhere on any page where you want to place your
//                 signature
//               </li>
//               <li>3. Draw your signature in the popup canvas</li>
//               <li>4. Click "Sign Document" to save your signature</li>
//               <li>
//                 5. The signature will appear at the exact position you clicked
//               </li>
//             </ol>
//           </div>
//         </div>
//       </div>

//       {/* Recipients Panel */}
//       <div className="space-y-6">
//         {/* Add Recipients */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Recipients</h3>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={newRecipient.name}
//                 onChange={(e) =>
//                   setNewRecipient({ ...newRecipient, name: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Recipient name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={newRecipient.email}
//                 onChange={(e) =>
//                   setNewRecipient({ ...newRecipient, email: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="recipient@example.com"
//               />
//             </div>

//             <button
//               onClick={addRecipient}
//               disabled={!newRecipient.name || !newRecipient.email}
//               className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
//             >
//               <Plus className="h-4 w-4" />
//               <span>Add Recipient</span>
//             </button>
//           </div>

//           {/* Recipients List */}
//           {recipients.length > 0 && (
//             <div className="mt-6 space-y-2">
//               <h4 className="text-sm font-medium text-gray-700">
//                 Added Recipients:
//               </h4>
//               {recipients.map((recipient, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
//                 >
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {recipient.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{recipient.email}</p>
//                   </div>
//                   <button
//                     onClick={() => removeRecipient(index)}
//                     className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Send Message */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">
//             Message to Recipients
//           </h3>
//           <textarea
//             value={sendMessage}
//             onChange={(e) => setSendMessage(e.target.value)}
//             rows={4}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//             placeholder="Please review and sign this document..."
//           />
//         </div>

//         {/* Send Button */}
//         <button
//           onClick={sendForSignature}
//           disabled={recipients.length === 0 || sending}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
//         >
//           {sending ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               <span>Sending...</span>
//             </>
//           ) : (
//             <>
//               <Send className="h-4 w-4" />
//               <span>Send for Signature</span>
//             </>
//           )}
//         </button>

//         {/* Document Info */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">
//             Document Info
//           </h3>
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Status:</span>
//               <span
//                 className={`font-medium ${
//                   currentDocument.status === "completed"
//                     ? "text-green-600"
//                     : currentDocument.status === "sent"
//                     ? "text-blue-600"
//                     : "text-yellow-600"
//                 }`}
//               >
//                 {currentDocument.status.charAt(0).toUpperCase() +
//                   currentDocument.status.slice(1)}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Created:</span>
//               <span className="text-gray-900">
//                 {new Date(currentDocument.createdAt).toLocaleDateString()}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Signatures:</span>
//               <span className="text-gray-900">
//                 {currentDocument.signatures?.length || 0}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Pages:</span>
//               <span className="text-gray-900">{numPages}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Send,
//   Download,
//   Plus,
//   X,
//   FileText,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
// } from "lucide-react";
// import { Document, Page, pdfjs } from "react-pdf";
// import SignatureCanvas from "./SignatureCanvas";
// import { useDocuments } from "../context/DocumentContext";
// import axios from "axios";

// // Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// interface Recipient {
//   name: string;
//   email: string;
//   status: "pending" | "sent" | "signed";
// }

// const DocumentPreview = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentDocument, setCurrentDocument, userEmail } = useDocuments();
//   const [loading, setLoading] = useState(true);
//   const [showSignature, setShowSignature] = useState(false);
//   const [signaturePosition, setSignaturePosition] = useState({
//     x: 0,
//     y: 0,
//     page: 0,
//   });
//   const [placeholderMode, setPlaceholderMode] = useState(false);
//   const [placeholders, setPlaceholders] = useState<
//     Array<{ x: number; y: number; page: number; recipientEmail?: string }>
//   >([]);
//   const [recipients, setRecipients] = useState<Recipient[]>([]);
//   const [newRecipient, setNewRecipient] = useState({ name: "", email: "" });
//   const [sendMessage, setSendMessage] = useState("");
//   const [sending, setSending] = useState(false);
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pdfError, setPdfError] = useState(false);
//   const [zoom, setZoom] = useState(1.0);
//   const baseWidth = 600; // Base width for coordinate calculations

//   useEffect(() => {
//     if (id) {
//       fetchDocument(id);
//     }
//   }, [id]);

//   const fetchDocument = async (documentId: string) => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/documents/${documentId}`
//       );
//       setCurrentDocument(response.data);
//       setRecipients(response.data.recipients || []);
//       setPlaceholders(response.data.placeholders || []);
//     } catch (error) {
//       console.error("Failed to fetch document:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//     setPdfError(false);
//   };

//   const onDocumentLoadError = (error: any) => {
//     console.error("PDF load error:", error);
//     setPdfError(true);
//   };

//   const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
//     if (showSignature) return;

//     if (placeholderMode) {
//       // Add placeholder mode
//       const pageElement = e.currentTarget;
//       const rect = pageElement.getBoundingClientRect();

//       const clickX = e.clientX - rect.left;
//       const clickY = e.clientY - rect.top;

//       const x = clickX / zoom;
//       const y = clickY / zoom;

//       const newPlaceholder = { x, y, page: pageNumber - 1 };
//       setPlaceholders([...placeholders, newPlaceholder]);
//       return;
//     }

//     const pageElement = e.currentTarget;
//     const rect = pageElement.getBoundingClientRect();

//     // Get the actual click position relative to the page element
//     const clickX = e.clientX - rect.left;
//     const clickY = e.clientY - rect.top;

//     // Convert to base coordinates by dividing by zoom level
//     // This normalizes the coordinates to what they would be at 100% zoom
//     const x = clickX / zoom;
//     const y = clickY / zoom;

//     console.log("Click position:", {
//       clickX,
//       clickY,
//       zoom,
//       normalizedX: x,
//       normalizedY: y,
//       page: pageNumber - 1,
//     });

//     setSignaturePosition({ x, y, page: pageNumber - 1 });
//     setShowSignature(true);
//   };

//   const removePlaceholder = (index: number) => {
//     setPlaceholders(placeholders.filter((_, i) => i !== index));
//   };

//   const togglePlaceholderMode = () => {
//     setPlaceholderMode(!placeholderMode);
//   };
//   const handleSignatureComplete = async (signatureData: string) => {
//     if (!currentDocument) return;

//     console.log("Adding signature at position:", signaturePosition);
//     console.log("Signature data length:", signatureData.length);

//     try {
//       const response = await axios.post(
//         `${API_URL}/api/signatures/${currentDocument._id}/sign`,
//         {
//           signerEmail: userEmail,
//           signerName: "Document Owner",
//           signatureData,
//           position: signaturePosition,
//         }
//       );

//       if (response.data.success) {
//         setCurrentDocument(response.data.document);
//         setShowSignature(false);

//         // Refresh the document to show updated status
//         if (id) {
//           fetchDocument(id);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to add signature:", error);
//       alert(
//         "Failed to add signature: " +
//           (error.response?.data?.error || error.message)
//       );
//     }
//   };

//   const handleZoomIn = () => {
//     setZoom((prev) => Math.min(prev + 0.25, 3.0));
//   };

//   const handleZoomOut = () => {
//     setZoom((prev) => Math.max(prev - 0.25, 0.5));
//   };

//   const handleResetZoom = () => {
//     setZoom(1.0);
//   };

//   const addRecipient = () => {
//     if (newRecipient.name && newRecipient.email) {
//       setRecipients([...recipients, { ...newRecipient, status: "pending" }]);
//       setNewRecipient({ name: "", email: "" });
//     }
//   };

//   const removeRecipient = (index: number) => {
//     setRecipients(recipients.filter((_, i) => i !== index));
//   };

//   const sendForSignature = async () => {
//     if (recipients.length === 0) {
//       alert("Please add at least one recipient");
//       return;
//     }

//     setSending(true);
//     try {
//       // Update document with recipients
//       await axios.put(
//         `${API_URL}/api/documents/${currentDocument?._id}/recipients`,
//         {
//           recipients,
//           placeholders,
//         }
//       );

//       // Send emails
//       await axios.post(
//         `${API_URL}/api/email/send/${currentDocument?._id}`,
//         {
//           recipients,
//           message: sendMessage,
//         }
//       );

//       alert("Document sent successfully!");
//       navigate("/");
//     } catch (error) {
//       console.error("Failed to send document:", error);
//       alert("Failed to send document");
//     } finally {
//       setSending(false);
//     }
//   };

//   const downloadDocument = () => {
//     if (currentDocument?.status === "completed" && currentDocument?.signedUrl) {
//       console.log("Downloading signed PDF via server route");
//       window.open(
//         `${API_URL}/api/documents/download/${currentDocument._id}`,
//         "_blank"
//       );
//     } else if (currentDocument?.originalUrl) {
//       console.log("Downloading original PDF:", currentDocument.originalUrl);
//       window.open(currentDocument.originalUrl, "_blank");
//     } else {
//       alert("No document available for download");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!currentDocument) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-red-500">Document not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* Document Preview */}
//       <div className="lg:col-span-2">
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-bold text-gray-900">
//               {currentDocument.title}
//             </h2>
//             <div className="flex items-center space-x-2">
//               {/* Placeholder Mode Toggle */}
//               <button
//                 onClick={togglePlaceholderMode}
//                 className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
//                   placeholderMode
//                     ? "bg-orange-600 text-white hover:bg-orange-700"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//                 title={
//                   placeholderMode
//                     ? "Exit placeholder mode"
//                     : "Add signature placeholders"
//                 }
//               >
//                 <div className="w-4 h-4 border-2 border-current rounded border-dashed"></div>
//                 <span>
//                   {placeholderMode ? "Exit Placeholders" : "Add Placeholders"}
//                 </span>
//               </button>

//               {/* Zoom Controls */}
//               <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
//                 <button
//                   onClick={handleZoomOut}
//                   disabled={zoom <= 0.5}
//                   className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
//                   title="Zoom Out"
//                 >
//                   <ZoomOut className="h-4 w-4" />
//                 </button>
//                 <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
//                   {Math.round(zoom * 100)}%
//                 </span>
//                 <button
//                   onClick={handleZoomIn}
//                   disabled={zoom >= 3.0}
//                   className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
//                   title="Zoom In"
//                 >
//                   <ZoomIn className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={handleResetZoom}
//                   className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
//                   title="Reset Zoom"
//                 >
//                   <RotateCcw className="h-4 w-4" />
//                 </button>
//               </div>

//               <button
//                 onClick={downloadDocument}
//                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
//               >
//                 <Download className="h-4 w-4" />
//                 <span>Download</span>
//               </button>
//             </div>
//           </div>

//           {/* Placeholder Mode Instructions */}
//           {placeholderMode && (
//             <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
//               <div className="flex items-center space-x-2 mb-2">
//                 <div className="w-4 h-4 border-2 border-orange-600 rounded border-dashed"></div>
//                 <h4 className="text-sm font-medium text-orange-800">
//                   Placeholder Mode Active
//                 </h4>
//               </div>
//               <p className="text-sm text-orange-700">
//                 Click anywhere on the document to add signature placeholders.
//                 Recipients will be able to click on these placeholders to sign.
//               </p>
//               {placeholders.length > 0 && (
//                 <p className="text-xs text-orange-600 mt-2">
//                   {placeholders.length} placeholder
//                   {placeholders.length > 1 ? "s" : ""} added
//                 </p>
//               )}
//             </div>
//           )}

//           {/* PDF Preview - Scrollable Pages */}
//           <div className="border rounded-lg overflow-hidden bg-gray-100">
//             {pdfError ? (
//               <div className="w-full h-96 flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                   <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600 mb-4">
//                     Unable to preview PDF. Click below to view in new tab.
//                   </p>
//                   <button
//                     onClick={() =>
//                       window.open(currentDocument.originalUrl, "_blank")
//                     }
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Open PDF
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="max-h-[800px] overflow-y-auto">
//                 <Document
//                   file={currentDocument.originalUrl}
//                   onLoadSuccess={onDocumentLoadSuccess}
//                   onLoadError={onDocumentLoadError}
//                   loading={
//                     <div className="w-full h-96 flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     </div>
//                   }
//                 >
//                   {Array.from(new Array(numPages), (el, index) => (
//                     <div
//                       key={`page_${index + 1}`}
//                       className="relative mb-4 last:mb-0"
//                     >
//                       <div
//                         className={`relative border border-gray-200 bg-white ${
//                           placeholderMode ? "cursor-copy" : "cursor-crosshair"
//                         }`}
//                         onClick={(e) => handlePageClick(e, index + 1)}
//                       >
//                         <Page
//                           pageNumber={index + 1}
//                           width={baseWidth * zoom}
//                           scale={1.0}
//                           renderTextLayer={false}
//                           renderAnnotationLayer={false}
//                         />

//                         {/* Page number indicator */}
//                         <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
//                           Page {index + 1}
//                         </div>

//                         {/* Signature placeholders for this page */}
//                         {placeholders
//                           .filter((placeholder) => placeholder.page === index)
//                           .map((placeholder, placeholderIndex) => (
//                             <div
//                               key={placeholderIndex}
//                               className="absolute border-2 border-dashed border-orange-400 bg-orange-50 bg-opacity-80 rounded flex items-center justify-center group hover:bg-orange-100 transition-colors"
//                               style={{
//                                 left: placeholder.x * zoom - 60 * zoom,
//                                 top: placeholder.y * zoom - 20 * zoom,
//                                 width: `${120 * zoom}px`,
//                                 height: `${40 * zoom}px`,
//                               }}
//                             >
//                               <span className="text-orange-600 text-xs font-medium pointer-events-none">
//                                 Sign Here
//                               </span>
//                               {placeholderMode && (
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     const globalIndex = placeholders.findIndex(
//                                       (p) =>
//                                         p.x === placeholder.x &&
//                                         p.y === placeholder.y &&
//                                         p.page === placeholder.page
//                                     );
//                                     removePlaceholder(globalIndex);
//                                   }}
//                                   className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
//                                   title="Remove placeholder"
//                                 >
//                                   ×
//                                 </button>
//                               )}
//                             </div>
//                           ))}

//                         {/* Existing signatures overlay for this page */}
//                         {currentDocument.signatures
//                           ?.filter((sig: any) => sig.position?.page === index)
//                           .map((signature: any, sigIndex: number) => (
//                             <div
//                               key={sigIndex}
//                               className="absolute pointer-events-none border-2 border-blue-300 bg-blue-50 rounded p-1"
//                               style={{
//                                 left: signature.position.x * zoom - 60 * zoom,
//                                 top: signature.position.y * zoom - 20 * zoom,
//                                 width: `${120 * zoom}px`,
//                                 height: `${40 * zoom}px`,
//                               }}
//                             >
//                               <img
//                                 src={signature.signatureData}
//                                 alt="Signature"
//                                 className="w-full h-full object-contain"
//                               />
//                               <p className="text-xs text-blue-700 text-center mt-1 leading-none">
//                                 {signature.signerName}
//                               </p>
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   ))}
//                 </Document>
//               </div>
//             )}

//             {/* Signature Overlay */}
//             {showSignature && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-medium">Add Your Signature</h3>
//                     <button
//                       onClick={() => setShowSignature(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <SignatureCanvas
//                     onSignatureComplete={handleSignatureComplete}
//                     onCancel={() => setShowSignature(false)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {!placeholderMode && (
//             <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//               <p className="text-sm text-blue-700 font-medium mb-2">
//                 How to sign:
//               </p>
//               <ol className="text-sm text-blue-600 space-y-1">
//                 <li>
//                   1. Scroll through the document to find where you want to sign
//                 </li>
//                 <li>
//                   2. Click anywhere on any page where you want to place your
//                   signature
//                 </li>
//                 <li>3. Draw your signature in the popup canvas</li>
//                 <li>4. Click "Sign Document" to save your signature</li>
//                 <li>
//                   5. The signature will appear at the exact position you clicked
//                 </li>
//               </ol>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recipients Panel */}
//       <div className="space-y-6">
//         {/* Add Recipients */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Recipients</h3>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 value={newRecipient.name}
//                 onChange={(e) =>
//                   setNewRecipient({ ...newRecipient, name: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Recipient name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={newRecipient.email}
//                 onChange={(e) =>
//                   setNewRecipient({ ...newRecipient, email: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="recipient@example.com"
//               />
//             </div>

//             <button
//               onClick={addRecipient}
//               disabled={!newRecipient.name || !newRecipient.email}
//               className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
//             >
//               <Plus className="h-4 w-4" />
//               <span>Add Recipient</span>
//             </button>
//           </div>

//           {/* Recipients List */}
//           {recipients.length > 0 && (
//             <div className="mt-6 space-y-2">
//               <h4 className="text-sm font-medium text-gray-700">
//                 Added Recipients:
//               </h4>
//               {recipients.map((recipient, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
//                 >
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">
//                       {recipient.name}
//                     </p>
//                     <p className="text-xs text-gray-500">{recipient.email}</p>
//                   </div>
//                   <button
//                     onClick={() => removeRecipient(index)}
//                     className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Placeholders Summary */}
//         {placeholders.length > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">
//               Signature Placeholders
//             </h3>
//             <div className="space-y-2">
//               {placeholders.map((placeholder, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-2 bg-orange-50 rounded-md"
//                 >
//                   <span className="text-sm text-orange-700">
//                     Page {placeholder.page + 1} - Position (
//                     {Math.round(placeholder.x)}, {Math.round(placeholder.y)})
//                   </span>
//                   <button
//                     onClick={() => removePlaceholder(index)}
//                     className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
//                   >
//                     <X className="h-3 w-3" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//         {/* Send Message */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">
//             Message to Recipients
//           </h3>
//           <textarea
//             value={sendMessage}
//             onChange={(e) => setSendMessage(e.target.value)}
//             rows={4}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//             placeholder="Please review and sign this document..."
//           />
//         </div>

//         {/* Send Button */}
//         <button
//           onClick={sendForSignature}
//           disabled={recipients.length === 0 || sending}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
//         >
//           {sending ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               <span>Sending...</span>
//             </>
//           ) : (
//             <>
//               <Send className="h-4 w-4" />
//               <span>Send for Signature</span>
//             </>
//           )}
//         </button>

//         {/* Document Info */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">
//             Document Info
//           </h3>
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Status:</span>
//               <span
//                 className={`font-medium ${
//                   currentDocument.status === "completed"
//                     ? "text-green-600"
//                     : currentDocument.status === "sent"
//                     ? "text-blue-600"
//                     : "text-yellow-600"
//                 }`}
//               >
//                 {currentDocument.status.charAt(0).toUpperCase() +
//                   currentDocument.status.slice(1)}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Created:</span>
//               <span className="text-gray-900">
//                 {new Date(currentDocument.createdAt).toLocaleDateString()}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Signatures:</span>
//               <span className="text-gray-900">
//                 {currentDocument.signatures?.length || 0}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Placeholders:</span>
//               <span className="text-gray-900">{placeholders.length}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Pages:</span>
//               <span className="text-gray-900">{numPages}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentPreview;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  Download,
  Plus,
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureCanvas from "./SignatureCanvas";
import { useDocuments } from "../context/DocumentContext";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Recipient {
  name: string;
  email: string;
  status: "pending" | "sent" | "signed";
}

const DocumentPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDocument, setCurrentDocument, userEmail } = useDocuments();
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({
    x: 0,
    y: 0,
    page: 0,
  });
  const [placeholderMode, setPlaceholderMode] = useState(false);
  const [placeholders, setPlaceholders] = useState<
    Array<{ x: number; y: number; page: number; recipientEmail?: string }>
  >([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "" });
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const baseWidth = 600; // Base width for coordinate calculations

  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);

  const fetchDocument = async (documentId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/documents/${documentId}`
      );
      setCurrentDocument(response.data);
      setRecipients(response.data.recipients || []);
      setPlaceholders(response.data.placeholders || []);
    } catch (error) {
      console.error("Failed to fetch document:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
  };

  const onDocumentLoadError = (error: any) => {
    console.error("PDF load error:", error);
    setPdfError(true);
  };

  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    if (showSignature) return;

    if (placeholderMode) {
      // Add placeholder mode
      const pageElement = e.currentTarget;
      const rect = pageElement.getBoundingClientRect();

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const x = clickX / zoom;
      const y = clickY / zoom;

      const newPlaceholder = { x, y, page: pageNumber - 1 };
      setPlaceholders([...placeholders, newPlaceholder]);
      return;
    }

    const pageElement = e.currentTarget;
    const rect = pageElement.getBoundingClientRect();

    // Get the actual click position relative to the page element
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to base coordinates by dividing by zoom level
    // This normalizes the coordinates to what they would be at 100% zoom
    const x = clickX / zoom;
    const y = clickY / zoom;

    console.log("Click position:", {
      clickX,
      clickY,
      zoom,
      normalizedX: x,
      normalizedY: y,
      page: pageNumber - 1,
    });

    setSignaturePosition({ x, y, page: pageNumber - 1 });
    setShowSignature(true);
  };

  const removePlaceholder = (index: number) => {
    setPlaceholders(placeholders.filter((_, i) => i !== index));
  };

  const togglePlaceholderMode = () => {
    setPlaceholderMode(!placeholderMode);
  };
  const handleSignatureComplete = async (signatureData: string) => {
    if (!currentDocument) return;

    console.log("Adding signature at position:", signaturePosition);
    console.log("Signature data length:", signatureData.length);

    try {
      const response = await axios.post(
        `${API_URL}/api/signatures/${currentDocument._id}/sign`,
        {
          signerEmail: userEmail,
          signerName: "Document Owner",
          signatureData,
          position: signaturePosition,
        }
      );

      if (response.data.success) {
        setCurrentDocument(response.data.document);
        setShowSignature(false);

        // Refresh the document to show updated status
        if (id) {
          fetchDocument(id);
        }
      }
    } catch (error) {
      console.error("Failed to add signature:", error);
      alert(
        "Failed to add signature: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  const addRecipient = () => {
    if (newRecipient.name && newRecipient.email) {
      setRecipients([...recipients, { ...newRecipient, status: "pending" }]);
      setNewRecipient({ name: "", email: "" });
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const sendForSignature = async () => {
    if (recipients.length === 0) {
      alert("Please add at least one recipient");
      return;
    }

    setSending(true);
    try {
      // Update document with recipients
      await axios.put(
        `${API_URL}/api/documents/${currentDocument?._id}/recipients`,
        {
          recipients,
          placeholders,
        }
      );

      // Send emails
      await axios.post(`${API_URL}/api/email/send/${currentDocument?._id}`, {
        recipients,
        message: sendMessage,
      });

      alert("Document sent successfully!");
      navigate("/");
    } catch (error) {
      console.error("Failed to send document:", error);
      alert("Failed to send document");
    } finally {
      setSending(false);
    }
  };

  const downloadDocument = () => {
    if (currentDocument?.signedUrl) {
      console.log("Downloading signed PDF via server route");
      window.open(
        `${API_URL}/api/documents/download/${currentDocument._id}`,
        "_blank"
      );
    } else if (currentDocument?.originalUrl) {
      console.log("Downloading original PDF:", currentDocument.originalUrl);
      window.open(currentDocument.originalUrl, "_blank");
    } else {
      alert("No document available for download");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Document not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Document Preview */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {currentDocument.title}
            </h2>
            <div className="flex items-center space-x-2">
              {/* Placeholder Mode Toggle */}
              <button
                onClick={togglePlaceholderMode}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  placeholderMode
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={
                  placeholderMode
                    ? "Exit placeholder mode"
                    : "Add signature placeholders"
                }
              >
                <div className="w-4 h-4 border-2 border-current rounded border-dashed"></div>
                <span>
                  {placeholderMode ? "Exit Placeholders" : "Add Placeholders"}
                </span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3.0}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={downloadDocument}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Placeholder Mode Instructions */}
          {placeholderMode && (
            <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 border-2 border-orange-600 rounded border-dashed"></div>
                <h4 className="text-sm font-medium text-orange-800">
                  Placeholder Mode Active
                </h4>
              </div>
              <p className="text-sm text-orange-700">
                Click anywhere on the document to add signature placeholders.
                Recipients will be able to click on these placeholders to sign.
              </p>
              {placeholders.length > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  {placeholders.length} placeholder
                  {placeholders.length > 1 ? "s" : ""} added
                </p>
              )}
            </div>
          )}

          {/* PDF Preview - Scrollable Pages */}
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            {pdfError ? (
              <div className="w-full h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Unable to preview PDF. Click below to view in new tab.
                  </p>
                  <button
                    onClick={() =>
                      window.open(currentDocument.originalUrl, "_blank")
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-[800px] overflow-y-auto">
                <Document
                  file={currentDocument.originalUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="w-full h-96 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className="relative mb-4 last:mb-0"
                    >
                      <div
                        className={`relative border border-gray-200 bg-white ${
                          placeholderMode ? "cursor-copy" : "cursor-crosshair"
                        }`}
                        onClick={(e) => handlePageClick(e, index + 1)}
                      >
                        <Page
                          pageNumber={index + 1}
                          width={baseWidth * zoom}
                          scale={1.0}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />

                        {/* Page number indicator */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          Page {index + 1}
                        </div>

                        {/* Signature placeholders for this page */}
                        {placeholders
                          .filter((placeholder) => placeholder.page === index)
                          .map((placeholder, placeholderIndex) => (
                            <div
                              key={placeholderIndex}
                              className="absolute border-2 border-dashed border-orange-400 bg-orange-50 bg-opacity-80 rounded flex items-center justify-center group hover:bg-orange-100 transition-colors"
                              style={{
                                left: placeholder.x * zoom - 60 * zoom,
                                top: placeholder.y * zoom - 20 * zoom,
                                width: `${120 * zoom}px`,
                                height: `${40 * zoom}px`,
                              }}
                            >
                              <span className="text-orange-600 text-xs font-medium pointer-events-none">
                                Sign Here
                              </span>
                              {placeholderMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const globalIndex = placeholders.findIndex(
                                      (p) =>
                                        p.x === placeholder.x &&
                                        p.y === placeholder.y &&
                                        p.page === placeholder.page
                                    );
                                    removePlaceholder(globalIndex);
                                  }}
                                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  title="Remove placeholder"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}

                        {/* Existing signatures overlay for this page */}
                        {currentDocument.signatures
                          ?.filter((sig: any) => sig.position?.page === index)
                          .map((signature: any, sigIndex: number) => (
                            <div
                              key={sigIndex}
                              className="absolute pointer-events-none border-2 border-blue-300 bg-blue-50 rounded p-1"
                              style={{
                                left: signature.position.x * zoom - 60 * zoom,
                                top: signature.position.y * zoom - 20 * zoom,
                                width: `${120 * zoom}px`,
                                height: `${40 * zoom}px`,
                              }}
                            >
                              <img
                                src={signature.signatureData}
                                alt="Signature"
                                className="w-full h-full object-contain"
                              />
                              <p className="text-xs text-blue-700 text-center mt-1 leading-none">
                                {signature.signerName}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </Document>
              </div>
            )}

            {/* Signature Overlay */}
            {showSignature && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Add Your Signature</h3>
                    <button
                      onClick={() => setShowSignature(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <SignatureCanvas
                    onSignatureComplete={handleSignatureComplete}
                    onCancel={() => setShowSignature(false)}
                  />
                </div>
              </div>
            )}
          </div>

          {!placeholderMode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">
                How to sign:
              </p>
              <ol className="text-sm text-blue-600 space-y-1">
                <li>
                  1. Scroll through the document to find where you want to sign
                </li>
                <li>
                  2. Click anywhere on any page where you want to place your
                  signature
                </li>
                <li>3. Draw your signature in the popup canvas</li>
                <li>4. Click "Sign Document" to save your signature</li>
                <li>
                  5. The signature will appear at the exact position you clicked
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Recipients Panel */}
      <div className="space-y-6">
        {/* Add Recipients */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recipients</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newRecipient.name}
                onChange={(e) =>
                  setNewRecipient({ ...newRecipient, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Recipient name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newRecipient.email}
                onChange={(e) =>
                  setNewRecipient({ ...newRecipient, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="recipient@example.com"
              />
            </div>

            <button
              onClick={addRecipient}
              disabled={!newRecipient.name || !newRecipient.email}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Recipient</span>
            </button>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Added Recipients:
              </h4>
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-gray-500">{recipient.email}</p>
                  </div>
                  <button
                    onClick={() => removeRecipient(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholders Summary */}
        {placeholders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Signature Placeholders
            </h3>
            <div className="space-y-2">
              {placeholders.map((placeholder, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-orange-50 rounded-md"
                >
                  <span className="text-sm text-orange-700">
                    Page {placeholder.page + 1} - Position (
                    {Math.round(placeholder.x)}, {Math.round(placeholder.y)})
                  </span>
                  <button
                    onClick={() => removePlaceholder(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Send Message */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Message to Recipients
          </h3>
          <textarea
            value={sendMessage}
            onChange={(e) => setSendMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Please review and sign this document..."
          />
        </div>

        {/* Send Button */}
        <button
          onClick={sendForSignature}
          disabled={recipients.length === 0 || sending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send for Signature</span>
            </>
          )}
        </button>

        {/* Document Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Document Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-medium ${
                  currentDocument.status === "completed"
                    ? "text-green-600"
                    : currentDocument.status === "sent"
                    ? "text-blue-600"
                    : "text-yellow-600"
                }`}
              >
                {currentDocument.status.charAt(0).toUpperCase() +
                  currentDocument.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">
                {new Date(currentDocument.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Signatures:</span>
              <span className="text-gray-900">
                {currentDocument.signatures?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Placeholders:</span>
              <span className="text-gray-900">{placeholders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pages:</span>
              <span className="text-gray-900">{numPages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
