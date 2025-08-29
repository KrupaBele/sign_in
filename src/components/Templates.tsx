import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookTemplate as FileTemplate,
  Plus,
  Download,
  Send,
  Edit,
  Trash2,
  Eye,
  Copy,
} from "lucide-react";
import { useDocuments } from "../context/DocumentContext";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  content: any;
  isCustom: boolean;
  createdAt: string;
  usageCount: number;
}

const Templates = () => {
  const { userEmail } = useDocuments();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "business", name: "Business" },
    { id: "legal", name: "Legal" },
    { id: "hr", name: "HR & Employment" },
    { id: "real-estate", name: "Real Estate" },
    { id: "personal", name: "Personal" },
    { id: "custom", name: "My Templates" },
  ];

  const predefinedTemplates: Template[] = [
    {
      id: "nda-template",
      title: "Non-Disclosure Agreement",
      description:
        "Standard NDA template for protecting confidential information",
      category: "legal",
      thumbnail: "/api/placeholder/300/200",
      content: {
        slides: [
          {
            id: "1",
            type: "title",
            title: "NON-DISCLOSURE AGREEMENT",
            content: "Confidential Information Protection",
          },
          {
            id: "2",
            type: "content",
            title: "Parties",
            content:
              'This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between:\n\nDisclosing Party: [COMPANY NAME]\nAddress: [COMPANY ADDRESS]\n\nReceiving Party: [RECIPIENT NAME]\nAddress: [RECIPIENT ADDRESS]',
          },
          {
            id: "3",
            type: "content",
            title: "Definition of Confidential Information",
            content:
              'For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged.\n\nThis includes but is not limited to:\n• Technical data, trade secrets, know-how\n• Business plans, customer lists, financial information\n• Software, algorithms, and proprietary processes\n• Any other information marked as confidential',
          },
          {
            id: "4",
            type: "content",
            title: "Obligations of Receiving Party",
            content:
              "Receiving Party agrees to:\n\n1. Hold and maintain the Confidential Information in strict confidence\n2. Not disclose the Confidential Information to any third parties\n3. Not use the Confidential Information for any purpose other than evaluating potential business relationships\n4. Take reasonable precautions to protect the confidentiality of the information\n5. Return or destroy all Confidential Information upon request",
          },
          {
            id: "5",
            type: "content",
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
      thumbnail: "/api/placeholder/300/200",
      content: {
        slides: [
          {
            id: "1",
            type: "title",
            title: "EMPLOYMENT AGREEMENT",
            content: "Terms and Conditions of Employment",
          },
          {
            id: "2",
            type: "content",
            title: "Employment Details",
            content:
              "Employee Name: [EMPLOYEE NAME]\nPosition: [JOB TITLE]\nDepartment: [DEPARTMENT]\nStart Date: [START DATE]\nReporting Manager: [MANAGER NAME]\n\nEmployment Type: [FULL-TIME/PART-TIME/CONTRACT]\nWork Location: [OFFICE ADDRESS/REMOTE/HYBRID]",
          },
          {
            id: "3",
            type: "content",
            title: "Compensation and Benefits",
            content:
              "Base Salary: $[AMOUNT] per [YEAR/MONTH]\nPayment Schedule: [MONTHLY/BI-WEEKLY]\n\nBenefits Include:\n• Health insurance coverage\n• Dental and vision insurance\n• Retirement plan (401k) with company matching\n• Paid time off (PTO): [NUMBER] days annually\n• Professional development opportunities\n• [OTHER BENEFITS]",
          },
          {
            id: "4",
            type: "content",
            title: "Responsibilities and Expectations",
            content:
              "Key Responsibilities:\n• [PRIMARY RESPONSIBILITY 1]\n• [PRIMARY RESPONSIBILITY 2]\n• [PRIMARY RESPONSIBILITY 3]\n• [ADDITIONAL DUTIES AS ASSIGNED]\n\nPerformance Standards:\n• Meet or exceed established performance metrics\n• Maintain professional conduct and appearance\n• Comply with company policies and procedures\n• Participate in required training and development programs",
          },
          {
            id: "5",
            type: "content",
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
      thumbnail: "/api/placeholder/300/200",
      content: {
        slides: [
          {
            id: "1",
            type: "title",
            title: "SERVICE AGREEMENT",
            content: "Professional Services Contract",
          },
          {
            id: "2",
            type: "content",
            title: "Service Provider and Client",
            content:
              "Service Provider: [PROVIDER NAME]\nBusiness Address: [PROVIDER ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]\n\nClient: [CLIENT NAME]\nBusiness Address: [CLIENT ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]",
          },
          {
            id: "3",
            type: "content",
            title: "Scope of Services",
            content:
              "The Service Provider agrees to provide the following services:\n\n• [SERVICE DESCRIPTION 1]\n• [SERVICE DESCRIPTION 2]\n• [SERVICE DESCRIPTION 3]\n• [ADDITIONAL SERVICES]\n\nDeliverables:\n• [DELIVERABLE 1] - Due: [DATE]\n• [DELIVERABLE 2] - Due: [DATE]\n• [DELIVERABLE 3] - Due: [DATE]",
          },
          {
            id: "4",
            type: "content",
            title: "Payment Terms",
            content:
              "Total Contract Value: $[AMOUNT]\nPayment Schedule: [SCHEDULE]\n\nPayment Terms:\n• [PERCENTAGE]% upon signing this agreement\n• [PERCENTAGE]% upon completion of milestone 1\n• [PERCENTAGE]% upon final delivery\n\nLate Payment: Interest of [RATE]% per month will be charged on overdue amounts.\n\nExpenses: Client will reimburse reasonable expenses with prior approval.",
          },
          {
            id: "5",
            type: "content",
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
      thumbnail: "/api/placeholder/300/200",
      content: {
        slides: [
          {
            id: "1",
            type: "title",
            title: "RESIDENTIAL RENTAL AGREEMENT",
            content: "Lease Agreement for Residential Property",
          },
          {
            id: "2",
            type: "content",
            title: "Property and Parties",
            content:
              "Landlord: [LANDLORD NAME]\nAddress: [LANDLORD ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]\n\nTenant: [TENANT NAME]\nCurrent Address: [CURRENT ADDRESS]\nPhone: [PHONE NUMBER]\nEmail: [EMAIL ADDRESS]\n\nRental Property: [PROPERTY ADDRESS]\nUnit: [UNIT NUMBER]\nCity, State, ZIP: [CITY, STATE, ZIP]",
          },
          {
            id: "3",
            type: "content",
            title: "Lease Terms",
            content:
              "Lease Period: [START DATE] to [END DATE]\nMonthly Rent: $[AMOUNT]\nDue Date: [DAY] of each month\nLate Fee: $[AMOUNT] if rent is [DAYS] days late\n\nSecurity Deposit: $[AMOUNT]\nPet Deposit: $[AMOUNT] (if applicable)\n\nUtilities Included: [LIST INCLUDED UTILITIES]\nTenant Responsible For: [LIST TENANT UTILITIES]",
          },
          {
            id: "4",
            type: "content",
            title: "Rules and Responsibilities",
            content:
              "Tenant Responsibilities:\n• Pay rent on time each month\n• Maintain property in good condition\n• No unauthorized alterations to property\n• No subletting without written permission\n• Comply with noise and conduct policies\n• [ADDITIONAL RULES]\n\nLandlord Responsibilities:\n• Maintain property in habitable condition\n• Make necessary repairs promptly\n• Respect tenant's right to quiet enjoyment\n• Provide 24-hour notice before entry (except emergencies)",
          },
          {
            id: "5",
            type: "content",
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
    // Load custom templates from localStorage
    const customTemplates = JSON.parse(
      localStorage.getItem("customTemplates") || "[]"
    );
    setTemplates([...predefinedTemplates]);
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const duplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      title: `${template.title} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };

    const customTemplates = JSON.parse(
      localStorage.getItem("customTemplates") || "[]"
    );
    customTemplates.push(newTemplate);
    localStorage.setItem("customTemplates", JSON.stringify(customTemplates));
    setTemplates([...predefinedTemplates]);
  };

  const deleteTemplate = (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      const customTemplates = JSON.parse(
        localStorage.getItem("customTemplates") || "[]"
      );
      const updatedTemplates = customTemplates.filter(
        (t: Template) => t.id !== templateId
      );
      localStorage.setItem("customTemplates", JSON.stringify(updatedTemplates));
      setTemplates([...predefinedTemplates, ...updatedTemplates]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Document Templates
          </h1>
          <p className="text-gray-600 mt-2">
            Choose from professional templates or create your own
          </p>
        </div>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Template</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileTemplate className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {template.category}
                    </p>
                  </div>
                </div>
                {template.isCustom && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Custom
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Used {template.usageCount} times</span>
                <span>{new Date(template.createdAt).toLocaleDateString()}</span>
              </div> */}

              <div className="flex items-center space-x-2">
                <Link
                  to={`/template/${template.id}`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </Link>

                <button
                  onClick={() => duplicateTemplate(template)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Duplicate Template"
                >
                  <Copy className="h-4 w-4" />
                </button>

                {template.isCustom && (
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileTemplate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first template"}
          </p>
          <Link
            to="/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Templates;
