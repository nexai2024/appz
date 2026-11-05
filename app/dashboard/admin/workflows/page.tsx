"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";

// Mock Data Types matching Schema
type WorkflowStatus = "active" | "inactive";

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  is_active: boolean;
  last_run: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: "success" | "failed" | "running";
  started_at: string;
  execution_data: string; // JSON string
  error_message?: string;
}

const MOCK_WORKFLOWS: Workflow[] = [
  { id: "1", name: "Welcome Email Sequence", description: "Send email when user signs up", trigger_type: "webhook", is_active: true, last_run: new Date().toISOString() },
  { id: "2", name: "Data Sync to CRM", description: "Sync customer data to HubSpot", trigger_type: "schedule", is_active: true, last_run: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", name: "Stripe Payment Failed", description: "Alert team on payment failure", trigger_type: "webhook", is_active: false, last_run: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_EXECUTIONS: Record<string, WorkflowExecution[]> = {
  "1": [
    { id: "e1", workflow_id: "1", status: "success", started_at: new Date().toISOString(), execution_data: JSON.stringify({ steps: [{ name: "Trigger", result: "ok" }, { name: "SendEmail", result: "ok", email: "test@test.com" }] }, null, 2) },
    { id: "e2", workflow_id: "1", status: "failed", started_at: new Date(Date.now() - 60000).toISOString(), execution_data: JSON.stringify({ steps: [{ name: "Trigger", result: "ok" }] }, null, 2), error_message: "Rate limit exceeded on Mailgun API" },
  ],
};

export default function WorkflowsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const workflowId = searchParams.get("workflowId");
  const activeWorkflow = MOCK_WORKFLOWS.find(w => w.id === workflowId);
  const activeExecutions = activeWorkflow ? (MOCK_EXECUTIONS[activeWorkflow.id] || []) : [];

  const handleRowClick = (row: Workflow) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("workflowId", row.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const closeSidebar = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("workflowId");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-background">
      {/* List View */}
      <div className={`flex-1 overflow-auto border-r p-6 transition-all ${workflowId ? "hidden lg:block lg:w-1/2" : "w-full"}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
            Create Workflow
          </button>
        </div>

        <DataTable
          data={MOCK_WORKFLOWS}
          rowKey={(row) => row.id}
          onRowClick={handleRowClick}
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (row) => (
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-muted-foreground">{row.description}</div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (row) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {row.is_active ? "Active" : "Inactive"}
                </span>
              ),
            },
            {
              key: "trigger",
              header: "Trigger",
              cell: (row) => <span className="text-sm capitalize">{row.trigger_type}</span>,
            },
            {
              key: "last_run",
              header: "Last Run",
              cell: (row) => <span className="text-sm text-muted-foreground">{new Date(row.last_run).toLocaleString()}</span>,
            },
          ]}
        />
      </div>

      {/* Slide-out Drawer: Execution Logs */}
      {workflowId && activeWorkflow && (
        <div className="w-full lg:w-1/2 flex flex-col border-l bg-card shadow-xl animate-in slide-in-from-right-8 duration-300 absolute lg:static inset-y-0 right-0 z-20">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div>
              <h2 className="text-lg font-semibold">{activeWorkflow.name}</h2>
              <p className="text-xs text-muted-foreground">Run History & Logs</p>
            </div>
            <div className="flex items-center gap-2">
               <button className="text-sm text-primary hover:underline font-medium px-2">Edit Workflow</button>
               <button
                 onClick={closeSidebar}
                 className="p-2 hover:bg-muted rounded-md transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
             {activeExecutions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                   No executions recorded for this workflow yet.
                </div>
             ) : (
                <div className="divide-y">
                   {activeExecutions.map(execution => (
                      <div key={execution.id} className="p-6">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                               <span className={`w-2 h-2 rounded-full ${
                                  execution.status === 'success' ? 'bg-green-500' :
                                  execution.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
                               }`} />
                               <span className="font-mono text-xs text-muted-foreground">{execution.id}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(execution.started_at).toLocaleString()}</span>
                         </div>

                         {execution.error_message && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-900 rounded-md text-sm font-medium">
                               Error: {execution.error_message}
                            </div>
                         )}

                         <div className="bg-slate-950 rounded-md p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-slate-300">
                               {execution.execution_data}
                            </pre>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
