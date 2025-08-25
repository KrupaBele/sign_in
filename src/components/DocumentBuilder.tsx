import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Download,
  Send,
  FileText,
  Type,
  AlignLeft,
  FileText as DescIcon,
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

const DocumentBuilder = () => {
  const navigate = useNavigate();
  const { userEmail } = useDocuments();
  const [documentTitle, setDocumentTitle] = useState("New Document");
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      type: "title",
      title: "Document Title",
      content: "Subtitle or description",
    },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [saving, setSaving] = useState(false);

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
      a.download = `${documentTitle}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF");
    }
  };

  const saveAndUseForSigning = async () => {
    if (!documentTitle.trim()) {
      alert("Please enter a document title");
      return;
    }

    setSaving(true);
    try {
      const pdfBytes = await generatePDF();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      const formData = new FormData();
      formData.append("document", blob, `${documentTitle}.pdf`);
      formData.append("title", documentTitle);
      formData.append("ownerEmail", userEmail);
      formData.append("note", "Created with Document Builder");

      const response = await axios.post(
        `${API_URL}/api/documents/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        navigate(`/document/${response.data.document.id}`);
      }
    } catch (error) {
      console.error("Failed to save document:", error);
      alert("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            placeholder="Document Title"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={saveAndUseForSigning}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{saving ? "Saving..." : "Save & Use for Signing"}</span>
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
                How to use:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • <strong>Title Slide:</strong> Perfect for document covers
                  with main title and subtitle
                </li>
                <li>
                  • <strong>Content Slide:</strong> For sections with title and
                  body text (automatically distributed)
                </li>
                <li>
                  • <strong>Description Only:</strong> Pure content without
                  title - perfect for detailed descriptions
                </li>
                <li>
                  • Use the editor on the left to modify the current slide
                </li>
                <li>• Add multiple slides to create comprehensive documents</li>
                <li>• Download as PDF or save and use for signing workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentBuilder;
