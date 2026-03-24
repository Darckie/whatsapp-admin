import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";
import { MdSelectAll } from "react-icons/md";
import { RiUpload2Fill } from "react-icons/ri";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

type Template = {
  id: number;
  templateName: string;
  category: string;
  language: string;
  status: string;
  expiresIn: string;
  createDate: string;
  body_text: string;
  isSystem: boolean;
};

type ApiTemplate = {
  name: string;
  language: string;
  category: string;
  createdAt: string;
  body_text: string;
  system_tmp?: boolean;
  raw?: {
    status?: string;
    createdAt?: string;
    lastUpdatedAt?: string;
  };
};

type BulkHistoryItem = {
  id: number;
  runDate: string;
  templateName: string;
  total: number;
  success: number;
  failed: number;
};

export default function BulkUserUploader() {
  const [loading, setLoading] = useState(false);

  const [selectedFileName, setSelectedFileName] = useState("No file chosen");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressText, setProgressText] = useState("");

  const [templateData, setTemplateData] = useState<Template[]>([]);
  const [rawTemplateData, setRawTemplateData] = useState<any[]>([]);
  const [history, setHistory] = useState<BulkHistoryItem[]>([]);

  // pagination state (controlled)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    fncTofetchTemplate();
    fetchBulkHistory();
  }, []);

  const fncTofetchTemplate = async () => {
    try {
      const rsp = await api.get("/chat/admin/template-details/");
      const apiData = rsp.data;
      const data = (apiData.templates as ApiTemplate[]) || [];
      setRawTemplateData(apiData.templates || []);

      const mapped: Template[] = data.map((item, index) => {
        const created = item.createdAt || item.raw?.createdAt || "";
        const status = item.raw?.status || "UNKNOWN";
        return {
          id: index + 1,
          templateName: item.name,
          category: item.category,
          language: item.language,
          status,
          expiresIn: "-",
          createDate: created ? new Date(created).toLocaleString() : "",
          body_text: item.body_text || "",
          isSystem: item.system_tmp || false,
        };
      });

      setTemplateData(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch templates");
    }
  };

  const fetchBulkHistory = async () => {
    try {
      setLoading(true);
      const rsp = await api.get("/admin/bulk-whatsapp-lead-runs");
      const rows = rsp.data?.data || [];

      const mapped: BulkHistoryItem[] = rows.map((r: any, index: number) => ({
        id: r.id ?? index + 1,
        runDate: r.started_at
          ? new Date(r.started_at).toLocaleString()
          : "",
        templateName: `${r.template_name} (${r.template_type})`,
        total: Number(r.total_count || 0),
        success: Number(r.success_count || 0),
        failed: Number(r.failed_count || 0),
      }));

      setHistory(mapped);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch bulk history", err);
      toast.error("Failed to fetch bulk history");
      setLoading(false);
    }
  };

  const handleUploadExcel = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file first");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("templateName", selectedTemplate);

    const tem = templateData.filter(
      (t) => t.templateName === selectedTemplate
    );
    const tempType: any = tem[0]?.category || "";
    formData.append("templateType", tempType);

    try {
      setUploading(true);
      setShowProgress(false);
      setProgressText("");

      const rsp = await api.post("/admin/bulk-whatsapp-leads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(rsp.data?.message || "File uploaded successfully");

      const totalRows = rsp.data?.data?.totalRows || 0;

      setUploading(false);
      setShowProgress(true);

      const total = totalRows || 6;
      let current = 0;
      const totalDurationMs = 5000;
      const stepCount = total;
      const stepDuration = Math.max(
        400,
        Math.floor(totalDurationMs / stepCount)
      );

      const intervalId = setInterval(() => {
        current += 1;
        if (current <= total) {
          setProgressText(`${current}/${total} messages processed...`);
        } else {
          clearInterval(intervalId);
          setProgressText("Completed");
          setTimeout(() => setShowProgress(false), 800);
        }
      }, stepDuration);

      await fetchBulkHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload file");
      console.error(err);
      setUploading(false);
      setShowProgress(false);
    }
  };

  // ----------------------
  // TanStack table setup
  // ----------------------
  const columns = useMemo<ColumnDef<BulkHistoryItem>[]>(
    () => [
      {
        accessorKey: "runDate",
        header: "Run date",
        cell: (info) => info.getValue() as string,
      },
      {
        accessorKey: "templateName",
        header: "Template",
        cell: (info) => info.getValue() as string,
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: (info) => (
          <span className="text-right block">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "success",
        header: "Success",
        cell: (info) => (
          <span className="text-right block text-green-600">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: "failed",
        header: "Failed",
        cell: (info) => (
          <span className="text-right block text-red-500">
            {info.getValue() as number}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: history,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-[1400px]">
          <div className="rounded-md bg-white p-6 shadow-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const currentPage = pagination.pageIndex + 1;
  const pageCount = table.getPageCount() || 1;

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Bulk upload bar */}
        <div className="flex flex-wrap w-[50vw] items-center justify-between gap-3 rounded-md bg-white px-4 py-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <label
              className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded-sm cursor-pointer
               bg-blue-500 border border-blue-500 text-white hover:bg-blue-600 active:bg-blue-700
               shadow-sm text-sm font-medium"
            >
              <MdSelectAll className="w-4 h-4" />
              <span>Select Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  setSelectedFileName(file ? file.name : "No file chosen");
                }}
              />
            </label>

            <span className="text-xs text-gray-600 max-w-[260px] truncate">
              {selectedFileName}
            </span>
          </div>

          <select
            className="text-sm border w-[220px] border-gray-100 rounded-md px-3 py-2 bg-white text-gray-700
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Select template</option>
            {templateData.map((t) => (
              <option key={t.id} value={t.templateName}>
                {t.templateName} ({t.language})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="flex items-center gap-2 rounded bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={
              !selectedTemplate || !selectedFile || uploading || showProgress
            }
            onClick={handleUploadExcel}
          >
            {(uploading || showProgress) && (
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <RiUpload2Fill />
            <span>
              {uploading
                ? "Uploading..."
                : showProgress
                ? "Processing..."
                : "Send bulk"}
            </span>
          </button>
        </div>

        {/* Monthly / recent bulk history with pagination */}
        <div className="rounded-md bg-white p-4 shadow-sm border border-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              This month bulk upload history
            </h3>
            <span className="text-[11px] text-gray-500">
              Last {history.length} runs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-3 py-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 text-gray-700">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-4 text-center text-[11px] text-gray-500"
                    >
                      No bulk uploads found for this month.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-600">
            <div className="flex items-center gap-2">
              <button
                className="border rounded px-2 py-1 disabled:opacity-40"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </button>
              <button
                className="border rounded px-2 py-1 disabled:opacity-40"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
              <span className="ml-2">
                Page {currentPage} of {pageCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="border rounded px-1 py-0.5 bg-white"
                value={pagination.pageSize}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                    pageIndex: 0,
                  }))
                }
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(uploading || showProgress) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
            <div className="flex  items-center gap-3 rounded-lg bg-white px-7 py-4 shadow-md border border-gray-100">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
              <span className="text-sm text-gray-600">
                {uploading
                  ? "Uploading Excel..."
                  : progressText || "Processing..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
