import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsPlus, BsSearch, BsTrash3 } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import FlowBuilderPage from "./FlowBuilderPage";
import api from "../../../lib/api";

type BotFlowCol = {
  id: number;
  flowName: string;
  createdAt: string;
  createdBy: string;
  status: string;
};

export default function BotManager() {
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [rawData, setRawData] = useState<BotFlowCol[]>([]);
  const [data, setData] = useState<BotFlowCol[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const columns: ColumnDef<BotFlowCol>[] = [
    {
      accessorKey: "flowName",
      header: "Flow Name",
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => info.getValue() as string,
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <div className="text-black lg:flex-nowrap sm:flex-wrap flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-100"
              onClick={() => handleEdit(rowData.id)}
            >
              <FiEdit className="text-gray-600 w-4 h-4" /> Edit
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-gray-100"
              onClick={() => handleDelete(rowData.id)}
            >
              <BsTrash3 className="text-red-600 w-4 h-4" /> Delete
            </button>
          </div>
        );
      },
    },
  ];

  const loadFlows = useCallback(async () => {
    try {
      const rsp = await api.get("/bot-routes/bot-flows");
      const rows = rsp.data?.data || [];
      const mapped: BotFlowCol[] = rows.map((f: any, idx: number) => ({
        id: f.id ?? idx + 1,
        flowName: f.name,
        createdAt: f.createdAt ? new Date(f.createdAt).toLocaleString() : "",
        createdBy: f.createdBy || "—",
        status: f.status,
      }));
      setRawData(mapped);
      setData(mapped);
    } catch (err) {
      console.error("Failed to load bot flows", err);
      toast.error("Failed to load bot flows");
    }
  }, []);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  // Add / Edit
  const handleAdd = () => {
    // For new flow, use a generated id or "new"
    const newId = String(Date.now());
    setEditingFlowId(newId);
    setShowBuilder(true);
  };

  const handleEdit = (id: number) => {
    setEditingFlowId(String(id));
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingFlowId(null);
  };

  // Delete
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this flow?");
    if (!confirmed) return;

    try {
      await api.delete(`/bot-routes/bot-flows/${id}`);
      setRawData((prev) => prev.filter((f) => f.id !== id));
      setData((prev) => prev.filter((f) => f.id !== id));
      toast.success("Flow deleted");
    } catch (err) {
      console.error("Failed to delete flow", err);
      toast.error("Failed to delete flow");
    }
  };

  // Search
  const applyFilter = useCallback(
    (inputText: string) => {
      if (!inputText) {
        setData(rawData);
        setPageIndex(0);
        return;
      }
      const filtered = rawData.filter((obj) =>
        Object.values(obj).some((val) =>
          String(val).toLowerCase().includes(inputText.toLowerCase())
        )
      );
      setData(filtered);
      setPageIndex(0);
    },
    [rawData]
  );

  const debouncedFilter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      applyFilter(searchInput);
    }, 400);
  }, [searchInput, applyFilter]);

  useEffect(() => {
    debouncedFilter();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [debouncedFilter]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const pageCount = table.getPageCount();

  return (
    <div className="w-full min-h-screen flex justify-center bg-gray-50">
      <div className="p-6 w-full max-w-5xl">
        <div className="w-full flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
          >
            <BsPlus className="text-white w-5 h-5" /> Add New Flow
          </button>
        </div>

        <div className="flex items-center justify-between my-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page</span>
            <select
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              className="p-2 border rounded-md text-sm"
              value={pageSize}
            >
              {[5, 10, 20, 50].map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              value={searchInput}
              type="text"
              className="p-2 pl-9 border rounded-md text-sm w-64"
              placeholder="Search"
            />
          </div>
        </div>

        <div className="w-full bg-white rounded-md shadow-sm border border-gray-200">
          <table className="min-w-full w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
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
            <tbody className="bg-white divide-y divide-gray-100 w-full">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-3 whitespace-nowrap text-sm text-gray-700"
                    >
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
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No flows found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
            <div className="text-gray-600">
              Page {pageIndex + 1} of {pageCount || 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-40"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBuilder &&
        editingFlowId &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-500 bg-opacity-70 w-full h-full">
            <div className="flex p-4 w-[90vw] h-[98vh] bg-white rounded-md shadow-md">
              <FlowBuilderPage
                flowId={editingFlowId}
                onBack={handleCloseBuilder}
                onSaved={loadFlows}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
