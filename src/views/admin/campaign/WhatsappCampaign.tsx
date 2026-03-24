import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Button,
  DataTable,
  InputField,
  PageTransition,
  SectionHeading,
  SectionLabel,
  SelectField,
  StatusBadge,
  SurfaceCard,
  TextAreaField,
} from "components/dashboard/ui";
import {
  campaignRows,
  connectorOptions,
  contactSegments,
  templateRows,
} from "data/mockData";
import { FiSend } from "react-icons/fi";

export default function WhatsappCampaign() {
  const [campaignName, setCampaignName] = useState("Summer repeat purchase push");
  const [connector, setConnector] = useState(connectorOptions[0]);
  const [segment, setSegment] = useState(contactSegments[0].id);
  const [selectedTemplate, setSelectedTemplate] = useState(templateRows[0].name);
  const [notes, setNotes] = useState("Send with catalog CTA and keep delivery window within business hours.");
  const [scheduleAt, setScheduleAt] = useState("2026-03-24T16:00");
  const [complianceCheck, setComplianceCheck] = useState(true);

  const selectedTemplateDetails =
    templateRows.find((template) => template.name === selectedTemplate) ?? templateRows[0];
  const selectedSegment =
    contactSegments.find((entry) => entry.id === segment) ?? contactSegments[0];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success(`"${campaignName}" saved to the local campaign queue.`);
  };

  const columns = [
    {
      key: "name",
      header: "Campaign",
      render: (row: (typeof campaignRows)[number]) => (
        <div className="space-y-1">
          <p className="font-medium text-zinc-900">{row.name}</p>
          <p className="text-xs text-zinc-400">{row.template}</p>
        </div>
      ),
    },
    {
      key: "scheduledAt",
      header: "Schedule",
      render: (row: (typeof campaignRows)[number]) => row.scheduledAt,
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
      key: "spend",
      header: "Spend",
      render: (row: (typeof campaignRows)[number]) => `Rs ${row.spend.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <PageTransition className="space-y-6">
      <SectionHeading
        eyebrow="Campaign builder"
        title="Launch polished WhatsApp campaigns with less friction."
        description="The composer is intentionally lean: audience, connector, template, schedule and a clean preview."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <SurfaceCard className="p-6">
          <SectionLabel
            title="Campaign setup"
            description="Everything below is local mock state so the flow stays fast and reviewable."
          />
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              <SelectField
                label="Connector"
                value={connector}
                onChange={(e) => setConnector(e.target.value)}
                options={connectorOptions.map((option) => ({
                  label: option,
                  value: option,
                }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Audience segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                options={contactSegments.map((item) => ({
                  label: `${item.label} (${item.contacts.toLocaleString("en-IN")})`,
                  value: item.id,
                }))}
              />
              <SelectField
                label="Approved template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                options={templateRows.map((template) => ({
                  label: template.name,
                  value: template.name,
                }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Schedule time"
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
              <label className="flex items-end rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={complianceCheck}
                  onChange={(e) => setComplianceCheck(e.target.checked)}
                  className="mr-3 mt-0.5 h-4 w-4 rounded-[4px] border-zinc-300 text-zinc-900 focus:ring-zinc-300"
                />
                Meta policy and opt-in compliance confirmed
              </label>
            </div>

            <TextAreaField
              label="Internal notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              hint="Visible only to your team. Use it for campaign intent, CTA guidance or QA reminders."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5">
              <p className="text-sm text-zinc-500">
                Audience size: {selectedSegment.contacts.toLocaleString("en-IN")} contacts
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary">Save draft</Button>
                <Button type="submit">
                  <FiSend className="h-4 w-4" />
                  Launch mock campaign
                </Button>
              </div>
            </div>
          </form>
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard className="p-6">
            <SectionLabel
              title="Live preview"
              description="Reference-aligned mobile card with restrained spacing and no over-styling."
            />
            <div className="mt-6 rounded-[8px] border border-zinc-200 bg-[#f8f8f7] p-4">
              <div className="rounded-[8px] border border-zinc-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900">{connector}</p>
                  <StatusBadge tone="positive">Approved</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-zinc-700">
                  {selectedTemplateDetails.preview}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-zinc-400">Expected delivery</p>
                <p className="mt-1 font-medium text-zinc-900">97.2%</p>
              </div>
              <div className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3">
                <p className="text-zinc-400">Projected spend</p>
                <p className="mt-1 font-medium text-zinc-900">
                  Rs {(selectedSegment.contacts * 1.18).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionLabel
              title="Quality notes"
              description="A minimal summary so the form feels guided without clutter."
            />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-500">
              <li>Template variables: {selectedTemplateDetails.variables}</li>
              <li>Language: {selectedTemplateDetails.language}</li>
              <li>Recommended send window: 10 AM to 6 PM</li>
            </ul>
          </SurfaceCard>
        </div>
      </div>

      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-zinc-200 px-6 py-5">
          <SectionLabel
            title="Recent campaign activity"
            description="Static campaign history for layout and interaction review."
          />
        </div>
        <DataTable columns={columns} rows={campaignRows} emptyText="No campaigns in this workspace." />
      </SurfaceCard>
    </PageTransition>
  );
}
