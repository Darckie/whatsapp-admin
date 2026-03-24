import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiSend } from "react-icons/fi";
import {
  AvatarName,
  Button,
  InputField,
  PageTransition,
  SectionHeading,
  SectionLabel,
  StatusBadge,
  SurfaceCard,
} from "components/dashboard/ui";
import { inboxThreads } from "data/mockData";

export default function TeamInbox() {
  const [selectedThreadId, setSelectedThreadId] = useState(inboxThreads[0].id);
  const [search, setSearch] = useState("");
  const [draftReply, setDraftReply] = useState("");

  const filteredThreads = inboxThreads.filter((thread) =>
    [thread.customerName, thread.phone, thread.lastMessage, thread.segment]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const selectedThread =
    filteredThreads.find((thread) => thread.id === selectedThreadId) ?? filteredThreads[0];

  const sendReply = () => {
    if (!draftReply.trim()) {
      return;
    }

    toast.success("Reply queued locally for preview.");
    setDraftReply("");
  };

  return (
    <PageTransition className="space-y-6">
      <SectionHeading
        eyebrow="Inbox"
        title="Every conversation in a quiet, readable workspace."
        description="The layout keeps the thread list, conversation detail and customer context visible without visual clutter."
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <SurfaceCard className="p-4">
          <InputField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone or segment"
          />
          <div className="mt-4 space-y-2">
            {filteredThreads.map((thread) => (
              <button
                key={thread.id}
                className={[
                  "w-full rounded-[6px] border px-4 py-4 text-left transition",
                  selectedThread?.id === thread.id
                    ? "border-zinc-200 bg-zinc-50"
                    : "border-transparent hover:bg-zinc-50",
                ].join(" ")}
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <AvatarName name={thread.customerName} subtext={thread.phone} />
                  {thread.unread ? (
                    <span className="inline-flex min-w-[22px] justify-center rounded-[6px] bg-blue-600 px-1.5 py-1 text-xs text-white">
                      {thread.unread}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                  {thread.lastMessage}
                </p>
              </button>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex min-h-[640px] flex-col">
          {selectedThread ? (
            <>
              <div className="border-b border-zinc-200 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <AvatarName
                    name={selectedThread.customerName}
                    subtext={`${selectedThread.segment} · ${selectedThread.assignedTo}`}
                  />
                  <StatusBadge tone={selectedThread.status === "Live" ? "positive" : "neutral"}>
                    {selectedThread.status}
                  </StatusBadge>
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                {selectedThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={[
                      "max-w-[78%] rounded-[8px] border px-4 py-3 text-sm leading-6",
                      message.sender === "agent"
                        ? "ml-auto border-blue-600 bg-blue-600 text-white"
                        : message.sender === "system"
                        ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                        : "border-zinc-200 bg-white text-zinc-700",
                    ].join(" ")}
                  >
                    <p>{message.text}</p>
                    <p
                      className={[
                        "mt-2 text-xs",
                        message.sender === "agent" ? "text-zinc-300" : "text-zinc-400",
                      ].join(" ")}
                    >
                      {message.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-200 px-6 py-5">
                <div className="space-y-3">
                  <textarea
                    value={draftReply}
                    onChange={(e) => setDraftReply(e.target.value)}
                    className="min-h-[110px] w-full rounded-[6px] border border-zinc-200 px-3 py-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Write a quick reply or support update"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-zinc-400">
                      Replies stay local for demo purposes.
                    </p>
                    <Button onClick={sendReply}>
                      <FiSend className="h-4 w-4" />
                      Send reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No conversations match your search.
            </div>
          )}
        </SurfaceCard>

        <div className="space-y-4">
          <SurfaceCard className="p-6">
            <SectionLabel
              title="Customer context"
              description="Support the agent with the essentials, not a wall of fields."
            />
            {selectedThread ? (
              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-zinc-400">Phone</p>
                  <p className="mt-1 font-medium text-zinc-900">{selectedThread.phone}</p>
                </div>
                <div className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-zinc-400">Assigned to</p>
                  <p className="mt-1 font-medium text-zinc-900">{selectedThread.assignedTo}</p>
                </div>
                <div className="rounded-[6px] border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-zinc-400">Conversation note</p>
                  <p className="mt-1 leading-6 text-zinc-700">{selectedThread.notes}</p>
                </div>
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <SectionLabel
              title="Service signal"
              description="Simple context to help route the next best response."
            />
            {selectedThread ? (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Sentiment</span>
                  <span className="font-medium text-zinc-900">{selectedThread.satisfaction}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Last activity</span>
                  <span className="font-medium text-zinc-900">{selectedThread.lastSeen}</span>
                </div>
              </div>
            ) : null}
          </SurfaceCard>
        </div>
      </div>
    </PageTransition>
  );
}
