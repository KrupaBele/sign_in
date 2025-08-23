import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, FileText, X, Download, Edit } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureCanvas from "./SignatureCanvas";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    if (documentId && email) {
      fetchSigningData();
    }
  }, [documentId, email]);

  const fetchSigningData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/signatures/sign/${documentId}/${email}`
      );
      setDocument(response.data.document);
      setRecipient(response.data.recipient);
    } catch (error) {
      console.error("Failed to fetch signing data:", error);
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
    if (signed || showSignature || tempSignature) return;

    const pageElement = e.currentTarget;
    const rect = pageElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log("Click position:", { x, y, page: pageNumber - 1 });

    setSignaturePosition({ x, y, page: pageNumber - 1 });
    setShowSignature(true);
  };

  const handleSignatureComplete = (signatureData: string) => {
    setTempSignature(signatureData);
    setShowSignature(false);
  };

  const editSignature = () => {
    setTempSignature(null);
    setShowSignature(true);
  };

  const finishSigning = async () => {
    if (!tempSignature) return;

    setFinishing(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/signatures/${documentId}/sign`,
        {
          signerEmail: email,
          signerName: recipient.name,
          signatureData: tempSignature,
          position: signaturePosition,
        }
      );

      if (response.data.success) {
        setSigned(true);
        setDocument(response.data.document);

        // If all signatures are complete, send notifications
        if (response.data.allSigned) {
          await axios.post(
            `${API_URL}/api/email/notify-completion/${documentId}`
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

  const downloadSignedDocument = () => {
    if (document?._id) {
      // Use the server download route
      window.open(
        `${API_URL}/api/documents/download/${document._id}`,
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
          {document.signedUrl && (
            <button
              onClick={downloadSignedDocument}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Signed PDF</span>
            </button>
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
                        width={600}
                        scale={1.0}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />

                      {/* Page number indicator */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        Page {index + 1} of {numPages}
                      </div>

                      {/* Existing signatures overlay for this page */}
                      {document.signatures
                        ?.filter((sig: any) => sig.position?.page === index)
                        .map((signature: any, sigIndex: number) => (
                          <div
                            key={sigIndex}
                            className="absolute pointer-events-none border-2 border-green-400 bg-green-50 rounded p-1"
                            style={{
                              left: signature.position.x - 60,
                              top: signature.position.y - 20,
                              width: "120px",
                              height: "40px",
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
                          </div>
                        ))}

                      {/* Temporary signature preview */}
                      {tempSignature && signaturePosition.page === index && (
                        <div
                          className="absolute pointer-events-none border-2 border-blue-400 bg-blue-50 rounded p-1"
                          style={{
                            left: signaturePosition.x - 60,
                            top: signaturePosition.y - 20,
                            width: "120px",
                            height: "40px",
                          }}
                        >
                          <img
                            src={tempSignature}
                            alt="Your Signature"
                            className="w-full h-full object-contain"
                          />
                          <p className="text-xs text-blue-700 text-center mt-1 leading-none">
                            {recipient.name}
                          </p>
                        </div>
                      )}
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
        {tempSignature ? (
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-blue-900">
                    Signature Placed
                  </h3>
                  <p className="text-sm text-blue-700">
                    Your signature has been placed on page{" "}
                    {signaturePosition.page + 1}
                  </p>
                </div>
              </div>
              <button
                onClick={editSignature}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Signature</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-600">
                Review your signature placement above, then click finish to
                complete the signing process.
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
              <span className="text-sm text-blue-600">
                {numPages} page{numPages > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Scroll through the document and click anywhere to place your
              signature at that location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SigningPage;

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { CheckCircle, FileText, X, Download, Edit } from "lucide-react";
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

//   useEffect(() => {
//     if (documentId && email) {
//       fetchSigningData();
//     }
//   }, [documentId, email]);

//   const fetchSigningData = async () => {
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/signatures/sign/${documentId}/${email}`
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
//     if (signed || showSignature) return;

//     const pageElement = e.currentTarget;
//     const rect = pageElement.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     console.log("Click position:", { x, y, page: pageNumber - 1 });

//     setSignaturePosition({ x, y, page: pageNumber - 1 });
//     setShowSignature(true);
//   };

//   const handleSignatureComplete = (signatureData: string) => {
//     // Add signature to the document immediately
//     addSignatureToDocument(signatureData);
//     setShowSignature(false);
//   };

//   const addSignatureToDocument = async (signatureData: string) => {
//     if (!document) return;

//     console.log("Adding signature to document:", {
//       documentId,
//       email,
//       recipientName: recipient?.name,
//       position: signaturePosition,
//     });

//     try {
//       const response = await axios.post(
//         `${API_URL}/api/signatures/${documentId}/add-temp`,
//         {
//           signerEmail: email,
//           signerName: recipient?.name || "Unknown",
//           signatureData,
//           position: signaturePosition,
//         }
//       );

//       if (response.data.success) {
//         setDocument(response.data.document);
//         console.log("Signature added successfully");
//       }
//     } catch (error) {
//       console.error("Failed to add signature:", error);
//       const errorMessage =
//         error.response?.data?.error || "Failed to add signature";
//       alert(errorMessage);
//     }
//   };

//   const editSignature = () => {
//     // Remove the last signature for this user
//     removeLastSignature();
//     setShowSignature(true);
//   };

//   const removeLastSignature = async () => {
//     if (!document) return;

//     try {
//       await axios.delete(
//         `${API_URL}/api/signatures/${documentId}/remove-last/${email}`
//       );
//       // Refresh document data
//       fetchSigningData();
//     } catch (error) {
//       console.error("Failed to remove signature:", error);
//     }
//   };

//   const finishSigning = async () => {
//     // Check if user has added at least one signature
//     const userSignatures =
//       document?.signatures?.filter((sig) => sig.signerEmail === email) || [];
//     if (userSignatures.length === 0) {
//       alert("Please add at least one signature before finishing");
//       return;
//     }

//     setFinishing(true);
//     try {
//       const response = await axios.post(
//         `${API_URL}/api/signatures/${documentId}/finish`,
//         {
//           signerEmail: email,
//         }
//       );

//       if (response.data.success) {
//         setSigned(true);
//         setDocument(response.data.document);

//         // If all signatures are complete, send notifications
//         if (response.data.allSigned) {
//           await axios.post(
//             `${API_URL}/api/email/notify-completion/${documentId}`
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

//   const downloadSignedDocument = () => {
//     if (document?._id) {
//       // Use the server download route
//       window.open(
//         `${API_URL}/api/documents/download/${document._id}`,
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
//                         width={600}
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
//                         ?.filter(
//                           (sig: any) =>
//                             sig.position?.page === index &&
//                             sig.signerEmail !== email
//                         )
//                         .map((signature: any, sigIndex: number) => (
//                           <div
//                             key={sigIndex}
//                             className="absolute pointer-events-none border-2 border-gray-400 bg-gray-50 rounded p-1"
//                             style={{
//                               left: signature.position.x - 60,
//                               top: signature.position.y - 20,
//                               width: "120px",
//                               height: "40px",
//                             }}
//                           >
//                             <img
//                               src={signature.signatureData}
//                               alt="Signature"
//                               className="w-full h-full object-contain"
//                             />
//                             <p className="text-xs text-gray-700 text-center mt-1 leading-none">
//                               {signature.signerName}
//                             </p>
//                           </div>
//                         ))}

//                       {/* Current user's signatures */}
//                       {document.signatures
//                         ?.filter(
//                           (sig: any) =>
//                             sig.position?.page === index &&
//                             sig.signerEmail === email
//                         )
//                         .map((signature: any, sigIndex: number) => (
//                           <div
//                             key={`user-sig-${sigIndex}`}
//                             className="absolute pointer-events-none border-2 border-blue-400 bg-blue-50 rounded p-1"
//                             style={{
//                               left: signature.position.x - 60,
//                               top: signature.position.y - 20,
//                               width: "120px",
//                               height: "40px",
//                             }}
//                           >
//                             <img
//                               src={signature.signatureData}
//                               alt="Your Signature"
//                               className="w-full h-full object-contain"
//                             />
//                             <p className="text-xs text-blue-700 text-center mt-1 leading-none">
//                               You
//                             </p>
//                           </div>
//                         ))}
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
//         {document.signatures?.some((sig) => sig.signerEmail === email) ? (
//           <div className="bg-blue-50 rounded-lg p-6 mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-3">
//                 <CheckCircle className="h-6 w-6 text-blue-600" />
//                 <div>
//                   <h3 className="text-lg font-medium text-blue-900">
//                     Signatures Added
//                   </h3>
//                   <p className="text-sm text-blue-700">
//                     You have added{" "}
//                     {
//                       document.signatures?.filter(
//                         (sig) => sig.signerEmail === email
//                       ).length
//                     }{" "}
//                     signature(s)
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={editSignature}
//                   className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
//                 >
//                   <Edit className="h-4 w-4" />
//                   <span>Remove Last</span>
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <p className="text-sm text-blue-600">
//                 You can add more signatures by clicking anywhere on the
//                 document, or click finish to complete the signing process.
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
//               <span className="text-sm text-blue-600">
//                 {numPages} page{numPages > 1 ? "s" : ""}
//               </span>
//             </div>
//             <p className="text-sm text-blue-600 mt-2">
//               Scroll through the document and click anywhere to place
//               signatures. You can add multiple signatures if needed.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SigningPage;
