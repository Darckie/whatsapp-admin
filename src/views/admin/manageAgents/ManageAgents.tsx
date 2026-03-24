import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import {
  AvatarName,
  Button,
  DataTable,
  InputField,
  PageTransition,
  SectionHeading,
  SectionLabel,
  StatusBadge,
  SurfaceCard,
} from "components/dashboard/ui";
import { teamMembers as initialMembers } from "data/mockData";

type Agent = {
  id: number;
  name: string;
  role: string;
  queue: string;
  phone: string;
  email: string;
  shift: string;
  conversations: number;
  resolutionRate: string;
  status: "Online" | "Break" | "Offline";
};

type FormData = {
  name: string;
  role: string;
  queue: string;
  phone: string;
  email: string;
  shift: string;
};

export default function ManageAgents() {
  const [agents, setAgents] = useState<Agent[]>(initialMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    role: "Agent",
    queue: "Priority Sales",
    phone: "",
    email: "",
    shift: "09:00 AM - 06:00 PM",
  });

  const handleSave = () => {
    const newAgent: Agent = {
      id: agents.length + 1,
      name: formData.name,
      role: formData.role,
      queue: formData.queue,
      phone: formData.phone,
      email: formData.email,
      shift: formData.shift,
      conversations: 0,
      resolutionRate: "Pending",
      status: "Online",
    };

    setAgents([...agents, newAgent]);
    setIsModalOpen(false);
    toast.success("New team member added locally.");
    setFormData({
      name: "",
      role: "Agent",
      queue: "Priority Sales",
      phone: "",
      email: "",
      shift: "09:00 AM - 06:00 PM",
    });
  };

  const filteredAgents = agents.filter((agent) =>
    [agent.name, agent.queue, agent.email, agent.phone, agent.role]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const activeCount = agents.filter((agent) => agent.status === "Online").length;
  const avgConversations = Math.round(
    agents.reduce((sum, agent) => sum + agent.conversations, 0) / agents.length,
  );

  return (
    <PageTransition className="space-y-6">
      <SectionHeading
        eyebrow="Team"
        title="Seats, queues and shift coverage without the usual clutter."
        description="A practical team page for reviewing who is online, which queue they cover and where support capacity sits."
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <FiPlus className="h-4 w-4" />
            Add member
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SurfaceCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Online seats</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">{activeCount}</p>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Avg. conversations</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">{avgConversations}</p>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Resolution band</p>
          <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-zinc-950">95%</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_320px]">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-zinc-200 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionLabel
                title="Workspace roster"
                description="Keep the data dense but easy to scan."
              />
              <InputField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member or queue"
                wrapperClassName="sm:max-w-[260px]"
              />
            </div>
          </div>

          <DataTable
            rows={filteredAgents}
            emptyText="No team members found."
            columns={[
              {
                key: "name",
                header: "Member",
                render: (row: Agent) => <AvatarName name={row.name} subtext={row.role} />,
              },
              {
                key: "queue",
                header: "Queue",
                render: (row: Agent) => row.queue,
              },
              {
                key: "contact",
                header: "Contact",
                render: (row: Agent) => (
                  <div className="space-y-1">
                    <p>{row.phone}</p>
                    <p className="text-xs text-zinc-400">{row.email}</p>
                  </div>
                ),
              },
              {
                key: "conversations",
                header: "Load",
                render: (row: Agent) => row.conversations,
              },
              {
                key: "status",
                header: "Status",
                render: (row: Agent) => (
                  <StatusBadge
                    tone={
                      row.status === "Online"
                        ? "positive"
                        : row.status === "Break"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {row.status}
                  </StatusBadge>
                ),
              },
            ]}
          />
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard className="p-6">
            <SectionLabel
              title="Shift coverage"
              description="A quick summary for mobile and desktop review."
            />
            <div className="mt-4 space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-zinc-900">{agent.name}</span>
                    <StatusBadge tone={agent.status === "Online" ? "positive" : "muted"}>
                      {agent.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-zinc-500">{agent.shift}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionLabel
              title="Coverage note"
              description="Priority Sales and Post-sales are currently balanced. Template Review shifts pick up after 2 PM."
            />
          </SurfaceCard>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[8px] border border-zinc-200 bg-white p-6 shadow-[0_18px_40px_rgba(24,24,27,0.12)]">
            <h3 className="mb-5 text-lg font-semibold text-zinc-950">Add team member</h3>
            <div className="space-y-4">
              <InputField
                label="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <InputField
                  label="Queue"
                  value={formData.queue}
                  onChange={(e) => setFormData({ ...formData, queue: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <InputField
                  label="Shift"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                />
              </div>
              <InputField
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save member</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageTransition>
  );
}
