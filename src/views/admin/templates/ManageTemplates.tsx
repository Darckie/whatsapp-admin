import React, { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  DataTable,
  PageTransition,
  SectionHeading,
  SectionLabel,
  StatusBadge,
  SurfaceCard,
} from "components/dashboard/ui";
import { templateRows } from "data/mockData";

export function ManageTemplate() {
  const [searchText, setSearchText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(templateRows[0].id);

  const filteredData = useMemo(() => {
    if (!searchText) {
      return templateRows;
    }

    const lower = searchText.toLowerCase();
    return templateRows.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(lower)),
    );
  }, [searchText]);

  const selectedTemplate =
    filteredData.find((template) => template.id === selectedTemplateId) ??
    filteredData[0] ??
    templateRows[0];

  return (
    <PageTransition className="space-y-6">
      <SectionHeading
        eyebrow="Template library"
        title="Approved message building blocks, kept deliberately calm."
        description="The table is flat, readable and ready for mock reviews without backend latency."
        action={
          <Button>
            <FiPlus className="h-4 w-4" />
            New template
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-zinc-200 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionLabel
                title="Template registry"
                description="Search by name, category, language or quality."
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="h-11 w-full rounded-[6px] border border-zinc-200 px-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200/70 sm:max-w-[280px]"
                placeholder="Search templates"
              />
            </div>
          </div>
          <DataTable
            rows={filteredData}
            emptyText="No templates found."
            columns={[
              {
                key: "name",
                header: "Template",
                render: (row: (typeof templateRows)[number]) => (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplateId(row.id)}
                      className="font-medium text-zinc-900 transition hover:text-zinc-600"
                    >
                      {row.name}
                    </button>
                    <p className="text-xs text-zinc-400">{row.preview}</p>
                  </div>
                ),
              },
              {
                key: "category",
                header: "Category",
                render: (row: (typeof templateRows)[number]) => row.category,
              },
              {
                key: "language",
                header: "Language",
                render: (row: (typeof templateRows)[number]) => row.language,
              },
              {
                key: "status",
                header: "Status",
                render: (row: (typeof templateRows)[number]) => (
                  <StatusBadge tone={row.status === "Approved" ? "positive" : "warning"}>
                    {row.status}
                  </StatusBadge>
                ),
              },
              {
                key: "quality",
                header: "Quality",
                render: (row: (typeof templateRows)[number]) => row.quality,
              },
            ]}
          />
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionLabel
            title="Selected template"
            description="A minimal review panel for the currently highlighted message."
          />
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-zinc-950">{selectedTemplate.name}</p>
              <StatusBadge tone={selectedTemplate.status === "Approved" ? "positive" : "warning"}>
                {selectedTemplate.status}
              </StatusBadge>
            </div>
            <div className="rounded-[8px] border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-700">
              {selectedTemplate.preview}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[6px] border border-zinc-200 bg-white px-4 py-3">
                <p className="text-zinc-400">Category</p>
                <p className="mt-1 font-medium text-zinc-900">{selectedTemplate.category}</p>
              </div>
              <div className="rounded-[6px] border border-zinc-200 bg-white px-4 py-3">
                <p className="text-zinc-400">Variables</p>
                <p className="mt-1 font-medium text-zinc-900">{selectedTemplate.variables}</p>
              </div>
              <div className="rounded-[6px] border border-zinc-200 bg-white px-4 py-3">
                <p className="text-zinc-400">Language</p>
                <p className="mt-1 font-medium text-zinc-900">{selectedTemplate.language}</p>
              </div>
              <div className="rounded-[6px] border border-zinc-200 bg-white px-4 py-3">
                <p className="text-zinc-400">Updated</p>
                <p className="mt-1 font-medium text-zinc-900">{selectedTemplate.updatedAt}</p>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageTransition>
  );
}
