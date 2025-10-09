import React from 'react';
import { CheckCircle, FileText, ExternalLink, Calendar } from 'lucide-react';

interface GovernmentScheme {
  id: number;
  name: string;
  category: string;
  description: string;
  eligibility: string[];
  benefits: string;
  detailsUrl?: string;
}

const GovernmentSchemes: React.FC = () => {
  // ✅ List of Government Schemes for Farmers
  const schemes: GovernmentScheme[] = [
    {
      id: 1,
      name: "PM-KISAN Samman Nidhi",
      category: "Financial Support",
      description:
        "Provides direct financial assistance of ₹6,000 annually to eligible landholding small and marginal farmers in three equal installments to meet their farming and domestic needs.",
      eligibility: [
        "Small and marginal landholding farmers",
        "Must have cultivable land records in their name",
      ],
      benefits:
        "₹6,000 per year in three equal installments directly transferred to bank accounts.",
      detailsUrl: "https://pmkisan.gov.in/",
    },
    {
      id: 2,
      name: "Pradhan Mantri Kisan MaanDhan Yojana (PM-KMY)",
      category: "Financial Support",
      description:
        "Offers a pension to small and marginal farmers, where both the farmer and the Central Government contribute monthly amounts to a pension fund until the farmer reaches age 60.",
      eligibility: [
        "Small and marginal farmers aged between 18 and 40 years",
        "Should not be a taxpayer",
      ],
      benefits: "Assured monthly pension of ₹3,000 after the age of 60.",
      detailsUrl: "https://maandhan.in/",
    },
    {
      id: 3,
      name: "Interest Subvention Scheme",
      category: "Financial Support",
      description:
        "Provides interest subsidies to farmers for crop loans and dairy development activities to promote timely repayment and reduce financial burden.",
      eligibility: [
        "Farmers availing short-term crop loans up to ₹3 lakh",
        "Timely repayment required to avail full subvention",
      ],
      benefits: "Up to 3% interest subvention on crop and dairy loans.",
      detailsUrl: "https://www.nabard.org/",
    },
    {
      id: 4,
      name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
      category: "Agricultural Support",
      description:
        "Aims to improve irrigation access and promote efficient water use in agriculture through micro-irrigation and watershed development.",
      eligibility: [
        "Farmers involved in irrigation and agricultural activities",
        "Priority to water-scarce regions",
      ],
      benefits:
        "Financial assistance for drip/sprinkler irrigation systems and water resource development.",
      detailsUrl: "https://pmksy.gov.in/",
    },
    {
      id: 5,
      name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
      category: "Insurance",
      description:
        "Provides financial support to farmers in case of crop loss due to natural calamities, pests, or diseases.",
      eligibility: [
        "All farmers growing notified crops in notified areas",
        "Both loanee and non-loanee farmers are eligible",
      ],
      benefits: "Covers yield losses and provides compensation based on sum insured.",
      detailsUrl: "https://pmfby.gov.in/",
    },
    {
      id: 6,
      name: "Organic Farming Promotion Scheme",
      category: "Agricultural Support",
      description:
        "Promotes commercial production of organic inputs and encourages farmers to adopt sustainable and eco-friendly practices.",
      eligibility: [
        "Farmers or groups engaged in organic cultivation",
        "Must register with certified organic associations",
      ],
      benefits: "Subsidies for organic inputs and certification support.",
      detailsUrl: "https://pgsindia-ncof.gov.in/",
    },
    {
      id: 7,
      name: "Sub-Mission on Agricultural Mechanization (SMAM)",
      category: "Technology",
      description:
        "Encourages the adoption of advanced agricultural machinery and drone technology by providing subsidies for purchasing drones and offering rental services.",
      eligibility: [
        "Individual farmers and custom hiring centers",
        "Preference to small and marginal farmers",
      ],
      benefits: "Up to 50% subsidy on purchase of machinery and drones.",
      detailsUrl: "https://agrimachinery.nic.in/",
    },
    {
      id: 8,
      name: "National Livestock Mission (NLM)",
      category: "Agricultural Support",
      description:
        "Aims to develop entrepreneurship and generate employment in the livestock sector through breed improvement and infrastructure support.",
      eligibility: [
        "Farmers, self-help groups, and entrepreneurs in the livestock sector",
      ],
      benefits:
        "Financial assistance for breed development, fodder cultivation, and animal health support.",
      detailsUrl: "https://nlm.udyamimitra.in/",
    },
    {
      id: 9,
      name: "Dairy Entrepreneurship Development Scheme (DEDS)",
      category: "Agricultural Support",
      description:
        "Provides financial assistance for setting up dairy farms and other dairy-related ventures to enhance rural income.",
      eligibility: [
        "Individuals, groups, and institutions engaged in dairy farming",
      ],
      benefits: "Back-ended capital subsidy up to 25% of project cost.",
      detailsUrl: "https://www.nabard.org/",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Government Schemes</h2>
        <p className="text-gray-600">
          Explore and apply for various government schemes and benefits available for farmers.
        </p>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.name}</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  {scheme.category}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{scheme.description}</p>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Eligibility</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {scheme.eligibility.map((criteria, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Benefits</h4>
                <p className="text-sm text-emerald-600 font-medium">{scheme.benefits}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <a
                href={scheme.detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm text-center"
              >
                Apply Now
              </a>
              <a
                href={scheme.detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center space-x-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Details</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {schemes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
          <p className="text-gray-600">
            Try reloading the page to view available government schemes.
          </p>
        </div>
      )}
    </div>
  );
};

export default GovernmentSchemes;
