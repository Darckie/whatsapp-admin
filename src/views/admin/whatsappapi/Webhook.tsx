import React, { useState } from "react";
import { BsX } from "react-icons/bs";


export default function WebhookConfigurations() {
  const [openModal, setOpenModal] = useState(false);

  const [params, setParams] = useState([
    { key: "messageid", value: "#messageid#" },
    { key: "status", value: "#status#" },
    { key: "errorCode", value: "#errorCode#" },
    { key: "timeStamp", value: "#timeStamp#" },
    { key: "receiverNumber", value: "#recipient_id#" },
  ]);

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addParam = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setParams([...params, { key: newKey, value: newValue }]);
    setNewKey("");
    setNewValue("");
  };

  const removeParam = (index:number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* ---------- PAGE HEADER ---------- */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-300">
          <h1 className="text-lg font-semibold text-gray-700">
            Webhook Configurations
          </h1>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-teal-400 hover:bg-teal-500 transition text-white text-sm font-medium px-4 py-2 rounded"
          >
            + Add New Webhook
          </button>
        </div>

        {/* ---------- EMPTY TABLE (for now) ---------- */}
        <div className="mt-4 border border-gray-200 shadow-sm rounded bg-white p-4">
          <p className="text-gray-600 text-sm">No data available in the table</p>
        </div>
      </div>


      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl w-[700px] max-h-[90vh] overflow-y-auto border border-gray-300">
            
            {/* ------- Modal Header ------- */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-300 bg-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">
                Manage Webhook
              </h2>
              <button onClick={() => setOpenModal(false)}>
                <BsX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* ------- Modal Body ------- */}
            <div className="px-6 py-4 space-y-4">
              
              {/* Name */}
              <div>
                <label className="text-sm text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Enter Endpoint Name"
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Endpoint Base URL */}
              <div>
                <label className="text-sm text-gray-700">Endpoint Base URL</label>
                <input
                  type="text"
                  placeholder="Enter HTTP Callback URL"
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Method */}
              <div>
                <label className="text-sm text-gray-700">Method</label>
                <select className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm">
                  <option>GET</option>
                  <option>POST</option>
                </select>
              </div>

              {/* ---------- PARAMETERS TABLE ---------- */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Parameters
                </label>

                <div className="grid grid-cols-3 text-sm font-semibold text-gray-700 mb-1">
                  <p>KEYS</p>
                  <p>VALUES</p>
                  <p>Action</p>
                </div>

                <div className="space-y-2">
                  {params.map((p, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3 items-center">
                      <input
                        value={p.key}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        readOnly
                      />
                      <input
                        value={p.value}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        readOnly
                      />
                      <button
                        onClick={() => removeParam(i)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new param */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Key"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value"
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={addParam}
                    className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="text-xs text-gray-600 border border-gray-300 p-3 rounded mt-4 bg-gray-50">
                <p>1. Parameters should be in Key-Value format.</p>
                <p>2. Additional Key-Value pairs can be configured.</p>
                <p>3. Type hash(#) in the value column to display system variables.</p>
                <p>4. System variables are appended within double hashes (##).</p>
                <p>5. Custom variables should not contain opening and closing hashes (##).</p>
              </div>
            </div>

            {/* ------- Modal Footer ------- */}
            <div className="flex justify-end gap-3 px-6 py-3 border-t bg-gray-50">
              <button className="bg-yellow-500 text-white px-4 py-2 text-sm rounded hover:bg-yellow-600">
                Test
              </button>
              <button className="bg-teal-600 text-white px-4 py-2 text-sm rounded hover:bg-teal-700">
                Save
              </button>
              <button
                onClick={() => setOpenModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
