// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   CheckCircle,
//   FileText,
//   X,
//   Download,
//   Edit,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
// } from "lucide-react";
// import { Document, Page, pdfjs } from "react-pdf";
// import SignatureCanvas from "./SignatureCanvas";
// import axios from "axios";

// // Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// const SigningPage = () => {
//   const { documentId, email } = useParams();
//   const [document, setDocument] = useState<any>(null);
//   const [recipient, setRecipient] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [showSignature, setShowSignature] = useState(false);
//   const [signaturePosition, setSignaturePosition] = useState({
//     x: 0,
//     y: 0,
//     page: 0,
//   });
//   const [tempSignature, setTempSignature] = useState<string | null>(null);
//   const [signed, setSigned] = useState(false);
//   const [finishing, setFinishing] = useState(false);
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pdfError, setPdfError] = useState(false);
//   const [zoom, setZoom] = useState(1.0);
//   const baseWidth = 600; // Base width for coordinate calculations

//   useEffect(() => {
//     if (documentId && email) {
//       fetchSigningData();
//     }
//   }, [documentId, email]);

//   const fetchSigningData = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3001/api/signatures/sign/${documentId}/${email}`
//       );
//       setDocument(response.data.document);
//       setRecipient(response.data.recipient);
//     } catch (error) {
//       console.error("Failed to fetch signing data:", error);
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
//     if (signed || showSignature || tempSignature) return;

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

//   const handleSignatureComplete = (signatureData: string) => {
//     setTempSignature(signatureData);
//     setShowSignature(false);
//   };

//   const editSignature = () => {
//     setTempSignature(null);
//     setShowSignature(true);
//   };

//   const finishSigning = async () => {
//     if (!tempSignature) return;

//     setFinishing(true);
//     try {
//       const response = await axios.post(
//         `http://localhost:3001/api/signatures/${documentId}/sign`,
//         {
//           signerEmail: email,
//           signerName: recipient.name,
//           signatureData: tempSignature,
//           position: signaturePosition,
//         }
//       );

//       if (response.data.success) {
//         setSigned(true);
//         setDocument(response.data.document);

//         // If all signatures are complete, send notifications
//         if (response.data.allSigned) {
//           await axios.post(
//             `http://localhost:3001/api/email/notify-completion/${documentId}`
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Failed to sign document:", error);
//       alert("Failed to sign document");
//     } finally {
//       setFinishing(false);
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

//   const downloadSignedDocument = () => {
//     if (document?._id) {
//       // Use the server download route
//       window.open(
//         `http://localhost:3001/api/documents/download/${document._id}`,
//         "_blank"
//       );
//     } else {
//       alert("Signed document is not yet available");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!document) {
//     return (
//       <div className="text-center py-12">
//         <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           Document not found
//         </h3>
//         <p className="text-gray-500">
//           The document you're trying to access doesn't exist or you don't have
//           permission to view it.
//         </p>
//       </div>
//     );
//   }

//   if (signed) {
//     return (
//       <div className="max-w-2xl mx-auto text-center py-12">
//         <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">
//           Document Signed Successfully!
//         </h2>
//         <p className="text-gray-600 mb-6">
//           Thank you for signing "{document.title}". All parties will be notified
//           when the signing process is complete.
//         </p>
//         <div className="flex items-center justify-center space-x-4">
//           <button
//             onClick={() => window.open(document.originalUrl, "_blank")}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//           >
//             <FileText className="h-4 w-4" />
//             <span>View Original</span>
//           </button>
//           {document.signedUrl && (
//             <button
//               onClick={downloadSignedDocument}
//               className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
//             >
//               <Download className="h-4 w-4" />
//               <span>Download Signed PDF</span>
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto">
//       <div className="bg-white rounded-lg shadow-sm border p-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             {document.title}
//           </h1>
//           <p className="text-gray-600">
//             Hello {recipient.name}, please review and sign this document.
//           </p>

//           {/* Zoom Controls */}
//           <div className="flex items-center justify-between mt-4">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">Zoom:</span>
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
//             </div>
//             <div className="text-sm text-gray-500">
//               {numPages} page{numPages > 1 ? "s" : ""}
//             </div>
//           </div>

//           {document.note && (
//             <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
//               <p className="text-blue-700">{document.note}</p>
//             </div>
//           )}
//         </div>

//         {/* Document Preview - All Pages Scrollable */}
//         <div className="border rounded-lg overflow-hidden bg-gray-100 mb-6">
//           {pdfError ? (
//             <div className="w-full h-96 flex items-center justify-center bg-gray-50">
//               <div className="text-center">
//                 <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-4">
//                   Unable to preview PDF. Click below to view in new tab.
//                 </p>
//                 <button
//                   onClick={() => window.open(document.originalUrl, "_blank")}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Open PDF
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="max-h-[800px] overflow-y-auto pdf-container">
//               <Document
//                 file={document.originalUrl}
//                 onLoadSuccess={onDocumentLoadSuccess}
//                 onLoadError={onDocumentLoadError}
//                 loading={
//                   <div className="w-full h-96 flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   </div>
//                 }
//               >
//                 {Array.from(new Array(numPages), (el, index) => (
//                   <div
//                     key={`page_${index + 1}`}
//                     className="relative mb-4 last:mb-0"
//                   >
//                     <div
//                       className={`relative border border-gray-200 bg-white ${
//                         !tempSignature && !signed
//                           ? "cursor-crosshair hover:shadow-md"
//                           : ""
//                       } transition-shadow`}
//                       onClick={(e) => handlePageClick(e, index + 1)}
//                     >
//                       <Page
//                         pageNumber={index + 1}
//                         width={baseWidth * zoom}
//                         scale={1.0}
//                         renderTextLayer={false}
//                         renderAnnotationLayer={false}
//                       />

//                       {/* Page number indicator */}
//                       <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
//                         Page {index + 1} of {numPages}
//                       </div>

//                       {/* Existing signatures overlay for this page */}
//                       {document.signatures
//                         ?.filter((sig: any) => sig.position?.page === index)
//                         .map((signature: any, sigIndex: number) => (
//                           <div
//                             key={sigIndex}
//                             className="absolute pointer-events-none border-2 border-green-400 bg-green-50 rounded p-1"
//                             style={{
//                               left: signature.position.x * zoom - 60 * zoom,
//                               top: signature.position.y * zoom - 20 * zoom,
//                               width: `${120 * zoom}px`,
//                               height: `${40 * zoom}px`,
//                             }}
//                           >
//                             <img
//                               src={signature.signatureData}
//                               alt="Signature"
//                               className="w-full h-full object-contain"
//                             />
//                             <p className="text-xs text-green-700 text-center mt-1 leading-none">
//                               {signature.signerName}
//                             </p>
//                           </div>
//                         ))}

//                       {/* Temporary signature preview */}
//                       {tempSignature && signaturePosition.page === index && (
//                         <div
//                           className="absolute pointer-events-none border-2 border-blue-400 bg-blue-50 rounded p-1"
//                           style={{
//                             left: signaturePosition.x * zoom - 60 * zoom,
//                             top: signaturePosition.y * zoom - 20 * zoom,
//                             width: `${120 * zoom}px`,
//                             height: `${40 * zoom}px`,
//                           }}
//                         >
//                           <img
//                             src={tempSignature}
//                             alt="Your Signature"
//                             className="w-full h-full object-contain"
//                           />
//                           <p className="text-xs text-blue-700 text-center mt-1 leading-none">
//                             {recipient.name}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </Document>
//             </div>
//           )}

//           {/* Signature Overlay */}
//           {showSignature && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-medium">Place Your Signature</h3>
//                   <button
//                     onClick={() => setShowSignature(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//                 <SignatureCanvas
//                   onSignatureComplete={handleSignatureComplete}
//                   onCancel={() => setShowSignature(false)}
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Signature Status and Actions */}
//         {tempSignature ? (
//           <div className="bg-blue-50 rounded-lg p-6 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <CheckCircle className="h-6 w-6 text-blue-600" />
//                 <div>
//                   <h3 className="text-lg font-medium text-blue-900">
//                     Signature Placed
//                   </h3>
//                   <p className="text-sm text-blue-700">
//                     Your signature has been placed on page{" "}
//                     {signaturePosition.page + 1}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={editSignature}
//                 className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
//               >
//                 <Edit className="h-4 w-4" />
//                 <span>Edit Signature</span>
//               </button>
//             </div>

//             <div className="flex items-center justify-between">
//               <p className="text-sm text-blue-600">
//                 Review your signature placement above, then click finish to
//                 complete the signing process.
//               </p>
//               <button
//                 onClick={finishSigning}
//                 disabled={finishing}
//                 className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//               >
//                 {finishing ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     <span>Finishing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="h-4 w-4" />
//                     <span>Finish Signing</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-blue-50 rounded-lg p-6 mb-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <FileText className="h-5 w-5 text-blue-600" />
//                 <span className="text-sm font-medium text-blue-700">
//                   Signing as: {recipient.name}
//                 </span>
//               </div>
//             </div>
//             <p className="text-sm text-blue-600 mt-2">
//               Scroll through the document and click anywhere to place your
//               signature at that location.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SigningPage;

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   CheckCircle,
//   FileText,
//   X,
//   Download,
//   Edit,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
// } from "lucide-react";
// import { Document, Page, pdfjs } from "react-pdf";
// import SignatureCanvas from "./SignatureCanvas";
// import axios from "axios";

// // Set up PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// const SigningPage = () => {
//   const { documentId, email } = useParams();
//   const [document, setDocument] = useState<any>(null);
//   const [recipient, setRecipient] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [showSignature, setShowSignature] = useState(false);
//   const [signaturePosition, setSignaturePosition] = useState({
//     x: 0,
//     y: 0,
//     page: 0,
//   });
//   const [tempSignature, setTempSignature] = useState<string | null>(null);
//   const [signed, setSigned] = useState(false);
//   const [finishing, setFinishing] = useState(false);
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pdfError, setPdfError] = useState(false);
//   const [zoom, setZoom] = useState(1.0);
//   const [placeholders, setPlaceholders] = useState<
//     Array<{ x: number; y: number; page: number }>
//   >([]);
//   const baseWidth = 600; // Base width for coordinate calculations

//   useEffect(() => {
//     if (documentId && email) {
//       fetchSigningData();
//     }
//   }, [documentId, email]);

//   const fetchSigningData = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3001/api/signatures/sign/${documentId}/${email}`
//       );
//       setDocument(response.data.document);
//       setRecipient(response.data.recipient);
//       setPlaceholders(response.data.document.placeholders || []);
//     } catch (error) {
//       console.error("Failed to fetch signing data:", error);
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

//   const handlePlaceholderClick = (placeholder: {
//     x: number;
//     y: number;
//     page: number;
//   }) => {
//     if (signed || showSignature || tempSignature) return;

//     setSignaturePosition(placeholder);
//     setShowSignature(true);
//   };
//   const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
//     if (signed || showSignature || tempSignature) return;

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

//   const handleSignatureComplete = (signatureData: string) => {
//     setTempSignature(signatureData);
//     setShowSignature(false);
//   };

//   const editSignature = () => {
//     setTempSignature(null);
//     setShowSignature(true);
//   };

//   const finishSigning = async () => {
//     if (!tempSignature) return;

//     setFinishing(true);
//     try {
//       const response = await axios.post(
//         `http://localhost:3001/api/signatures/${documentId}/sign`,
//         {
//           signerEmail: email,
//           signerName: recipient.name,
//           signatureData: tempSignature,
//           position: signaturePosition,
//         }
//       );

//       if (response.data.success) {
//         setSigned(true);
//         setDocument(response.data.document);

//         // If all signatures are complete, send notifications
//         if (response.data.allSigned) {
//           await axios.post(
//             `http://localhost:3001/api/email/notify-completion/${documentId}`
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Failed to sign document:", error);
//       alert("Failed to sign document");
//     } finally {
//       setFinishing(false);
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

//   const downloadSignedDocument = () => {
//     if (document?._id) {
//       // Use the server download route
//       window.open(
//         `http://localhost:3001/api/documents/download/${document._id}`,
//         "_blank"
//       );
//     } else {
//       alert("Signed document is not yet available");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!document) {
//     return (
//       <div className="text-center py-12">
//         <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">
//           Document not found
//         </h3>
//         <p className="text-gray-500">
//           The document you're trying to access doesn't exist or you don't have
//           permission to view it.
//         </p>
//       </div>
//     );
//   }

//   if (signed) {
//     return (
//       <div className="max-w-2xl mx-auto text-center py-12">
//         <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">
//           Document Signed Successfully!
//         </h2>
//         <p className="text-gray-600 mb-6">
//           Thank you for signing "{document.title}". All parties will be notified
//           when the signing process is complete.
//         </p>
//         <div className="flex items-center justify-center space-x-4">
//           <button
//             onClick={() => window.open(document.originalUrl, "_blank")}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//           >
//             <FileText className="h-4 w-4" />
//             <span>View Original</span>
//           </button>
//           {document.signedUrl && (
//             <button
//               onClick={downloadSignedDocument}
//               className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
//             >
//               <Download className="h-4 w-4" />
//               <span>Download Signed PDF</span>
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto">
//       <div className="bg-white rounded-lg shadow-sm border p-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             {document.title}
//           </h1>
//           <p className="text-gray-600">
//             Hello {recipient.name}, please review and sign this document.
//           </p>

//           {/* Zoom Controls */}
//           <div className="flex items-center justify-between mt-4">
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">Zoom:</span>
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
//             </div>
//             <div className="text-sm text-gray-500">
//               {numPages} page{numPages > 1 ? "s" : ""}
//             </div>
//           </div>

//           {document.note && (
//             <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
//               <p className="text-blue-700">{document.note}</p>
//             </div>
//           )}
//         </div>

//         {/* Document Preview - All Pages Scrollable */}
//         <div className="border rounded-lg overflow-hidden bg-gray-100 mb-6">
//           {pdfError ? (
//             <div className="w-full h-96 flex items-center justify-center bg-gray-50">
//               <div className="text-center">
//                 <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-4">
//                   Unable to preview PDF. Click below to view in new tab.
//                 </p>
//                 <button
//                   onClick={() => window.open(document.originalUrl, "_blank")}
//                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Open PDF
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="max-h-[800px] overflow-y-auto pdf-container">
//               <Document
//                 file={document.originalUrl}
//                 onLoadSuccess={onDocumentLoadSuccess}
//                 onLoadError={onDocumentLoadError}
//                 loading={
//                   <div className="w-full h-96 flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   </div>
//                 }
//               >
//                 {Array.from(new Array(numPages), (el, index) => (
//                   <div
//                     key={`page_${index + 1}`}
//                     className="relative mb-4 last:mb-0"
//                   >
//                     <div
//                       className={`relative border border-gray-200 bg-white ${
//                         !tempSignature && !signed
//                           ? "cursor-crosshair hover:shadow-md"
//                           : ""
//                       } transition-shadow`}
//                       onClick={(e) => handlePageClick(e, index + 1)}
//                     >
//                       <Page
//                         pageNumber={index + 1}
//                         width={baseWidth * zoom}
//                         scale={1.0}
//                         renderTextLayer={false}
//                         renderAnnotationLayer={false}
//                       />

//                       {/* Page number indicator */}
//                       <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
//                         Page {index + 1} of {numPages}
//                       </div>

//                       {/* Signature placeholders for this page */}
//                       {placeholders
//                         .filter((placeholder) => placeholder.page === index)
//                         .map((placeholder, placeholderIndex) => (
//                           <div
//                             key={placeholderIndex}
//                             className="absolute border-2 border-dashed border-orange-400 bg-orange-50 bg-opacity-90 rounded flex items-center justify-center cursor-pointer hover:bg-orange-100 hover:border-orange-500 transition-all group"
//                             style={{
//                               left: placeholder.x * zoom - 60 * zoom,
//                               top: placeholder.y * zoom - 20 * zoom,
//                               width: `${120 * zoom}px`,
//                               height: `${40 * zoom}px`,
//                             }}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handlePlaceholderClick(placeholder);
//                             }}
//                             title="Click to sign here"
//                           >
//                             <span className="text-orange-600 text-xs font-medium group-hover:text-orange-700">
//                               Click to Sign
//                             </span>
//                           </div>
//                         ))}

//                       {/* Existing signatures overlay for this page */}
//                       {document.signatures
//                         ?.filter((sig: any) => sig.position?.page === index)
//                         .map((signature: any, sigIndex: number) => (
//                           <div
//                             key={sigIndex}
//                             className="absolute pointer-events-none border-2 border-green-400 bg-green-50 rounded p-1"
//                             style={{
//                               left: signature.position.x * zoom - 60 * zoom,
//                               top: signature.position.y * zoom - 20 * zoom,
//                               width: `${120 * zoom}px`,
//                               height: `${40 * zoom}px`,
//                             }}
//                           >
//                             <img
//                               src={signature.signatureData}
//                               alt="Signature"
//                               className="w-full h-full object-contain"
//                             />
//                             <p className="text-xs text-green-700 text-center mt-1 leading-none">
//                               {signature.signerName}
//                             </p>
//                           </div>
//                         ))}

//                       {/* Temporary signature preview */}
//                       {tempSignature && signaturePosition.page === index && (
//                         <div
//                           className="absolute pointer-events-none border-2 border-blue-400 bg-blue-50 rounded p-1"
//                           style={{
//                             left: signaturePosition.x * zoom - 60 * zoom,
//                             top: signaturePosition.y * zoom - 20 * zoom,
//                             width: `${120 * zoom}px`,
//                             height: `${40 * zoom}px`,
//                           }}
//                         >
//                           <img
//                             src={tempSignature}
//                             alt="Your Signature"
//                             className="w-full h-full object-contain"
//                           />
//                           <p className="text-xs text-blue-700 text-center mt-1 leading-none">
//                             {recipient.name}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </Document>
//             </div>
//           )}

//           {/* Signature Overlay */}
//           {showSignature && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-medium">Place Your Signature</h3>
//                   <button
//                     onClick={() => setShowSignature(false)}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//                 <SignatureCanvas
//                   onSignatureComplete={handleSignatureComplete}
//                   onCancel={() => setShowSignature(false)}
//                 />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Signature Status and Actions */}
//         {tempSignature ? (
//           <div className="bg-blue-50 rounded-lg p-6 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <CheckCircle className="h-6 w-6 text-blue-600" />
//                 <div>
//                   <h3 className="text-lg font-medium text-blue-900">
//                     Signature Placed
//                   </h3>
//                   <p className="text-sm text-blue-700">
//                     Your signature has been placed on page{" "}
//                     {signaturePosition.page + 1}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={editSignature}
//                 className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
//               >
//                 <Edit className="h-4 w-4" />
//                 <span>Edit Signature</span>
//               </button>
//             </div>

//             <div className="flex items-center justify-between">
//               <p className="text-sm text-blue-600">
//                 Review your signature placement above, then click finish to
//                 complete the signing process.
//               </p>
//               <button
//                 onClick={finishSigning}
//                 disabled={finishing}
//                 className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//               >
//                 {finishing ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     <span>Finishing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle className="h-4 w-4" />
//                     <span>Finish Signing</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-blue-50 rounded-lg p-6 mb-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <FileText className="h-5 w-5 text-blue-600" />
//                 <span className="text-sm font-medium text-blue-700">
//                   Signing as: {recipient.name}
//                 </span>
//               </div>
//             </div>
//             <div className="mt-2">
//               {placeholders.length > 0 ? (
//                 <p className="text-sm text-blue-600">
//                   Click on the orange "Click to Sign" placeholders to place your
//                   signature, or click anywhere else on the document.
//                 </p>
//               ) : (
//                 <p className="text-sm text-blue-600">
//                   Scroll through the document and click anywhere to place your
//                   signature at that location.
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SigningPage;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  FileText,
  X,
  Download,
  Edit,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureCanvas from "./SignatureCanvas";
import axios from "axios";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const SigningPage = () => {
  const { documentId, email } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [recipient, setRecipient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({
    x: 0,
    y: 0,
    page: 0,
  });
  const [tempSignature, setTempSignature] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [placeholders, setPlaceholders] = useState<
    Array<{ x: number; y: number; page: number }>
  >([]);
  const baseWidth = 600; // Base width for coordinate calculations

  useEffect(() => {
    if (documentId && email) {
      fetchSigningData();
    }
  }, [documentId, email]);

  const fetchSigningData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/signatures/sign/${documentId}/${email}`
      );
      console.log("Fetched signing data:", response.data);
      setDocument(response.data.document);
      setRecipient(response.data.recipient);

      // Set placeholders from the document data
      const documentPlaceholders = response.data.document.placeholders || [];
      console.log("Fetched placeholders for recipient:", documentPlaceholders);
      setPlaceholders(documentPlaceholders);
    } catch (error) {
      console.error("Failed to fetch signing data:", error);
      alert("Failed to load document. Please check the link and try again.");
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

  const handlePlaceholderClick = (placeholder: {
    x: number;
    y: number;
    page: number;
  }) => {
    if (signed || showSignature) return;

    setSignaturePosition(placeholder);
    setShowSignature(true);
  };
  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    if (signed || showSignature) return;

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

  const handleSignatureComplete = (signatureData: string) => {
    if (!document) return;

    console.log("Adding signature at position:", signaturePosition);
    console.log("Signature data length:", signatureData.length);

    // Add signature immediately instead of using temp signature
    addSignatureToDocument(signatureData);
  };

  const addSignatureToDocument = async (signatureData: string) => {
    if (!document) return;

    try {
      const response = await axios.post(
        `http://localhost:3001/api/signatures/${document._id}/add-signature`,
        {
          signerEmail: email,
          signerName: recipient.name,
          signatureData,
          position: signaturePosition,
        }
      );

      if (response.data.success) {
        setDocument(response.data.document);
        setShowSignature(false);
        // Don't auto-complete, let user decide when to finish
      }
    } catch (error) {
      console.error("Failed to add signature:", error);
      alert("Failed to add signature");
    }
  };

  const editSignature = () => {
    // Remove this function as we're not using temp signatures anymore
  };

  const removeSignature = async (signatureIndex: number) => {
    if (!document || signed) return;

    try {
      // For now, we'll just refresh the document
      // In a full implementation, you'd want a delete signature API
      fetchSigningData();
    } catch (error) {
      console.error("Failed to remove signature:", error);
    }
  };

  const finishSigning = async () => {
    const userSignatures =
      document?.signatures?.filter((sig: any) => sig.signerEmail === email) ||
      [];

    if (!document || userSignatures.length === 0) {
      alert("Please add at least one signature before finishing");
      return;
    }

    setFinishing(true);
    try {
      // Complete the signing process for this recipient
      const response = await axios.post(
        `http://localhost:3001/api/signatures/${document._id}/complete-signing`,
        {
          signerEmail: email,
        }
      );

      if (response.data.success) {
        setSigned(true);
        // Update document with latest data including signed URL
        setDocument(response.data.document);

        // If all recipients have signed, send completion notification
        if (response.data.allSigned) {
          await axios.post(
            `http://localhost:3001/api/email/notify-completion/${document._id}`
          );
        }
      }
    } catch (error) {
      console.error("Failed to sign document:", error);
      alert("Failed to sign document");
    } finally {
      setFinishing(false);
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

  const downloadSignedDocument = () => {
    if (document?._id) {
      // Use the server download route
      window.open(
        `http://localhost:3001/api/documents/download/${document._id}`,
        "_blank"
      );
    } else {
      alert("Signed document is not yet available");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Document not found
        </h3>
        <p className="text-gray-500">
          The document you're trying to access doesn't exist or you don't have
          permission to view it.
        </p>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Document Signed Successfully!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for signing "{document.title}". All parties will be notified
          when the signing process is complete.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => window.open(document.originalUrl, "_blank")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>View Original</span>
          </button>
          {(document.signedUrl || document.status === "completed") && (
            <button
              onClick={downloadSignedDocument}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Signed PDF</span>
            </button>
          )}
          {!document.signedUrl && document.status !== "completed" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-700">
                The signed PDF will be available for download once all
                recipients have completed signing.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {document.title}
          </h1>
          <p className="text-gray-600">
            Hello {recipient.name}, please review and sign this document.
          </p>

          {/* Zoom Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Zoom:</span>
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
            </div>
            <div className="text-sm text-gray-500">
              {numPages} page{numPages > 1 ? "s" : ""}
            </div>
          </div>

          {document.note && (
            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-blue-700">{document.note}</p>
            </div>
          )}
        </div>

        {/* Document Preview - All Pages Scrollable */}
        <div className="border rounded-lg overflow-hidden bg-gray-100 mb-6">
          {pdfError ? (
            <div className="w-full h-96 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Unable to preview PDF. Click below to view in new tab.
                </p>
                <button
                  onClick={() => window.open(document.originalUrl, "_blank")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-[800px] overflow-y-auto pdf-container">
              <Document
                file={document.originalUrl}
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
                        !tempSignature && !signed
                          ? "cursor-crosshair hover:shadow-md"
                          : ""
                      } transition-shadow`}
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
                        Page {index + 1} of {numPages}
                      </div>

                      {/* Signature placeholders for this page */}
                      {placeholders
                        .filter((placeholder) => placeholder.page === index)
                        .map((placeholder, placeholderIndex) => {
                          console.log(
                            "Rendering placeholder:",
                            placeholder,
                            "on page",
                            index
                          );
                          return (
                            <div
                              key={placeholderIndex}
                              className="absolute border-2 border-dashed border-orange-400 bg-orange-50 bg-opacity-90 rounded flex items-center justify-center cursor-pointer hover:bg-orange-100 hover:border-orange-500 transition-all group"
                              style={{
                                left: placeholder.x * zoom - 60 * zoom,
                                top: placeholder.y * zoom - 20 * zoom,
                                width: `${120 * zoom}px`,
                                height: `${40 * zoom}px`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlaceholderClick(placeholder);
                              }}
                              title="Click to sign here"
                            >
                              <span className="text-orange-600 text-xs font-medium group-hover:text-orange-700">
                                Click to Sign
                              </span>
                            </div>
                          );
                        })}

                      {/* Existing signatures overlay for this page */}
                      {document.signatures
                        ?.filter(
                          (sig: any) =>
                            sig.position?.page === index &&
                            sig.signerEmail === email
                        )
                        .map((signature: any, sigIndex: number) => (
                          <div
                            key={sigIndex}
                            className="absolute border-2 border-green-400 bg-green-50 rounded p-1 group"
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
                            <p className="text-xs text-green-700 text-center mt-1 leading-none">
                              {signature.signerName}
                            </p>
                            {!signed && (
                              <button
                                onClick={() => removeSignature(sigIndex)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                title="Remove signature"
                              >
                                ×
                              </button>
                            )}
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
                  <h3 className="text-lg font-medium">Place Your Signature</h3>
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

        {/* Signature Status and Actions */}
        {/* Debug info for placeholders */}
        {placeholders.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Debug: Found {placeholders.length} placeholder(s) -
              {placeholders
                .map((p, i) => ` Page ${p.page + 1}(${p.x},${p.y})`)
                .join(", ")}
            </p>
          </div>
        )}

        {/* Signature Summary and Actions */}
        {document.signatures?.filter((sig: any) => sig.signerEmail === email)
          .length > 0 ? (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    {
                      document.signatures?.filter(
                        (sig: any) => sig.signerEmail === email
                      ).length
                    }{" "}
                    Signature(s) Added
                  </h3>
                  <p className="text-sm text-green-700">
                    You can add more signatures or finish the signing process
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-green-600">
                Review your signatures above. You can add more signatures or
                click finish to complete.
              </p>
              <button
                onClick={finishSigning}
                disabled={finishing}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {finishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Finishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Finish Signing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Signing as: {recipient.name}
                </span>
              </div>
            </div>
            <div className="mt-2">
              {placeholders.length > 0 ? (
                <p className="text-sm text-blue-600">
                  Click on the orange "Click to Sign" placeholders to place your
                  signature, or click anywhere else on the document.
                </p>
              ) : (
                <p className="text-sm text-blue-600">
                  Scroll through the document and click anywhere to place your
                  signature at that location.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SigningPage;
