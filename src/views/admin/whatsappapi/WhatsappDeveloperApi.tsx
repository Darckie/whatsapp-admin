import React, { useState } from "react";
import { BsEye, BsEyeSlash, BsFileEarmarkText } from "react-icons/bs";

export default function WhatsAppDeveloperTools() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showClientId, setShowClientId] = useState(false);

  const apiErrors = [
    { code: 0, message: "Success", http: "200 OK" },
    { code: 1000, message: "Unknown error occurred. Please try again later or contact support.", http: "500 Internal Server Error" },
    { code: 1001, message: "Template name should not contain spaces, special characters (except '_'), and should be in lowercase.", http: "400 Bad Request" },
    { code: 1002, message: "Template name exceeds 512 characters.", http: "400 Bad Request" },
    { code: 1003, message: "Invalid template category.", http: "400 Bad Request" },
    { code: 1004, message: "Invalid language code.", http: "400 Bad Request" },
    { code: 1005, message: "Template exists but not approved by Meta. Ensure it’s reviewed and approved before use.", http: "422 Unprocessable Entity" },
    { code: 1006, message: "Invalid file type. Allowed types: jpg, jpeg, png, mp4, pdf.", http: "400 Bad Request" },
    { code: 1007, message: "Footer length should not exceed 60 characters.", http: "400 Bad Request" },
    { code: 1008, message: "Header text exceeds the allowed character limit (60 characters).", http: "400 Bad Request" },
    { code: 1009, message: "Body text exceeds the allowed character limit (1024 characters).", http: "400 Bad Request" },
    { code: 1010, message: "Invalid connector name.", http: "400 Bad Request" },
    { code: 1011, message: "Invalid mobile numbers in the campaign.", http: "400 Bad Request" },
    { code: 1012, message: "Template with WABAID or MetaTemplateId does not exist.", http: "404 Not Found" },
    { code: 1013, message: "Invalid language code for campaign.", http: "400 Bad Request" },
    { code: 1014, message: "Insufficient credits for campaign.", http: "422 Unprocessable Entity" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <h1 className="text-lg font-semibold text-gray-700 border-b border-gray-300 pb-2">
          API Documents
        </h1>

        {/* API Credentials Section */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-100 px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-700">
              API Credentials
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* API Key Field */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">API Key</label>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  readOnly
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="rounded border border-gray-300 p-2 hover:bg-gray-50"
                >
                  {showApiKey ? (
                    <BsEyeSlash className="text-gray-600" />
                  ) : (
                    <BsEye className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Client ID Field */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <label className="w-32 text-sm font-medium text-gray-700">Client ID</label>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type={showClientId ? "text" : "password"}
                  value="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  readOnly
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={() => setShowClientId(!showClientId)}
                  className="rounded border border-gray-300 p-2 hover:bg-gray-50"
                >
                  {showClientId ? (
                    <BsEyeSlash className="text-gray-600" />
                  ) : (
                    <BsEye className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <div className="pt-2">
              <button className="flex items-center gap-2 rounded bg-teal-400 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-all">
                <BsFileEarmarkText /> View API Document
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp API Error Codes Section */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-100 px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-700">
              WhatsApp API Error Codes
            </h2>
          </div>

          {/* Error Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">Error Code</th>
                  <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">Error Message</th>
                  <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">HTTP Status Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apiErrors.map((err) => (
                  <tr key={err.code} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{err.code}</td>
                    <td className="px-4 py-2 text-gray-700">{err.message}</td>
                    <td className="px-4 py-2 text-gray-700">{err.http}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
