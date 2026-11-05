"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";

// This is a placeholder type matching the schema reference
type StudioTicket = {
  id: string;
  subject: string;
  email: string;
  priority: string;
  status: string;
  created_at: string;
};

const MOCK_TICKETS: StudioTicket[] = [
  { id: "1", subject: "Cannot login to app", email: "user@example.com", priority: "high", status: "open", created_at: new Date().toISOString() },
  { id: "2", subject: "Billing issue", email: "billing@example.com", priority: "medium", status: "resolved", created_at: new Date().toISOString() },
  { id: "3", subject: "Feature request", email: "features@example.com", priority: "low", status: "open", created_at: new Date().toISOString() },
];

export default function TicketsInboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ticketId = searchParams.get("ticketId");

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());

  const activeTicket = MOCK_TICKETS.find(t => t.id === ticketId);

  const handleRowClick = (row: StudioTicket) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ticketId", row.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeTicket = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("ticketId");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-background">
      {/* List View */}
      <div className={`flex-1 overflow-auto border-r p-6 transition-all ${ticketId ? "hidden md:block md:w-1/2 lg:w-2/3" : "w-full"}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Support Inbox</h1>
        </div>

        <DataTable
          data={MOCK_TICKETS}
          rowKey={(row) => row.id}
          onRowClick={handleRowClick}
          enableSelection
          selectedRowKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          columns={[
            {
              key: "subject",
              header: "Subject",
              cell: (row) => <span className="font-medium">{row.subject}</span>,
            },
            {
              key: "status",
              header: "Status",
              cell: (row) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {row.status}
                </span>
              ),
            },
            {
              key: "priority",
              header: "Priority",
              cell: (row) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  row.priority === 'high' ? 'bg-red-100 text-red-800' :
                  row.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {row.priority}
                </span>
              ),
            },
            {
              key: "email",
              header: "Customer",
              cell: (row) => <span className="text-muted-foreground text-sm">{row.email}</span>,
            },
          ]}
        />
      </div>

      {/* Slide-out / Side-sheet Editor */}
      {ticketId && activeTicket && (
        <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col border-l bg-card shadow-xl animate-in slide-in-from-right-8 duration-300 z-10 absolute md:static inset-y-0 right-0">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold truncate px-2">{activeTicket.subject}</h2>
            <button
              onClick={closeTicket}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">From</p>
              <p className="font-medium">{activeTicket.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Details</p>
              <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap">
                User reported issues with the billing dashboard not updating correctly after making a payment. Please investigate the webhook logs.
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Reply</h3>
              <textarea
                className="w-full min-h-[150px] p-3 rounded-md border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type your reply here... Use / to search reply templates."
              />
              <div className="flex justify-end mt-4 space-x-2">
                <button className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors">
                  Resolve
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
