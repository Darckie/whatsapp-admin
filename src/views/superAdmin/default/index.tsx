"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  BsChatDots,
  BsSearch,
  BsChevronLeft,
  BsChevronRight,
  BsArrowDown,
  BsArrowUpRight,
  BsArrowDownLeft,
  BsExclamationTriangle,
  BsEnvelopeCheck,
  BsEnvelopeX,
  BsBatteryFull,
  BsBroadcastPin,
  BsQuestionCircle,
  BsXSquare,
} from "react-icons/bs";

import type {
  ColumnDef,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import api from "../../../lib/api";

const apiUrl = process.env.REACT_APP_API_URL;

type ChatRow = {
  agent: string | null;
  chatSessionId: string;
  customerMobile: string;
  skillCode: string | null;
  customerName: string | null;
  closedBy: string | null;
  transferTo: string | null;
  disposition: string | null;
  chatStartTime: string | null;
  chatCloseTime: string | null;
  totalSms: number;
  failedCount: number;
  totalSent: number;
  totalReceived: number;
  initiationType: "incoming" | "outgoing" | null;
  live: Boolean | null;
};

type AgentRow = {
  agentId: string | null;
  totalChats: number;
  totalChatTimeSec: number;
  avgChatTimeSec: number;
  BM: number;
  OS: number;
  OT: number;
};

function getTodayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const Dashboard = () => {
  const [fromDate, setFromDate] = useState(getTodayISO);
  const [toDate, setToDate] = useState(getTodayISO);
  const [data, setData] = useState<ChatRow[]>([]);
  const [agentData, setAgentData] = useState<AgentRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const MAX_RANGE_DAYS = 31;
  function getDayDiff(fromISO: string, toISO: string): number {
    const from = new Date(fromISO);
    const to = new Date(toISO);
    return Math.floor(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function validateDateRange(fromISO: string, toISO: string): string | null {
    if (!fromISO || !toISO) return "Both dates are required.";
    const diff = getDayDiff(fromISO, toISO);
    if (diff < 0) return '"From" date must be before "To" date.';
    if (diff > MAX_RANGE_DAYS)
      return `Range cannot be more than ${MAX_RANGE_DAYS} days.`;
    return null;
  }

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [AgentSearch, setAgentSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [agentSorting, setAgentSorting] = useState<SortingState>([]);
  const [agentPagination, setAgentPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // API calls
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams({ fromDate, toDate });
      const res = await api.get(
        `chat/chat-dashboard?${params.toString()}`
      );
     const apiData = res.data;
      if (apiData.success) {
        setData(apiData.data || []);
      } else {
        setData([]);
      }
    } catch (e) {
      console.error("Error fetching dashboard:", e);
      setData([]);
    }
  }, [fromDate, toDate]);

  type AgentStatsResponse = {
    success: boolean;
    data: AgentRow[];
  };

  const fncTOconvertTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

    return `${minutes}:${formattedSeconds} min`;
  };

  const fetchAgentState = useCallback(async () => {
    try {
      const params = new URLSearchParams({ fromDate, toDate });
      const res = await api.get(
        `chat/chat-agent-stats?${params.toString()}`
      );
      const json: AgentStatsResponse = res.data;

      if (json.success) {
        setAgentData(json.data || []);
      } else {
        setAgentData([]);
      }
    } catch (err) {
      console.error("Error fetching agent stats:", err);
      setAgentData([]);
    }
  }, [toDate, fromDate]);

  const fetchDashData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchAgentState()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashData(); // initial load

    const int = setInterval(() => {
      setToDate(getTodayISO);
      setFromDate(getTodayISO);
      fetchDashData();
    }, 60000);

    return () => {
      clearInterval(int);
    };
  }, []);

  const handleApply = useCallback(async () => {
    const v = validateDateRange(fromDate, toDate);
    if (v) {
      setDateError(v);
      return;
    }
    setDateError(null);
    setLoading(true);
    try {
      await fetchDashData();
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Filters
  const filteredData = useMemo(() => {
    const term = globalFilter.toLowerCase();
    let onlyInbound = data.filter(
      (item: any) => item.initiationType !== "outgoing"
    );
    if (!term) return onlyInbound;
    return onlyInbound.filter((row) => {
      return (
        (row.agent || "NA").toLowerCase().includes(term) ||
        (row.chatSessionId || "").toLowerCase().includes(term) ||
        (row.customerMobile || "").toLowerCase().includes(term) ||
        (row.customerName || "").toLowerCase().includes(term) ||
        (row.skillCode || "NA").toLowerCase().includes(term) ||
        (row.disposition || "").toLowerCase().includes(term)
      );
    });
  }, [data, globalFilter]);

  const filteredAgentData = useMemo(() => {
    const cleaned = agentData.filter(
      (item: AgentRow) => item.agentId && item.agentId.trim() !== ""
    );

    const searchedValue = AgentSearch?.trim().toLowerCase() ?? "";
    if (!searchedValue) return cleaned;

    return cleaned.filter((item: AgentRow) => {
      const haystack = [
        item.agentId ?? "",
        String(item.totalChats),
        String(item.totalChatTimeSec),
        String(item.avgChatTimeSec),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchedValue);
    });
  }, [agentData, AgentSearch]);

  // Aggregates
  const totalChats = filteredData.length;
  const totalSent = filteredData.reduce(
    (sum, r) => sum + (r.totalSent || 0),
    0
  );
  const totalReceived = filteredData.reduce(
    (sum, r) => sum + (r.totalReceived || 0),
    0
  );
  const totalFailed = filteredData.reduce(
    (sum, r) => sum + (r.failedCount || 0),
    0
  );

  const liveChats = filteredData.reduce(
    (sum, i) => sum + (i.chatCloseTime ? 0 : 1),
    0
  );

  const AnsweredChats = filteredData.reduce(
    (sum, r) => sum + (r.agent ? 1 : 0),
    0
  );
  const ansChatsSUm = AnsweredChats - liveChats;

  const UnAnsweredChats = filteredData.reduce(
    (sum, i) => sum + (i.agent ? 0 : 1),
    0
  );

  const bmChats = filteredData.reduce(
    (sum, i) => sum + (i.skillCode === "BM" ? 1 : 0),
    0
  );

  const otChats = filteredData.reduce(
    (sum, i) => sum + (i.skillCode === "OT" ? 1 : 0),
    0
  );
  const osChats = filteredData.reduce(
    (sum, i) => sum + (i.skillCode === "OS" ? 1 : 0),
    0
  );
  const nsChats = filteredData.reduce(
    (sum, i) => sum + (i.skillCode ? 0 : 1),
    0
  );

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - 331);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Table columns
  const columns = useMemo<ColumnDef<ChatRow>[]>(
    () => [
      {
        accessorKey: "chatSessionId",
        header: ({ column }) => (
          <button
            className="inline-flex items-center text-[11px] font-semibold text-slate-800"
            onClick={() => column.toggleSorting()}
          >
            Chat Session ID <BsArrowDown className="ml-1 h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="font-mono text-[11px] text-slate-600">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "agent",
        header: ({ column }) => (
          <button
            className="inline-flex items-center text-[11px] font-semibold text-slate-800"
            onClick={() => column.toggleSorting()}
          >
            Agent <BsArrowDown className="ml-1 h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-medium">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "customerMobile",
        header: "Customer Mobile",
        cell: (info) => (
          <span className="text-xs font-medium">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: (info) => (
          <span className="text-xs font-medium">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "skillCode",
        header: "Skill Code",
        cell: (info) => (
          <span className="text-[11px] text-slate-600">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "closedBy",
        header: "Chat Closed By",
        cell: (info) => (
          <span className="text-[11px] text-slate-600">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "transferTo",
        header: "Transfer To",
        cell: (info) => (
          <span className="text-[11px] text-slate-600">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "disposition",
        header: "Disposition",
        cell: (info) => (
          <span className="text-[11px] text-slate-600">
            {info.getValue<string>() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "chatCloseTime",
        header: "Status",
        cell: (info) => {
          const value = info.getValue<string>();
          const isLive = !value;
          return (
            <span
              className={
                isLive
                  ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                  : "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700"
              }
            >
              {isLive ? "Live" : "Closed"}
            </span>
          );
        },
      },
      {
        accessorKey: "chatStartTime",
        header: "Start Time",
        cell: (info) => {
          const value = info.getValue<string>();
          return (
            <span className="text-[11px] text-slate-600">
              {formatDate(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "chatCloseTime",
        header: "Close Time",
        cell: (info) => {
          const value = info.getValue<string>();
          return (
            <span className="text-[11px] text-slate-600">
              {formatDate(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "totalSms",
        header: ({ column }) => (
          <button
            className="inline-flex items-center text-[11px] font-semibold text-slate-800"
            onClick={() => column.toggleSorting()}
          >
            Total SMS <BsArrowDown className="ml-1 h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-semibold text-slate-900">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "initiationType",
        header: "Type",
        cell: (info) => {
          const value = info.getValue<"incoming" | "outgoing" | null>();
          if (!value)
            return (
              <span className="text-[11px] text-slate-500">-</span>
            );
          const isIncoming = value === "incoming";
          return (
            <span
              className={
                isIncoming
                  ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                  : "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700"
              }
            >
              {isIncoming ? "Incoming" : "Outgoing"}
            </span>
          );
        },
      },
    ],
    []
  );

  const Agentcolumns = useMemo<ColumnDef<AgentRow>[]>(
    () => [
      {
        accessorKey: "agentId",
        header: ({ column }) => (
          <button
            className="inline-flex items-center text-[11px] font-semibold text-slate-800"
            onClick={() => column.toggleSorting()}
          >
            Agent <BsArrowDown className="ml-1 h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="text-xs font-medium">
            {info.getValue<string>() || "SYSTEM"}
          </span>
        ),
      },
      {
        accessorKey: "totalChats",
        header: "Total Chats",
        cell: (info) => (
          <span className="text-xs font-semibold">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "totalChatTimeSec",
        header: "Total Time (min)",
        cell: (info) => (
          <span className="text-[11px] text-slate-600">
            {fncTOconvertTime(info.getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "avgChatTimeSec",
        header: "Avg Time (min)",
        cell: (info) => (
          <span className="text-[11px] text-slate-600">
            {fncTOconvertTime(info.getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "BM",
        header: "BM",
        cell: (info) => (
          <span className="text-xs font-semibold text-red-600">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "OS",
        header: "OS",
        cell: (info) => (
          <span className="text-xs font-semibold text-red-600">
            {info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "OT",
        header: "OT",
        cell: (info) => (
          <span className="text-xs font-semibold text-red-600">
            {info.getValue<number>()}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    autoResetPageIndex: false,
  });

  const table2 = useReactTable({
    data: filteredAgentData,
    columns: Agentcolumns,
    state: {
      sorting: agentSorting,
      pagination: agentPagination,
    },
    onSortingChange: setAgentSorting,
    onPaginationChange: setAgentPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="min-h-screen  p-4">
      <div className="mx-auto max-w-[1400px] space-y-4">
        {/* Header (NO Baaz title) */}
        <div className="flex flex-col gap-3 rounded-md bg-white p-4 shadow-sm ">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-400 shadow-md">
                <BsChatDots className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Real-time chat monitoring and analytics
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="h-8 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  const today = getTodayISO();
                  setFromDate(today);
                  setToDate(today);
                }}
              >
                Today
              </button>

              <div className="flex items-center gap-1 rounded-md  bg-white px-2 py-1">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    const v = validateDateRange(e.target.value, toDate);
                    setDateError(v);
                  }}
                  className="h-7 w-[130px] border-0 bg-transparent px-2 text-xs outline-none"
                />
                <span className="px-1 text-[11px] text-gray-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    const v = validateDateRange(fromDate, e.target.value);
                    setDateError(v);
                  }}
                  className="h-7 w-[130px] border-0 bg-transparent px-2 text-xs outline-none"
                />
              </div>

              {dateError && (
                <div className="text-xs text-red-600">{dateError}</div>
              )}

              <button
                className="flex h-8 items-center gap-1 rounded-md bg-teal-400 px-4 text-xs font-medium text-white shadow-md hover:bg-teal-700 disabled:opacity-60"
                onClick={!loading && !dateError ? handleApply : undefined}
                disabled={loading || !!dateError}
              >
                {loading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <BsSearch className="h-3.5 w-3.5" />
                    Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Chats */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                Total Chats
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsChatDots className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : totalChats}
            </div>
          </div>

          {/* Total Sent */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                Total Sent messages
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsArrowUpRight className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : totalSent}
            </div>
          </div>

          {/* Total Received */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                Total Received messages
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsArrowDownLeft className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : totalReceived}
            </div>
          </div>

          {/* Failed */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                Failed messages
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50">
                <BsExclamationTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : totalFailed}
            </div>
          </div>

          {/* Answered */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                Answered Chats
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsEnvelopeCheck className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : ansChatsSUm}
            </div>
          </div>

          {/* Live */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                Live Chats
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsChatDots className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : liveChats}
            </div>
          </div>

          {/* Unanswered */}
          <div className="rounded-md  bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[13px] font-semibold text-gray-600">
                UnAnswered Chats
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsEnvelopeX className="h-4 w-4 text-teal-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? "..." : UnAnsweredChats}
            </div>
          </div>
        </div>

        {/* Skills section */}
        {/* <div className="rounded-md  bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[13px] font-semibold text-gray-700">
              Skills
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      
            <div className="flex items-center justify-between rounded-md  bg-gray-50 px-3 py-2">
              <div>
                <div className="text-[11px] font-semibold text-gray-500">
                  BM
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {loading ? "..." : bmChats}
                </div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsBatteryFull className="h-4 w-4 text-teal-400" />
              </div>
            </div>

          
            <div className="flex items-center justify-between rounded-md  bg-gray-50 px-3 py-2">
              <div>
                <div className="text-[11px] font-semibold text-gray-500">
                  OS
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {loading ? "..." : osChats}
                </div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50">
                <BsBroadcastPin className="h-4 w-4 text-teal-400" />
              </div>
            </div>

      
            <div className="flex items-center justify-between rounded-md  bg-gray-50 px-3 py-2">
              <div>
                <div className="text-[11px] font-semibold text-gray-500">
                  OT
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {loading ? "..." : otChats}
                </div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50">
                <BsQuestionCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>

       
            <div className="flex items-center justify-between rounded-md  bg-gray-50 px-3 py-2">
              <div>
                <div className="text-[11px] font-semibold text-gray-500">
                  No Opt
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {loading ? "..." : nsChats}
                </div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50">
                <BsXSquare className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </div>
        </div> */}

    
        <div className="rounded-md  bg-white shadow-sm">
         <div className="flex flex-col gap-2 border-b bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-black">
                Chat & SMS Activity
              </div>
              <p className="text-[11px] text-gray-500">
                Per-session details with disposition and timing
              </p>
            </div>

            <div className="relative w-full max-w-xs">
              <BsSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-200" />
              <input
                placeholder="Search agent, mobile, customer, disposition…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-full rounded-md border border-teal-300 bg-white pl-8 pr-3 text-xs text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="p-0">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-teal-50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="border-b border-teal-200 px-3 py-2 text-left text-[11px] font-semibold text-slate-800"
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
                <tbody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="border-t border-gray-100 px-3 py-2 align-top"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-3 py-4 text-center text-[12px] text-gray-500"
                      >
                        {loading
                          ? "Loading…"
                          : "No records for selected date range."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-600 sm:flex-row">
              <div>
                Showing{" "}
                <span className="font-semibold">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    (table.getRowModel().rows.length ? 1 : 0)}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {table.getFilteredRowModel().rows.length}
                </span>{" "}
                entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <BsChevronLeft className="h-3 w-3" />
                </button>
                <div>
                  Page{" "}
                  <span className="font-semibold">
                    {table.getState().pagination.pageIndex + 1}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {table.getPageCount() || 1}
                  </span>
                </div>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <BsChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Agent summary */}
        <div className="rounded-md  bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                Agent Summary
              </div>
              <p className="text-[11px] text-gray-500">
                Per-agent chats, time, and messages
              </p>
            </div>

            <div className="relative w-full max-w-xs">
              <BsSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search"
                value={AgentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="h-8 w-full rounded-md border border-gray-300 bg-white pl-8 pr-3 text-xs text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  {table2.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-slate-100">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="border-b border-gray-100 px-3 py-2 text-left text-[11px] font-semibold text-slate-800"
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
                <tbody>
                  {table2.getRowModel().rows.length ? (
                    table2.getRowModel().rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="border-t border-gray-100 px-3 py-2 align-top"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={Agentcolumns.length}
                        className="px-3 py-4 text-center text-[12px] text-gray-500"
                      >
                        {loading
                          ? "Loading…"
                          : "No agent stats for selected date range."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] text-gray-600 sm:flex-row">
              <div>
                Showing{" "}
                <span className="font-semibold">
                  {table2.getState().pagination.pageIndex *
                    table2.getState().pagination.pageSize +
                    (table2.getRowModel().rows.length ? 1 : 0)}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    (table2.getState().pagination.pageIndex + 1) *
                      table2.getState().pagination.pageSize,
                    table2.getFilteredRowModel().rows.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {table2.getFilteredRowModel().rows.length}
                </span>{" "}
                agents
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                  onClick={() => table2.previousPage()}
                  disabled={!table2.getCanPreviousPage()}
                >
                  <BsChevronLeft className="h-3 w-3" />
                </button>
                <div>
                  Page{" "}
                  <span className="font-semibold">
                    {table2.getState().pagination.pageIndex + 1}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {table2.getPageCount() || 1}
                  </span>
                </div>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                  onClick={() => table2.nextPage()}
                  disabled={!table2.getCanNextPage()}
                >
                  <BsChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
