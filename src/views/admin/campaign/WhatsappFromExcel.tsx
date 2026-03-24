// src/views/campaign/WhatsappFromExcel.tsx
import React, { useRef, useState } from "react";
import { BsFileEarmarkExcel, BsEye } from "react-icons/bs";

export default function WhatsappFromExcel() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onChooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFileName(f.name);
    } else {
      setFileName(null);
    }
  };

  const onUpload = () => {
    // TODO: upload fileRef.current.files[0] via API
    alert("Upload not implemented (hook up your API)");
  };

  const onViewSample = () => {
    // TODO: download or open sample excel
    alert("Download sample - implement endpoint");
  };

  return (
    <main className="p-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-md bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-navy-700">WhatsApp Campaign From Excel</h2>
            <div className="text-sm text-gray-500">Upload contacts via file (Excel/CSV)</div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Choose File</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xls,.xlsx,.csv,.txt"
                  onChange={onChooseFile}
                  className="block"
                />
                {/* <div className="text-sm text-gray-600">{fileName ?? "No file chosen"}</div> */}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onViewSample}
                className="rounded border border-brand-200 bg-transparent px-4 py-2 text-sm font-medium text-brand-500 hover:text-white hover:border-teal-300 hover:bg-teal-400"
              >
                <BsEye className="inline mr-2" />
                View sample
              </button>
              <button
                onClick={onUpload}
                className="rounded bg-teal-400 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 flex items-center gap-2"
              >
                <BsFileEarmarkExcel />
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
