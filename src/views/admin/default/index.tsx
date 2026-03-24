import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiDownload, FiTrendingUp } from "react-icons/fi";
import {
  AvatarName,
  Button,
  DataTable,
  MetricCard,
  PageTransition,
  SectionHeading,
  SectionLabel,
  StatusBadge,
  SurfaceCard,
} from "components/dashboard/ui";
import {
  campaignRows,
  dashboardMetrics,
  deliveryTrend,
  funnelData,
  inboxThreads,
} from "data/mockData";

const Dashboard = () => {
  const columns = [
    {
      key: "campaign",
      header: "Campaign",
      render: (row: (typeof campaignRows)[number]) => (
        <div className="space-y-1">
          <p className="font-medium text-zinc-900">{row.name}</p>
          <p className="text-xs text-zinc-400">{row.template}</p>
        </div>
      ),
    },
    {
      key: "audience",
      header: "Audience",
      render: (row: (typeof campaignRows)[number]) => row.audience,
    },
    {
      key: "owner",
      header: "Owner",
      render: (row: (typeof campaignRows)[number]) => row.owner,
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof campaignRows)[number]) => (
        <StatusBadge tone={row.status === "Live" ? "positive" : row.status === "Draft" ? "muted" : "neutral"}>
          {row.status}
        </StatusBadge>
      ),
    },
    {
      key: "delivered",
      header: "Delivered",
      render: (row: (typeof campaignRows)[number]) => row.delivered.toLocaleString("en-IN"),
    },
    {
      key: "replies",
      header: "Replies",
      render: (row: (typeof campaignRows)[number]) => row.replies.toLocaleString("en-IN"),
    },
  ];

  return (
    <PageTransition className="space-y-6">
      <SectionHeading
        eyebrow="Overview"
        title="A cleaner command center for campaigns and conversations."
        description="Daily delivery quality, live inbox pressure, and outbound campaign movement in one premium surface."
        action={
          <>
            <Button variant="secondary">Today</Button>
            <Button>
              <FiDownload className="h-4 w-4" />
              Export snapshot
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <SurfaceCard className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <SectionLabel
              title="Delivery momentum"
              description="Read rates continue to grow alongside higher outbound volume."
            />
            <StatusBadge tone="positive">
              <FiTrendingUp className="mr-1 h-3.5 w-3.5" />
              +12.4% week-on-week
            </StatusBadge>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deliveryTrend}>
                <defs>
                  <linearGradient id="deliveredFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="readFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#ececec" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 10px 30px rgba(24,24,27,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#deliveredFill)"
                />
                <Area
                  type="monotone"
                  dataKey="read"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#readFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <div className="grid gap-4">
          <SurfaceCard className="p-6">
            <SectionLabel
              title="Campaign funnel"
              description="Queued volume is converting well into reads and click-throughs."
            />
            <div className="mt-6 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} barSize={26}>
                  <CartesianGrid vertical={false} stroke="#ececec" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 10px 30px rgba(24,24,27,0.08)",
                    }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionLabel
              title="Conversations needing attention"
              description="Threads with fresh activity or handoff context."
            />
            <div className="mt-5 space-y-4">
              {inboxThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <AvatarName name={thread.customerName} subtext={thread.phone} />
                  <div className="space-y-1 text-right">
                    <StatusBadge tone={thread.status === "Live" ? "positive" : "neutral"}>
                      {thread.status}
                    </StatusBadge>
                    <p className="text-xs text-zinc-400">{thread.lastSeen}</p>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>

      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-zinc-200 px-6 py-5">
          <SectionLabel
            title="Campaign performance"
            description="A compact view of live, scheduled, and completed initiatives."
          />
        </div>
        <DataTable columns={columns} rows={campaignRows} emptyText="No campaign activity available." />
      </SurfaceCard>
    </PageTransition>
  );
};

export default Dashboard;
