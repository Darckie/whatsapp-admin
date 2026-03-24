import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import {
  BsArrowLeft,
  BsChatDots,
  BsPlayFill,
  BsCloudUpload,
  BsLightningCharge,
  BsGit,
} from "react-icons/bs";
import { RiRobot2Line } from "react-icons/ri";
import {
  MdCallSplit,
  MdDelete,
  MdOutlineMessage,
  MdOutlineHttp,
  MdAttachFile,
  MdOutlineInput,
  MdOutlineAccountTree,
  MdOutlineSupportAgent,
  MdOutlineStopCircle,
  MdOutlineMoreVert,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { LoaderIcon, toast } from "react-hot-toast";
import api from "../../../lib/api";

// NOTE: This must match `server/entity/models/BotFlowNode.js` ENUM values (lowercased).
type BotNodeType = "start" | "message" | "question" | "condition" | "agent" | "end";

type BotNodeData = {
  label: string;
  type: BotNodeType;
  kind?: string;
  messageText?: string;
  conditionLabel?: string;
  onDelete?: (id: string) => void;
  [key: string]: any;
};

type BotEdgeData = {
  conditionKey?: string | null;
};

type FlowMeta = {
  id: string;
  name: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  description?: string;
};

type TriggerConfig = {
  triggerKeywords: string[];
  clarificationPrompt: string;
  maxRetries: number;
  webhookTriggerUrl?: string;
  followupMessage?: string;
  followupDelaySeconds?: number;
  sessionTimeoutSeconds: number;
  sessionEndText?: string;
  hangupMode: "PHRASE" | "AGENT_HANDOVER";
  hangupPhrase?: string;
  handoverFallbackText?: string;
};

type BotFlowDTO = {
  meta: FlowMeta;
  triggerConfig: TriggerConfig;
  nodes: Node<BotNodeData>[];
  edges: Edge[];
};

type FlowBuilderPageProps = {
  flowId: string;
  onBack?: () => void;
  onSaved?: () => void;
};

const defaultTriggerConfig: TriggerConfig = {
  triggerKeywords: [],
  clarificationPrompt: "",
  maxRetries: 3,
  webhookTriggerUrl: "",
  followupMessage: "",
  followupDelaySeconds: 0,
  sessionTimeoutSeconds: 600,
  sessionEndText: "",
  hangupMode: "PHRASE",
  hangupPhrase: "",
  handoverFallbackText: "",
};

const toOptionKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const createNode = (
  id: string,
  x: number,
  y: number,
  label: string,
  type: BotNodeType,
  kind?: string,
  onDelete?: (id: string) => void
): Node<BotNodeData> => ({
  id,
  position: { x, y },
  data: { label, type, kind, onDelete }, // 👈 pass here
  type: "botNode",
});

const defaultNode: Node<BotNodeData> = createNode(
  "start",
  300,
  80,
  "Bot is triggered",
  "start",
  "start"
);

// ─── Custom node renderer ────────────────────────────────────────────────────

const kindMeta: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; pill: string }> = {
  start: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
    pill: "bg-emerald-100 text-emerald-700",
    icon: <BsPlayFill className="w-3 h-3" />,
  },
  message: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-300",
    pill: "bg-sky-100 text-sky-700",
    icon: <BsChatDots className="w-3 h-3" />,
  },
  option: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    pill: "bg-amber-100 text-amber-700",
    icon: <MdCallSplit className="w-3 h-3" />,
  },
  branch: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-300",
    pill: "bg-violet-100 text-violet-700",
    icon: <MdCallSplit className="w-3 h-3" />,
  },
  httpRequest: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-300",
    pill: "bg-teal-100 text-teal-700",
    icon: <BsChatDots className="w-3 h-3" />,
  },
  attachment: {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-300",
    pill: "bg-fuchsia-100 text-fuchsia-700",
    icon: <BsChatDots className="w-3 h-3" />,
  },
  collectInput: {
    bg: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-300",
    pill: "bg-lime-100 text-lime-700",
    icon: <BsChatDots className="w-3 h-3" />,
  },
  condition: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    pill: "bg-amber-100 text-amber-700",
    icon: <MdCallSplit className="w-3 h-3" />,
  },
  agent: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-300",
    pill: "bg-rose-100 text-rose-700",
    icon: <RiRobot2Line className="w-3 h-3" />,
  },
  end: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-300",
    pill: "bg-gray-100 text-gray-600",
    icon: <BsChatDots className="w-3 h-3" />,
  },
};

const kindLabel: Record<string, string> = {
  start: "Start",
  message: "Message",
  option: "Options",
  branch: "Branch",
  httpRequest: "HTTP Request",
  attachment: "Attachment",
  collectInput: "Collect Input",
  condition: "Options",
  agent: "Human Agent",
  end: "End",
};

function BotNode({ id, data, selected }: NodeProps) {
  const nd = data as BotNodeData;

  const resolvedKind =
    nd.kind ??
    (nd.type === "condition" ? "option" : nd.type);

  const m = kindMeta[resolvedKind] ?? kindMeta["message"];

  const isOption = resolvedKind === "option" || resolvedKind === "condition";
  const isBranch = resolvedKind === "branch";

  const items: string[] = isOption
    ? (Array.isArray(nd.options)
        ? nd.options.map((o: any) => o.label ?? o.text ?? "")
        : [])
    : isBranch
    ? (Array.isArray(nd.branch?.branches)
        ? nd.branch.branches
        : [])
    : [];

  return (
    <div
      className={`rounded-xl border-2 ${m.border} ${m.bg} shadow-sm min-w-[180px] max-w-[220px] transition-all duration-150 ${
        selected ? "ring-2 ring-offset-1 ring-teal-400 shadow-md" : ""
      }`}
      style={{ fontSize: 11 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-2 !h-2"
      />

      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b ${m.border}`}
      >
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${m.pill}`}
        >
          {m.icon}
          {kindLabel[resolvedKind] ?? resolvedKind}
        </span>

        {/* DELETE BUTTON */}
        {nd.onDelete && resolvedKind !== "start" && (
          <MdDelete
            className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              nd.onDelete(id); 
            }}
          />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className={`font-semibold text-xs ${m.text} truncate`}>
          {nd.label}
        </p>

        {/* Message preview */}
        {resolvedKind === "message" && nd.messageText && (
          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
            {nd.messageText}
          </p>
        )}

        {/* Collect input preview */}
        {resolvedKind === "collectInput" &&
          nd.collectInputQuestion && (
            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 italic">
              "{nd.collectInputQuestion}"
            </p>
          )}

        {/* HTTP Request preview */}
        {resolvedKind === "httpRequest" && (
          <p className="text-[10px] text-gray-500 mt-1 font-mono">
            {nd.httpRequest?.method ?? "GET"}{" "}
            {nd.httpRequest?.url
              ? nd.httpRequest.url.slice(0, 28) +
                (nd.httpRequest.url.length > 28 ? "…" : "")
              : "—"}
          </p>
        )}

        {/* Options / Branch */}
        {(isOption || isBranch) && items.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`rounded px-2 py-1 text-[10px] font-medium border ${m.border} ${m.bg} ${m.text} truncate`}
              >
                {item || `Option ${idx + 1}`}
              </div>
            ))}
          </div>
        )}

        {/* Agent */}
        {resolvedKind === "agent" && (
          <p className="text-[10px] text-gray-500 mt-1">
            Handover to human agent
          </p>
        )}

        {/* End */}
        {resolvedKind === "end" && (
          <p className="text-[10px] text-gray-500 mt-1">
            End of flow
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-2 !h-2"
      />
    </div>
  );
}

const nodeTypes = { botNode: BotNode };

// ─── Main component ──────────────────────────────────────────────────────────

export default function FlowBuilderPage({
  flowId,
  onBack,
  onSaved,
}: FlowBuilderPageProps) {
  const [meta, setMeta] = useState<FlowMeta | null>(null);
  const [triggerConfig, setTriggerConfig] =
    useState<TriggerConfig>(defaultTriggerConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BotNodeData>>([
    defaultNode,
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<BotEdgeData>>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"TRIGGER" | "STEP">("STEP");

  const reactFlowWrapperRef = useRef<HTMLDivElement | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const [keywordDraft, setKeywordDraft] = useState("");

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );


  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== id && e.target !== id)
    );
  
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };
  const selectedEdge = useMemo(
    () => edges.find((e) => String(e.id) === String(selectedEdgeId)) ?? null,
    [edges, selectedEdgeId]
  );

  const edgeSourceNode = useMemo(() => {
    if (!selectedEdge) return null;
    return nodes.find((n) => n.id === selectedEdge.source) ?? null;
  }, [nodes, selectedEdge]);

  const selectedNodeKind = useMemo(() => {
    if (!selectedNode) return null;
    if (selectedNode.data.kind) return selectedNode.data.kind;
    if (selectedNode.data.type === "condition") return "option";
    if (selectedNode.data.type === "question") return "collectInput";
    return selectedNode.data.type;
  }, [selectedNode]);

  const edgeSourceOptions = useMemo(() => {
    if (!edgeSourceNode) return [];
    const resolvedKind =
      edgeSourceNode.data.kind ??
      (edgeSourceNode.data.type === "condition" ? "option" : edgeSourceNode.data.type);
    if (resolvedKind !== "option") return [];
    return Array.isArray(edgeSourceNode.data.options) ? edgeSourceNode.data.options : [];
  }, [edgeSourceNode]);

  // Load existing flow
  useEffect(() => {
    const fetchFlow = async () => {
      try {
        setLoading(true);
        const rsp = await api.get<{ success: boolean; data: BotFlowDTO }>(
          `/bot-routes/bot-flows/${flowId}`
        );
        const dto = rsp.data.data;
        setMeta(dto.meta);
        setTriggerConfig(dto.triggerConfig || defaultTriggerConfig);
        if (dto.nodes && dto.nodes.length > 0) {
          // Ensure loaded nodes use our custom node type
          setNodes(dto.nodes.map((n) => ({ ...n, type: "botNode" })));
        }
        if (dto.edges && dto.edges.length > 0) {
          setEdges(dto.edges);
        }
      } catch (err) {
        console.error("Failed to load flow", err);
        setMeta({ id: flowId, name: "Untitled flow", status: "DRAFT", description: "" });
        setTriggerConfig(defaultTriggerConfig);
      } finally {
        setLoading(false);
      }
    };
    fetchFlow();
  }, [flowId, setNodes, setEdges]);

  const isValidConnection = useCallback(
    (connection: any) => {
      const sourceId = connection?.source as string | undefined;
      if (!sourceId) return false;
      const sourceNode = nodes.find((n) => n.id === sourceId);
      const sourceKind =
        sourceNode?.data?.kind ??
        (sourceNode?.data?.type === "condition" ? "option" : sourceNode?.data?.type);
      if (sourceKind === "end") return false;
      return true;
    },
    [nodes]
  );

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const sourceId = params.source as string | undefined;
      if (!sourceId) return;
      const sourceNode = nodes.find((n) => n.id === sourceId);
      const sourceKind =
        sourceNode?.data?.kind ??
        (sourceNode?.data?.type === "condition" ? "option" : sourceNode?.data?.type);
      if (sourceKind === "end") return;
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { conditionKey: null },
          },
          eds
        )
      );
    },
    [setEdges, nodes]
  );

  // ─── Add node: always places at viewport center ───────────────────────────
  const handleAddNode = (nodeType: BotNodeType, kind?: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `n_${crypto.randomUUID()}`
        : `n_${nodeType}_${Date.now()}`;

    const resolvedKind = kind ?? nodeType;
    const labelMap: Record<string, string> = {
      option: "View Options",
      httpRequest: "HTTP Request",
      attachment: "Attachment",
      collectInput: "Collect Input",
      branch: "Branch",
      agent: "Human Agent",
      end: "End",
      message: "Send Message",
      start: "Start",
    };

    const resolvedLabel = labelMap[resolvedKind] ?? resolvedKind;

    // ── Compute true canvas center using rfInstance.screenToFlowPosition ──
    let pos = { x: 240, y: 200 };
    try {
      const wrapper = reactFlowWrapperRef.current;
      if (wrapper && rfInstance?.screenToFlowPosition) {
        const rect = wrapper.getBoundingClientRect();
        pos = rfInstance.screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        // Offset so node center lands at viewport center
        pos = { x: pos.x - 90, y: pos.y - 40 };
      } else if (rfInstance?.getViewport) {
        const viewport = rfInstance.getViewport();
        const wrapper2 = reactFlowWrapperRef.current;
        if (wrapper2 && viewport?.zoom) {
          const w = wrapper2.clientWidth;
          const h = wrapper2.clientHeight;
          pos = {
            x: (-viewport.x + w / 2) / viewport.zoom - 90,
            y: (-viewport.y + h / 2) / viewport.zoom - 40,
          };
        }
      }
    } catch {
      // keep fallback
    }

    const node = createNode(
      id,
      pos.x,
      pos.y,
      resolvedLabel,
      nodeType,
      resolvedKind,
      handleDeleteNode // 👈 pass handler
    );

    // Initialize per-kind data
    if (resolvedKind === "option") {
      node.data.options = [
        { label: "Option 1", key: "option_1" },
        { label: "Option 2", key: "option_2" },
      ];
      node.data.showMessage = "Please choose an option";
      node.data.optionTitle = "View Options";
      node.data.optionMedia = { fileName: "" };
    }

    if (resolvedKind === "collectInput") {
      node.data.collectInputTitle = "Collect Input";
      node.data.collectInputPrompt = "Collect input asks a question to a user which requires an answer";
      node.data.collectInputQuestion = "";
      node.data.collectInputVariable = "user_response";
    }

    if (resolvedKind === "httpRequest") {
      node.data.httpRequest = {
        method: "GET",
        url: "http://api.example.com/path",
        authorization: "none",
        headers: [{ key: "", value: "" }],
        bodyType: "none",
        bodyRaw: "",
        responseFormat: "JSON",
        sendPayloadAsMessage: false,
        hidePayload: false,
      };
    }

    if (resolvedKind === "attachment") {
      node.data.attachment = { attachmentType: "media", fileName: "" };
      node.data.attachmentTitle = "Attachment";
    }

    if (resolvedKind === "branch") {
      node.data.branch = { branchTitle: "Branch", branches: ["Branch 1", "Branch 2", "Branch 3"] };
    }

    setNodes((nds) => [...nds, node]);

    // Auto-select newly added node and scroll to it
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
    setInspectorTab("STEP");
    setAddMenuOpen(false);
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node<BotNodeData>) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setInspectorTab("STEP");
  };

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge<BotEdgeData>) => {
    setSelectedEdgeId(String(edge.id));
    setSelectedNodeId(null);
    setInspectorTab("STEP");
  };

  const updateSelectedNodeData = (update: Partial<BotNodeData>) => {
    if (!selectedNode) return;
    const id = selectedNode.id;
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...update } } : n))
    );
  };

  const updateSelectedEdgeConditionKey = (val: string) => {
    if (!selectedEdge) return;
    const next = val.trim() ? val.trim() : null;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdge.id ? { ...e, data: { ...(e.data || {}), conditionKey: next } } : e
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const body: BotFlowDTO = {
        meta: meta || { id: flowId, name: "Untitled flow", status: "DRAFT", description: "" },
        triggerConfig,
        nodes,
        edges,
      };
      await api.put(`/bot-routes/bot-flows/${flowId}`, body);
      toast.success("Flow saved");
      onSaved?.();
      onBack?.();
    } catch (err) {
      console.error("Failed to save flow", err);
      toast.error("Failed to save flow");
    } finally {
      setSaving(false);
    }
  };

  const addTriggerKeyword = () => {
    const kw = keywordDraft.trim();
    if (!kw) return;
    setTriggerConfig((prev) => {
      const existing = Array.isArray(prev.triggerKeywords) ? prev.triggerKeywords : [];
      return { ...prev, triggerKeywords: Array.from(new Set([...existing, kw])) };
    });
    setKeywordDraft("");
  };

  const removeTriggerKeyword = (kw: string) => {
    setTriggerConfig((prev) => ({
      ...prev,
      triggerKeywords: (prev.triggerKeywords || []).filter((x) => x !== kw),
    }));
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2 py-10">
          <LoaderIcon className="w-5 h-5" />
          <p className="text-sm text-gray-500">Loading flow...</p>
        </div>
      </div>
    );
  }

  // ─── Node-type button definitions ─────────────────────────────────────────
  const addButtons = [
    { label: "Message", icon: <MdOutlineMessage size={14} />, action: () => handleAddNode("message", "message"), color: "text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100" },
    { label: "Options", icon: <MdCallSplit size={14} />, action: () => handleAddNode("condition", "option"), color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
    { label: "HTTP", icon: <MdOutlineHttp size={14} />, action: () => handleAddNode("message", "httpRequest"), color: "text-teal-600 bg-teal-50 border-teal-200 hover:bg-teal-100" },
    { label: "Attachment", icon: <MdAttachFile size={14} />, action: () => handleAddNode("message", "attachment"), color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100" },
    { label: "Collect Input", icon: <MdOutlineInput size={14} />, action: () => handleAddNode("question", "collectInput"), color: "text-lime-700 bg-lime-50 border-lime-200 hover:bg-lime-100" },
    { label: "Branch", icon: <MdOutlineAccountTree size={14} />, action: () => handleAddNode("condition", "branch"), color: "text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100" },
    { label: "Human Agent", icon: <MdOutlineSupportAgent size={14} />, action: () => handleAddNode("agent", "agent"), color: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100" },
    { label: "End", icon: <MdOutlineStopCircle size={14} />, action: () => handleAddNode("end", "end"), color: "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100" },
  ];

  const statusStyle: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-600 border-amber-200",
    ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
    INACTIVE: "bg-gray-100 text-gray-400 border-gray-200",
  };

  return (
    <div className="w-full flex flex-col bg-gray-50" >
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 px-4 bg-white border-b"
        style={{ minHeight: 52, boxShadow: "0 1px 0 #e5e7eb, 0 2px 8px rgba(15,23,42,0.04)" }}
      >
        {/* ── Left: back + identity ── */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          {onBack && (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <BsArrowLeft size={12} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
            </>
          )}

          {/* Icon + editable name + status badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#0d9488 0%,#0891b2 100%)", boxShadow: "0 1px 4px rgba(13,148,136,0.3)" }}
            >
              <BsGit size={11} className="text-white" />
            </div>

            <input
              type="text"
              value={meta?.name ?? ""}
              onChange={(e) => {
                const nextName = e.target.value;
                setMeta((prev) => ({
                  id: flowId, name: nextName,
                  status: prev?.status ?? "DRAFT",
                  description: prev?.description ?? "",
                }));
              }}
              className="text-sm  text-gray-800 font-medium bg-transparent border-2 outline-none focus:ring-1 focus:ring-teal-300 focus:bg-white rounded px-1.5 py-0.5 w-28 sm:w-44 transition-all"
              placeholder="Untitled flow"
            />

            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border tracking-wide shrink-0 ${statusStyle[meta?.status ?? "DRAFT"] ?? statusStyle.DRAFT}`}
            >
              {meta?.status || "DRAFT"}
            </span>
          </div>
        </div>

        {/* ── Center: insert node palette ── */}
        <div className="flex-1 flex justify-center min-w-0 mx-2">
          {/* Mobile / tablet: dropdown trigger */}
          <div className="relative xl:hidden flex">
            <button
              type="button"
              onClick={() => setAddMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdOutlineMoreVert size={14} />
              <span>Insert node</span>
              <MdKeyboardArrowDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${addMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {addMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 grid grid-cols-2 gap-1 w-60">
                {addButtons.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={b.action}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all active:scale-95 ${b.color}`}
                  >
                    {b.icon}
                    {b.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: inline chip row */}
          <div className="hidden xl:flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mr-1.5 shrink-0">Insert Node</span>
            {addButtons.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.action}
                title={b.label}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${b.color}`}
              >
                {b.icon}
                <span className="hidden 2xl:inline">{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: save button ── */}
        <div className="shrink-0">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100"
            style={{
              background: saving
                ? "#9ca3af"
                : "linear-gradient(135deg,#0d9488 0%,#0891b2 100%)",
              boxShadow: saving ? "none" : "0 2px 10px rgba(13,148,136,0.35)",
            }}
          >
            {saving
              ? <LoaderIcon className="w-3.5 h-3.5 shrink-0" />
              : <BsCloudUpload size={13} className="shrink-0" />
            }
            <span className="hidden sm:inline">{saving ? "Saving…" : "Save flow"}</span>
          </button>
        </div>
      </div>

      {/* ─── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Canvas */}
        <div ref={reactFlowWrapperRef} className="flex-1 relative min-h-[320px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onInit={(instance) => setRfInstance(instance)}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: "#94a3b8", strokeWidth: 1.5 },
            }}
          >
            <MiniMap
              nodeColor={(n) => {
                const k = (n.data as BotNodeData).kind ?? (n.data as BotNodeData).type;
                const m = kindMeta[k as string];
                return m ? m.border.replace("border-", "").replace("-300", "") : "#e2e8f0";
              }}
              style={{ borderRadius: 8 }}
            />
            <Controls />
            <Background gap={20} color="#e2e8f0" />
          </ReactFlow>
        </div>

        {/* ─── Right inspector ─────────────────────────────────────────── */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l bg-white flex flex-col overflow-hidden">
          <div className="flex border-b text-xs shrink-0">
            <button
              className={`flex-1 px-3 py-2 text-center transition-colors ${inspectorTab === "TRIGGER"
                  ? "border-b-2 border-teal-500 font-semibold text-teal-700"
                  : "text-gray-500 hover:bg-gray-50"
                }`}
              onClick={() => setInspectorTab("TRIGGER")}
            >
              Bot Trigger
            </button>
            <button
              className={`flex-1 px-3 py-2 text-center transition-colors ${inspectorTab === "STEP"
                  ? "border-b-2 border-teal-500 font-semibold text-teal-700"
                  : "text-gray-500 hover:bg-gray-50"
                }`}
              onClick={() => setInspectorTab("STEP")}
            >
              Step details
            </button>
          </div>

          <div className="p-3 flex-1 overflow-auto">
            {/* ── TRIGGER TAB ── */}
            {inspectorTab === "TRIGGER" ? (
              <>
                <h3 className="text-sm font-semibold mb-2">Bot initiation trigger</h3>

                <label className="text-xs font-medium text-gray-700 mb-1 block">Trigger keywords</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(triggerConfig.triggerKeywords || []).map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-2 rounded bg-slate-100 text-slate-700 px-2 py-1 text-xs">
                      {kw}
                      <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => removeTriggerKeyword(kw)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 text-sm w-full"
                    placeholder="Type a keyword and press Enter"
                    value={keywordDraft}
                    onChange={(e) => setKeywordDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTriggerKeyword(); } }}
                  />
                  <button type="button" className="px-3 py-1.5 rounded bg-teal-500 text-white text-sm hover:bg-teal-600 disabled:opacity-60" onClick={addTriggerKeyword} disabled={!keywordDraft.trim()}>Add</button>
                </div>
                <p className="text-[11px] text-gray-500 mb-4">Add multiple keywords; the bot triggers when any keyword matches.</p>

                <label className="text-xs font-medium text-gray-700 mb-1 block">Clarification prompt</label>
                <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={triggerConfig.clarificationPrompt} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, clarificationPrompt: e.target.value }))} />

                <label className="text-xs font-medium text-gray-700 mb-1 block">Maximum retries</label>
                <input type="number" min={0} className="border rounded px-2 py-1 text-sm w-full mb-3" value={triggerConfig.maxRetries} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, maxRetries: Number(e.target.value) || 0 }))} />

                <label className="text-xs font-medium text-gray-700 mb-1 block">Webhook trigger URL</label>
                <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={triggerConfig.webhookTriggerUrl || ""} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, webhookTriggerUrl: e.target.value }))} />

                <h4 className="text-xs font-semibold text-gray-700 mt-3 mb-1">Follow-up message</h4>
                <textarea className="border rounded px-2 py-1 text-sm w-full mb-2 h-16" value={triggerConfig.followupMessage || ""} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, followupMessage: e.target.value }))} />
                <label className="text-[11px] text-gray-500 mb-3 block">Sent automatically if user is idle for the specified interval.</label>

                <label className="text-xs font-medium text-gray-700 mb-1 block">Follow-up delay (seconds)</label>
                <input type="number" min={0} className="border rounded px-2 py-1 text-sm w-full mb-3" value={triggerConfig.followupDelaySeconds ?? 0} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, followupDelaySeconds: Number(e.target.value) || 0 }))} />

                <h4 className="text-xs font-semibold text-gray-700 mt-3 mb-1">Session configuration</h4>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Session timeout (seconds)</label>
                <input type="number" min={0} className="border rounded px-2 py-1 text-sm w-full mb-3" value={triggerConfig.sessionTimeoutSeconds} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, sessionTimeoutSeconds: Number(e.target.value) || 0 }))} />

                <label className="text-xs font-medium text-gray-700 mb-1 block">Session end text</label>
                <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={triggerConfig.sessionEndText || ""} onChange={(e) => setTriggerConfig((prev) => ({ ...prev, sessionEndText: e.target.value }))} />

                <h4 className="text-xs font-semibold text-gray-700 mt-3 mb-1">Hang-up behavior</h4>
                <div className="flex items-center gap-3 mb-2 text-xs">
                  <label className="inline-flex items-center gap-1">
                    <input type="radio" className="h-3 w-3" checked={triggerConfig.hangupMode === "PHRASE"} onChange={() => setTriggerConfig((prev) => ({ ...prev, hangupMode: "PHRASE" }))} />
                    <span>Hang-up phrase</span>
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input type="radio" className="h-3 w-3" checked={triggerConfig.hangupMode === "AGENT_HANDOVER"} onChange={() => setTriggerConfig((prev) => ({ ...prev, hangupMode: "AGENT_HANDOVER" }))} />
                    <span>Agent handover</span>
                  </label>
                </div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Hang-up phrase / fallback text</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 text-sm w-full mb-3"
                  value={triggerConfig.hangupMode === "PHRASE" ? triggerConfig.hangupPhrase || "" : triggerConfig.handoverFallbackText || ""}
                  onChange={(e) =>
                    setTriggerConfig((prev) =>
                      prev.hangupMode === "PHRASE"
                        ? { ...prev, hangupPhrase: e.target.value }
                        : { ...prev, handoverFallbackText: e.target.value }
                    )
                  }
                />
              </>
            ) : (
              /* ── STEP TAB ── */
              <>
                <h3 className="text-sm font-semibold mb-2">Step details</h3>

                {selectedEdge ? (
                  <>
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Edge</span>
                      <span>{selectedEdge.source} → {selectedEdge.target}</span>
                    </div>
                    <label className="text-xs font-medium text-gray-700 mb-1">Condition / option key</label>
                    {edgeSourceOptions.length > 0 ? (
                      <select className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedEdge.data?.conditionKey ?? ""} onChange={(e) => updateSelectedEdgeConditionKey(e.target.value)}>
                        <option value="">Custom</option>
                        {edgeSourceOptions.map((opt: any, idx: number) => {
                          const label = opt.label ?? opt.text ?? `Option ${idx + 1}`;
                          const key = opt.key ?? toOptionKey(label);
                          return <option key={`${key}_${idx}`} value={key}>{label}</option>;
                        })}
                      </select>
                    ) : (
                      <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedEdge.data?.conditionKey ?? ""} onChange={(e) => updateSelectedEdgeConditionKey(e.target.value)} />
                    )}
                    <p className="text-[11px] text-gray-500">This value is stored on the edge as `condition_key` and can be used to branch conversations.</p>
                  </>
                ) : selectedNode ? (
                  <>
                    <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{selectedNode.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${(kindMeta[selectedNodeKind ?? "message"] ?? kindMeta["message"]).pill}`}>
                        {(kindMeta[selectedNodeKind ?? "message"] ?? kindMeta["message"]).icon}
                        {kindLabel[selectedNodeKind ?? "message"] ?? selectedNodeKind}
                      </span>
                    </div>

                    {/* Option */}
                    {selectedNodeKind === "option" && (
                      <>
                        <label className="text-xs font-medium text-gray-700 mb-1">View Options title</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.optionTitle ?? selectedNode.data.label} onChange={(e) => { const v = e.target.value; updateSelectedNodeData({ optionTitle: v, label: v }); }} />
                        <p className="text-[11px] text-gray-500 mb-4">Options allow the conversation flow to be branched based on user input.</p>

                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Upload media</h4>
                        <label className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-gray-50 cursor-pointer mb-3">
                          Upload a media
                          <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; updateSelectedNodeData({ optionMedia: { ...(selectedNode.data.optionMedia || {}), fileName: file?.name || "" } }); }} />
                        </label>
                        {selectedNode.data.optionMedia?.fileName && (
                          <p className="text-[11px] text-gray-500 mb-2 bg-pink-100 rounded px-2 py-1">Selected: {selectedNode.data.optionMedia.fileName}</p>
                        )}

                        <label className="text-xs font-medium text-gray-700 mb-1 block">Show message</label>
                        <textarea className="border rounded px-2 py-1 text-sm w-full mb-4 h-16" value={selectedNode.data.showMessage ?? "Please choose an option"} onChange={(e) => updateSelectedNodeData({ showMessage: e.target.value })} />

                        {Array.isArray(selectedNode.data.options) && selectedNode.data.options.length > 0 ? (
                          <>
                            <h4 className="text-xs font-semibold text-gray-700 mt-2 mb-2">List of options</h4>
                            <div className="space-y-2 mb-3">
                              {selectedNode.data.options.slice(0, 2).map((opt: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    className="w-full bg-pink-50 border border-pink-200 text-gray-700 rounded px-3 py-2 text-sm"
                                    value={opt.label ?? opt.text ?? ""}
                                    onChange={(e) => {
                                      const nextLabel = e.target.value;
                                      const nextKey = opt.key && String(opt.key).trim() ? opt.key : toOptionKey(nextLabel);
                                      const nextOptions = [...selectedNode.data.options];
                                      nextOptions[idx] = { ...opt, label: nextLabel, key: nextKey };
                                      updateSelectedNodeData({ options: nextOptions });
                                    }}
                                  />
                                  <MdDelete
                                    className="text-red-400 hover:text-red-600 cursor-pointer shrink-0"
                                    size={16}
                                    onClick={() => {
                                      const nextOptions = [...selectedNode.data.options];
                                      nextOptions.splice(idx, 1);
                                      updateSelectedNodeData({ options: nextOptions });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="px-3 py-2 rounded border border-blue-600 text-blue-600 text-sm hover:bg-blue-50 disabled:opacity-50"
                              disabled={(selectedNode.data.options || []).length >= 2}
                              onClick={() => {
                                const existing = Array.isArray(selectedNode.data.options) ? selectedNode.data.options : [];
                                const idx = existing.length + 1;
                                updateSelectedNodeData({ options: [...existing, { label: `Option ${idx}`, key: toOptionKey(`option_${idx}`) }] });
                              }}
                            >
                              + Option Button
                            </button>
                            <p className="text-[11px] text-gray-500 mt-2">Max 2 options allowed.</p>
                          </>
                        ) : (
                          <>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Option label / description</label>
                            <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.conditionLabel || ""} onChange={(e) => updateSelectedNodeData({ conditionLabel: e.target.value })} />
                          </>
                        )}
                      </>
                    )}

                    {/* Branch */}
                    {selectedNodeKind === "branch" && (
                      <>
                        <label className="text-xs font-medium text-gray-700 mb-1">Branch title</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.branch?.branchTitle ?? "Branch"} onChange={(e) => updateSelectedNodeData({ branch: { ...(selectedNode.data.branch || {}), branchTitle: e.target.value } })} />
                        <p className="text-[11px] text-gray-500 mb-4">Branch creates multiple paths based on conditions, each with their own flows.</p>
                        <div className="space-y-3 mb-2">
                          {(Array.isArray(selectedNode.data.branch?.branches) ? selectedNode.data.branch.branches : ["Branch 1", "Branch 2", "Branch 3"]).slice(0, 3).map((val: string, idx: number) => (
                            <div key={idx}>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Branch {idx + 1}</label>
                              <input type="text" className="border rounded px-2 py-1 text-sm w-full" value={val} onChange={(e) => {
                                const nextBranches = [...(Array.isArray(selectedNode.data.branch?.branches) ? selectedNode.data.branch.branches : ["Branch 1", "Branch 2", "Branch 3"])];
                                nextBranches[idx] = e.target.value;
                                updateSelectedNodeData({ branch: { ...(selectedNode.data.branch || {}), branches: nextBranches } });
                              }} />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* HTTP Request */}
                    {selectedNodeKind === "httpRequest" && (
                      <>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">HTTP Request</h4>
                        <p className="text-[11px] text-gray-500 mb-4">Send API requests to external services and use the response in your flow.</p>

                        <label className="text-xs font-medium text-gray-700 mb-1 block">HTTP Method</label>
                        <select className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.httpRequest?.method ?? "GET"} onChange={(e) => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), method: e.target.value } })}>
                          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <label className="text-xs font-medium text-gray-700 mb-1 block">Request URL</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.httpRequest?.url ?? ""} onChange={(e) => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), url: e.target.value } })} />

                        <label className="text-xs font-medium text-gray-700 mb-1 block">Authorization</label>
                        <select className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.httpRequest?.authorization ?? "none"} onChange={(e) => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), authorization: e.target.value } })}>
                          <option value="none">No Auth</option>
                        </select>

                        <h4 className="text-xs font-semibold text-gray-700 mt-4 mb-2">Headers</h4>
                        <div className="space-y-2 mb-3">
                          {(selectedNode.data.httpRequest?.headers ?? []).map((h: any, idx: number) => (
                            <div key={idx} className="flex gap-2">
                              <input type="text" placeholder="Key" className="border rounded px-2 py-1 text-sm flex-1" value={h.key ?? ""} onChange={(e) => { const next = [...(selectedNode.data.httpRequest?.headers ?? [])]; next[idx] = { ...h, key: e.target.value }; updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), headers: next } }); }} />
                              <input type="text" placeholder="Value" className="border rounded px-2 py-1 text-sm flex-1" value={h.value ?? ""} onChange={(e) => { const next = [...(selectedNode.data.httpRequest?.headers ?? [])]; next[idx] = { ...h, value: e.target.value }; updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), headers: next } }); }} />
                            </div>
                          ))}
                        </div>
                        <button type="button" className="px-3 py-2 rounded border border-gray-200 text-sm hover:bg-gray-50 mb-4" onClick={() => { const existing = Array.isArray(selectedNode.data.httpRequest?.headers) ? selectedNode.data.httpRequest.headers : []; updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), headers: [...existing, { key: "", value: "" }] } }); }}>+ Add Header</button>

                        <h4 className="text-xs font-semibold text-gray-700 mt-2 mb-2">Body</h4>
                        <div className="mb-3 flex flex-col gap-1 text-xs text-gray-600">
                          {[{ id: "none", label: "none" }, { id: "form-data", label: "form-data" }, { id: "raw", label: "raw" }, { id: "x-www-form-urlencoded", label: "x-www-form-urlencoded" }].map((opt) => (
                            <label key={opt.id} className="inline-flex items-center gap-2">
                              <input type="radio" name="httpBodyType" className="h-3 w-3" checked={(selectedNode.data.httpRequest?.bodyType ?? "none") === opt.id} onChange={() => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), bodyType: opt.id } })} />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>

                        <label className="text-xs font-medium text-gray-700 mb-1 block">Response Format</label>
                        <select className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.httpRequest?.responseFormat ?? "JSON"} onChange={(e) => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), responseFormat: e.target.value } })}>
                          <option value="JSON">JSON</option>
                        </select>

                        <label className="inline-flex items-center gap-2 text-xs text-gray-700 mb-3">
                          <input type="checkbox" className="h-3 w-3" checked={selectedNode.data.httpRequest?.sendPayloadAsMessage ?? false} onChange={(e) => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), sendPayloadAsMessage: e.target.checked } })} />
                          Send payload as message
                        </label>

                        <button type="button" className="px-3 py-2 rounded border border-gray-200 text-sm hover:bg-gray-50 mb-2" onClick={() => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), hidePayload: !(selectedNode.data.httpRequest?.hidePayload ?? false) } })}>
                          {selectedNode.data.httpRequest?.hidePayload ? "Show Payload" : "Hide Payload"}
                        </button>

                        {!selectedNode.data.httpRequest?.hidePayload && (
                          <>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">Request Payload</label>
                            <textarea className="border rounded px-2 py-1 text-sm w-full mb-2 h-24" value={selectedNode.data.httpRequest?.bodyRaw ?? ""} onChange={(e) => updateSelectedNodeData({ httpRequest: { ...(selectedNode.data.httpRequest || {}), bodyRaw: e.target.value } })} />
                          </>
                        )}
                      </>
                    )}

                    {/* Attachment */}
                    {selectedNodeKind === "attachment" && (
                      <>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Attachment title</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.attachmentTitle ?? selectedNode.data.label ?? "Attachment"} onChange={(e) => updateSelectedNodeData({ attachmentTitle: e.target.value, label: e.target.value })} />
                        <p className="text-[11px] text-gray-500 mb-3">Used for sending PDF documents, images and videos. Not for Word documents.</p>

                        <div className="flex gap-2 mb-3">
                          <button type="button" className={`flex-1 rounded border px-3 py-2 text-sm ${(selectedNode.data.attachment?.attachmentType ?? "media") === "media" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`} onClick={() => updateSelectedNodeData({ attachment: { ...(selectedNode.data.attachment || {}), attachmentType: "media" } })}>Photos & Videos</button>
                          <button type="button" className={`flex-1 rounded border px-3 py-2 text-sm ${selectedNode.data.attachment?.attachmentType === "documents" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`} onClick={() => updateSelectedNodeData({ attachment: { ...(selectedNode.data.attachment || {}), attachmentType: "documents" } })}>Documents</button>
                        </div>

                        <label className="inline-flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-gray-50 cursor-pointer mb-3 w-full">
                          {selectedNode.data.attachment?.attachmentType === "documents" ? "Upload documents" : "Upload photos and videos"}
                          <input type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={(e) => { const file = e.target.files?.[0]; updateSelectedNodeData({ attachment: { ...(selectedNode.data.attachment || {}), fileName: file?.name || "" } }); }} />
                        </label>

                        {selectedNode.data.attachment?.fileName && (
                          <p className="text-[11px] text-gray-500 mb-2 bg-pink-100 rounded px-2 py-1">Selected: {selectedNode.data.attachment.fileName}</p>
                        )}
                      </>
                    )}

                    {/* Collect Input */}
                    {selectedNodeKind === "collectInput" && (
                      <>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Collect Input title</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.collectInputTitle ?? selectedNode.data.label ?? "Collect Input"} onChange={(e) => updateSelectedNodeData({ collectInputTitle: e.target.value, label: e.target.value })} />
                        <p className="text-[11px] text-gray-500 mb-4">Collect input asks a question to a user which requires an answer.</p>

                        <label className="text-xs font-medium text-gray-700 mb-1 block">Shows this question</label>
                        <textarea className="border rounded px-2 py-1 text-sm w-full mb-3 h-20" value={selectedNode.data.collectInputQuestion ?? ""} onChange={(e) => updateSelectedNodeData({ collectInputQuestion: e.target.value })} />

                        <label className="text-xs font-medium text-gray-700 mb-1 block">Save the response in this variable</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-2" value={selectedNode.data.collectInputVariable ?? ""} onChange={(e) => updateSelectedNodeData({ collectInputVariable: e.target.value })} />
                        <p className="text-[11px] text-gray-500">No special characters or spaces allowed.</p>
                      </>
                    )}

                    {/* Message */}
                    {selectedNodeKind === "message" && (
                      <>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
                        <input type="text" className="border rounded px-2 py-1 text-sm w-full mb-3" value={selectedNode.data.label} onChange={(e) => updateSelectedNodeData({ label: e.target.value })} />
                        <label className="text-xs font-medium text-gray-700 mb-1">Message text</label>
                        <textarea className="border rounded px-2 py-1 text-sm w-full mb-3 h-28" value={selectedNode.data.messageText || ""} onChange={(e) => updateSelectedNodeData({ messageText: e.target.value })} />
                        <p className="text-[11px] text-gray-500">This will map to WhatsApp template/body for this step.</p>
                      </>
                    )}

                    {/* Start */}
                    {selectedNodeKind === "start" && (
                      <p className="text-[11px] text-gray-500">This is the entry point of your bot flow. Every flow starts here.</p>
                    )}

                    {/* Agent */}
                    {selectedNode.data.type === "agent" && (
                      <p className="text-[11px] text-gray-500">This node will mark the conversation as human-handover and stop bot replies.</p>
                    )}

                    {/* End */}
                    {selectedNode.data.type === "end" && (
                      <p className="text-[11px] text-gray-500">This node will end the conversation flow.</p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <BsChatDots className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Select a node or edge on the canvas to edit its details.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}