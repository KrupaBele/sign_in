import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  Download,
  Send,
  Plus,
  Trash2,
  Type,
  AlignLeft,
  FileText as DescIcon,
  ArrowLeft,
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useDocuments } from "../context/DocumentContext";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface Slide {
  id: string;
  type: "title" | "content" | "description";
  title: string;
  content: string;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  content: {
    slides: Slide[];
  };
  isCustom: boolean;
  createdAt: string;
  usageCount: number;
}

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userEmail } = useDocuments();

  const [template, setTemplate] = useState<Template | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const predefinedTemplates = [
    {
      id: "nda-template",
      title: "Non-Disclosure Agreement",
      description:
        "Standard NDA template for protecting confidential information",
      category: "legal",
      content: {
        slides: [
          {
            id: "1",
            type: "title" as const,
            title: "NON-DISCLOSURE AGREEMENT",
            content: "Confidential Information Protection",
          },
          {
            id: "2",
            type: "content" as const,
            title: "Parties",
            content:
              'This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between:\n\nDisclosing Party: [COMPANY NAME]\nAddress: [COMPANY ADDRESS]\n\nReceiving Party: [RECIPIENT NAME]\nAddress: [RECIPIENT ADDRESS]',
          },
          {
            id: "3",
            type: "content" as const,
            title: "Definition of Confidential Information",
            content:
              'For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged.\n\nThis includes but is not limited to:\n• Technical data, trade secrets, know-how\n• Business plans, customer lists, financial information\n• Software, algorithms, and proprietary processes\n• Any other information marked as confidential',
          },
          {
            id: "4",
            type: "content" as const,
            title: "Obligations of Receiving Party",
            content:
              "Receiving Party agrees to:\n\n1. Hold and maintain the Confidential Information in strict confidence\n2. Not disclose the Confidential Information to any third parties\n3. Not use the Confidential Information for any purpose other than evaluating potential business relationships\n4. Take reasonable precautions to protect the confidentiality of the information\n5. Return or destroy all Confidential Information upon request",
          },
          {
            id: "5",
            type: "content" as const,
            title: "Term and Signatures",
            content:
              "This Agreement shall remain in effect for a period of [DURATION] years from the date of execution.\n\nBy signing below, both parties agree to the terms and conditions outlined in this Agreement.\n\n\nDisclosing Party: _________________________ Date: _________\n[COMPANY NAME]\n\n\nReceiving Party: _________________________ Date: _________\n[RECIPIENT NAME]",
          },
        ],
      },
      isCustom: false,
      createdAt: "2024-01-01",
      usageCount: 45,
    },
    {
      id: "employment-contract",
      title: "Employment Contract",
      description: "Comprehensive employment agreement template",
      category: "hr",
      content: {
        slides: [
          {
            id: "1",
            type: "title" as const,
            title: "EMPLOYMENT AGREEMENT",
            content: "Terms and Conditions of Employment",
          },
          {
            id: "2",
            type: "content" as const,
            title: "Employment Details",
            content:
              "Employee Name: [EMPLOYEE NAME]\nPosition: [JOB TITLE]\nDepartment: [DEPARTMENT]\nStart Date: [START DATE]\nReporting Manager: [MANAGER NAME]\n\nEmployment Type: [FULL-TIME/PART-TIME/CONTRACT]\nWork Location: [OFFICE ADDRESS/REMOTE/HYBRID]",
          },
          {
            id: "3",
            type: "content" as const,
            title: "Compensation and Benefits",
            content:
              "Base Salary: $[AMOUNT] per [YEAR/MONTH]\nPayment Schedule: [MONTHLY/BI-WEEKLY]\n\nBenefits Include:\n• Health insurance coverage\n• Dental and vision insurance\n• Retirement plan (401k) with company matching\n• Paid time off (PTO): [NUMBER] days annually\n• Professional development opportunities\n• [OTHER BENEFITS]",
          },
          {
            id: "4",
            type: "content" as const,
            title: "Responsibilities and Expectations",
            content:
              "Key Responsibilities:\n• [PRIMARY RESPONSIBILITY 1]\n• [PRIMARY RESPONSIBILITY 2]\n• [PRIMARY RESPONSIBILITY 3]\n• [ADDITIONAL DUTIES AS ASSIGNED]\n\nPerformance Standards:\n• Meet or exceed established performance metrics\n• Maintain professional conduct and appearance\n• Comply with company policies and procedures\n• Participate in required training and development programs",
          },
          {
            id: "5",
            type: "content" as const,
            title: "Terms and Signatures",
            content:
              "This agreement shall commence on [START DATE] and continue until terminated by either party with [NOTICE PERIOD] written notice.\n\nBy signing below, both parties acknowledge they have read, understood, and agree to be bound by the terms of this agreement.\n\n\nEmployer: _________________________ Date: _________\n[COMPANY NAME]\n[TITLE]\n\n\nEmployee: _________________________ Date: _________\n[EMPLOYEE NAME]",
          },
        ],
      },
      isCustom: false,
      createdAt: "2024-01-01",
      usageCount: 32,
    },
    {
      id: "service-agreement",
      title: "Service Agreement",
      description: "Professional services contract template",
      category: "business",
      content: {
        slides: [
          {
            id: "1",
            type: "title" as const,
            title: "SERVICE AGREEMENT",
            content: "Professional Services Contract",
          },
          {
            id: "2",
            type: "content" as const,
            title: "Service Provider and Client",
            content:
              "Service Provider: [PROVIDER NAME]\nBusiness Address: [PROVIDER ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]\n\nClient: [CLIENT NAME]\nBusiness Address: [CLIENT ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]",
          },
          {
            id: "3",
            type: "content" as const,
            title: "Scope of Services",
            content:
              "The Service Provider agrees to provide the following services:\n\n• [SERVICE DESCRIPTION 1]\n• [SERVICE DESCRIPTION 2]\n• [SERVICE DESCRIPTION 3]\n• [ADDITIONAL SERVICES]\n\nDeliverables:\n• [DELIVERABLE 1] - Due: [DATE]\n• [DELIVERABLE 2] - Due: [DATE]\n• [DELIVERABLE 3] - Due: [DATE]",
          },
          {
            id: "4",
            type: "content" as const,
            title: "Payment Terms",
            content:
              "Total Contract Value: $[AMOUNT]\nPayment Schedule: [SCHEDULE]\n\nPayment Terms:\n• [PERCENTAGE]% upon signing this agreement\n• [PERCENTAGE]% upon completion of milestone 1\n• [PERCENTAGE]% upon final delivery\n\nLate Payment: Interest of [RATE]% per month will be charged on overdue amounts.\n\nExpenses: Client will reimburse reasonable expenses with prior approval.",
          },
          {
            id: "5",
            type: "content" as const,
            title: "Agreement Terms",
            content:
              "Project Duration: [START DATE] to [END DATE]\n\nTermination: Either party may terminate with [NOTICE PERIOD] written notice.\n\nIntellectual Property: [IP OWNERSHIP TERMS]\n\nConfidentiality: Both parties agree to maintain confidentiality of proprietary information.\n\n\nService Provider: _________________________ Date: _________\n[PROVIDER NAME]\n\n\nClient: _________________________ Date: _________\n[CLIENT NAME]",
          },
        ],
      },
      isCustom: false,
      createdAt: "2024-01-01",
      usageCount: 28,
    },
    {
      id: "rental-agreement",
      title: "Rental Agreement",
      description: "Residential property rental lease agreement",
      category: "real-estate",
      content: {
        slides: [
          {
            id: "1",
            type: "title" as const,
            title: "RESIDENTIAL RENTAL AGREEMENT",
            content: "Lease Agreement for Residential Property",
          },
          {
            id: "2",
            type: "content" as const,
            title: "Property and Parties",
            content:
              "Landlord: [LANDLORD NAME]\nAddress: [LANDLORD ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]\n\nTenant: [TENANT NAME]\nCurrent Address: [CURRENT ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]\n\nRental Property: [PROPERTY ADDRESS]\nUnit: [UNIT NUMBER]\nCity, State, ZIP: [CITY, STATE, ZIP]",
          },
          {
            id: "3",
            type: "content" as const,
            title: "Lease Terms",
            content:
              "Lease Period: [START DATE] to [END DATE]\nMonthly Rent: $[AMOUNT]\nDue Date: [DAY] of each month\nLate Fee: $[AMOUNT] if rent is [DAYS] days late\n\nSecurity Deposit: $[AMOUNT]\nPet Deposit: $[AMOUNT] (if applicable)\n\nUtilities Included: [LIST INCLUDED UTILITIES]\nTenant Responsible For: [LIST TENANT UTILITIES]",
          },
          {
            id: "4",
            type: "content" as const,
            title: "Rules and Responsibilities",
            content:
              "Tenant Responsibilities:\n• Pay rent on time each month\n• Maintain property in good condition\n• No unauthorized alterations to property\n• No subletting without written permission\n• Comply with noise and conduct policies\n• [ADDITIONAL RULES]\n\nLandlord Responsibilities:\n• Maintain property in habitable condition\n• Make necessary repairs promptly\n• Respect tenant's right to quiet enjoyment\n• Provide 24-hour notice before entry (except emergencies)",
          },
          {
            id: "5",
            type: "content" as const,
            title: "Signatures",
            content:
              "By signing below, both parties agree to all terms and conditions outlined in this rental agreement.\n\nThis agreement shall be binding upon both parties and their successors.\n\n\nLandlord: _________________________ Date: _________\n[LANDLORD NAME]\n\n\nTenant: _________________________ Date: _________\n[TENANT NAME]\n\n\nWitness: _________________________ Date: _________\n[WITNESS NAME]",
          },
        ],
      },
      isCustom: false,
      createdAt: "2024-01-01",
      usageCount: 19,
    },
  ];

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = () => {
    if (!id) return;

    // Check predefined templates first
    const predefinedTemplate = predefinedTemplates.find((t) => t.id === id);
    if (predefinedTemplate) {
      setTemplate(predefinedTemplate);
      setSlides(predefinedTemplate.content.slides);
      setLoading(false);
      return;
    }

    // Check custom templates
    const customTemplates = JSON.parse(
      localStorage.getItem("customTemplates") || "[]"
    );
    const customTemplate = customTemplates.find((t: Template) => t.id === id);
    if (customTemplate) {
      setTemplate(customTemplate);
      setSlides(customTemplate.content.slides);
      setLoading(false);
      return;
    }

    // Template not found
    setLoading(false);
  };

  const currentSlide = slides[currentSlideIndex];

  const addSlide = (type: "title" | "content" | "description") => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type,
      title:
        type === "title"
          ? "New Title"
          : type === "content"
          ? "Section Title"
          : "",
      content:
        type === "title"
          ? "Subtitle"
          : type === "content"
          ? "Enter your content here..."
          : "Enter your description here...",
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = (slideIndex: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, index) => index !== slideIndex);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const updateSlide = (updates: Partial<Slide>) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      ...updates,
    };
    setSlides(newSlides);
  };

  const updateTemplateInfo = (updates: Partial<Template>) => {
    if (template) {
      setTemplate({ ...template, ...updates });
    }
  };

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    for (const slide of slides) {
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const { width, height } = page.getSize();
      const margin = 60;
      const contentWidth = width - margin * 2;

      if (slide.type === "title") {
        // Title slide layout
        const titleY = height - 200;
        const subtitleY = height - 280;

        // Main title
        const titleLines = wrapText(
          slide.title,
          helveticaBoldFont,
          36,
          contentWidth
        );
        let currentY = titleY;
        for (const line of titleLines) {
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 36,
            font: helveticaBoldFont,
            color: rgb(0.1, 0.1, 0.1),
          });
          currentY -= 50;
        }

        // Subtitle
        const subtitleLines = wrapText(
          slide.content,
          helveticaFont,
          18,
          contentWidth
        );
        currentY = subtitleY;
        for (const line of subtitleLines) {
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 18,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
          });
          currentY -= 25;
        }
      } else if (slide.type === "content") {
        // Content slide layout
        const titleY = height - 100;
        const contentStartY = height - 160;

        // Section title
        const titleLines = wrapText(
          slide.title,
          helveticaBoldFont,
          24,
          contentWidth
        );
        let currentY = titleY;
        for (const line of titleLines) {
          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 24,
            font: helveticaBoldFont,
            color: rgb(0.1, 0.1, 0.1),
          });
          currentY -= 35;
        }

        // Content with automatic text distribution
        const contentLines = wrapText(
          slide.content,
          helveticaFont,
          14,
          contentWidth
        );
        const availableHeight = contentStartY - 60; // Leave margin at bottom
        const lineHeight = 20;
        const totalContentHeight = contentLines.length * lineHeight;

        // Distribute text evenly if it's less than available space
        const actualLineHeight =
          totalContentHeight < availableHeight
            ? Math.min(lineHeight, availableHeight / contentLines.length)
            : lineHeight;

        currentY = contentStartY;
        for (const line of contentLines) {
          if (currentY < 60) break; // Don't go below bottom margin

          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 14,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentY -= actualLineHeight;
        }
      } else if (slide.type === "description") {
        // Description-only slide layout
        const contentStartY = height - 80;

        // Content with automatic text distribution (no title)
        const contentLines = wrapText(
          slide.content,
          helveticaFont,
          14,
          contentWidth
        );
        const availableHeight = contentStartY - 60; // Leave margin at bottom
        const lineHeight = 20;
        const totalContentHeight = contentLines.length * lineHeight;

        // Distribute text evenly if it's less than available space
        const actualLineHeight =
          totalContentHeight < availableHeight
            ? Math.min(lineHeight, availableHeight / contentLines.length)
            : lineHeight;

        let currentY = contentStartY;
        for (const line of contentLines) {
          if (currentY < 60) break; // Don't go below bottom margin

          page.drawText(line, {
            x: margin,
            y: currentY,
            size: 14,
            font: helveticaFont,
            color: rgb(0.2, 0.2, 0.2),
          });
          currentY -= actualLineHeight;
        }
      }
    }

    return await pdfDoc.save();
  };

  // Helper function to wrap text
  const wrapText = (
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] => {
    // Handle line breaks and clean text
    const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const paragraphs = cleanText.split("\n");
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === "") {
        lines.push(""); // Empty line for spacing
      } else {
        const words = paragraph.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);

          if (textWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              lines.push(word);
            }
          }
        }

        if (currentLine) {
          lines.push(currentLine);
        }
      }
    }

    return lines;
  };

  const downloadPDF = async () => {
    try {
      const pdfBytes = await generatePDF();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template?.title || "template"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF");
    }
  };

  const saveTemplate = () => {
    if (!template) return;

    const updatedTemplate = {
      ...template,
      content: { slides },
      isCustom: true,
    };

    const customTemplates = JSON.parse(
      localStorage.getItem("customTemplates") || "[]"
    );
    const existingIndex = customTemplates.findIndex(
      (t: Template) => t.id === template.id
    );

    if (existingIndex >= 0) {
      customTemplates[existingIndex] = updatedTemplate;
    } else {
      customTemplates.push(updatedTemplate);
    }

    localStorage.setItem("customTemplates", JSON.stringify(customTemplates));
    alert("Template saved successfully!");
  };

  const useForSigning = async () => {
    if (!template?.title.trim()) {
      alert("Please enter a template title");
      return;
    }

    setSaving(true);
    try {
      const pdfBytes = await generatePDF();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      const formData = new FormData();
      formData.append("document", blob, `${template.title}.pdf`);
      formData.append("title", template.title);
      formData.append("ownerEmail", userEmail);
      formData.append("note", `Created from template: ${template.title}`);

      const response = await axios.post(
        `${API_URL}/api/documents/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        // Update usage count
        if (template.isCustom) {
          const customTemplates = JSON.parse(
            localStorage.getItem("customTemplates") || "[]"
          );
          const templateIndex = customTemplates.findIndex(
            (t: Template) => t.id === template.id
          );
          if (templateIndex >= 0) {
            customTemplates[templateIndex].usageCount += 1;
            localStorage.setItem(
              "customTemplates",
              JSON.stringify(customTemplates)
            );
          }
        }

        navigate(`/document/${response.data.document.id}`);
      }
    } catch (error) {
      console.error("Failed to create document from template:", error);
      alert("Failed to create document from template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Template not found
        </h3>
        <p className="text-gray-500 mb-4">
          The template you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/templates")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/templates")}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <input
                type="text"
                value={template.title}
                onChange={(e) => updateTemplateInfo({ title: e.target.value })}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                placeholder="Template Title"
              />
              <input
                type="text"
                value={template.description}
                onChange={(e) =>
                  updateTemplateInfo({ description: e.target.value })
                }
                className="block text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 mt-1"
                placeholder="Template description"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={saveTemplate}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Template</span>
            </button> */}
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={useForSigning}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{saving ? "Creating..." : "Use for Signing"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Slide Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Slide Buttons */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Add Slide
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => addSlide("title")}
                  className="w-full bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                >
                  <Type className="h-4 w-4" />
                  <span>Title Slide</span>
                </button>
                <button
                  onClick={() => addSlide("content")}
                  className="w-full bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2"
                >
                  <AlignLeft className="h-4 w-4" />
                  <span>Content Slide</span>
                </button>
                <button
                  onClick={() => addSlide("description")}
                  className="w-full bg-purple-100 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
                >
                  <DescIcon className="h-4 w-4" />
                  <span>Description Only</span>
                </button>
              </div>
            </div>

            {/* Slide Editor */}
            {currentSlide && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Edit{" "}
                    {currentSlide.type === "title"
                      ? "Title"
                      : currentSlide.type === "content"
                      ? "Content"
                      : "Description"}{" "}
                    Slide
                  </h3>
                  {slides.length > 1 && (
                    <button
                      onClick={() => deleteSlide(currentSlideIndex)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {currentSlide.type !== "description" && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        {currentSlide.type === "title"
                          ? "Main Title"
                          : "Section Title"}
                      </label>
                      <input
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => updateSlide({ title: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder={
                          currentSlide.type === "title"
                            ? "Enter main title"
                            : "Enter section title"
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      {currentSlide.type === "title"
                        ? "Subtitle"
                        : currentSlide.type === "content"
                        ? "Content"
                        : "Description"}
                    </label>
                    <textarea
                      value={currentSlide.content}
                      onChange={(e) => updateSlide({ content: e.target.value })}
                      rows={
                        currentSlide.type === "title"
                          ? 2
                          : currentSlide.type === "content"
                          ? 6
                          : 8
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                      placeholder={
                        currentSlide.type === "title"
                          ? "Enter subtitle"
                          : currentSlide.type === "content"
                          ? "Enter your content here..."
                          : "Enter your description here..."
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-3">
            {/* Slide Tabs */}
            <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
              {slides.map((slide, index) => (
                <div key={slide.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      currentSlideIndex === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {slide.type === "title" ? (
                      <Type className="h-3 w-3" />
                    ) : slide.type === "content" ? (
                      <AlignLeft className="h-3 w-3" />
                    ) : (
                      <DescIcon className="h-3 w-3" />
                    )}
                    <span>
                      {slide.type === "title"
                        ? "Title"
                        : slide.type === "content"
                        ? "Content"
                        : "Description"}{" "}
                      {index + 1}
                    </span>
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={() => deleteSlide(index)}
                      className="ml-1 text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Slide Preview */}
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 p-4">
              <div
                className="bg-white shadow-lg mx-auto"
                style={{
                  width: "595px",
                  height: "842px",
                  transform: "scale(0.7)",
                  transformOrigin: "top center",
                }}
              >
                {currentSlide && (
                  <div className="p-16 h-full">
                    {currentSlide.type === "title" ? (
                      // Title slide preview
                      <div className="flex flex-col justify-center h-full text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
                          {currentSlide.title || "Document Title"}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {currentSlide.content || "Subtitle or description"}
                        </p>
                      </div>
                    ) : currentSlide.type === "content" ? (
                      // Content slide preview
                      <div className="h-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                          {currentSlide.title || "Section Title"}
                        </h2>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {currentSlide.content || "Enter your content here..."}
                        </div>
                      </div>
                    ) : (
                      // Description-only slide preview
                      <div className="h-full pt-8">
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {currentSlide.content ||
                            "Enter your description here..."}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Template Editor:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Edit template content using the controls on the left</li>
                <li>• Add multiple slides to create comprehensive templates</li>
                <li>• Save your changes to preserve the template</li>
                <li>• Download as PDF or use directly for signing workflow</li>
                <li>
                  • Use [PLACEHOLDER] text for fields that need to be filled in
                  later
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
