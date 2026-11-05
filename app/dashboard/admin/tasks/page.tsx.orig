"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types matching schema
type TaskStatus = "todo" | "in_progress" | "done";

interface AppTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
}

const INITIAL_TASKS: AppTask[] = [
  { id: "1", title: "Setup database schema", status: "done", priority: "high" },
  { id: "2", title: "Create authentication flow", status: "in_progress", priority: "high" },
  { id: "3", title: "Design landing page", status: "todo", priority: "medium" },
  { id: "4", title: "Implement Kanban drag-drop", status: "in_progress", priority: "high" },
];

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

function SortableTaskItem({ task }: { task: AppTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: task });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 mb-3 bg-card border rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
        isDragging ? 'ring-2 ring-primary border-primary' : ''
      }`}
    >
      <div className="font-medium text-sm mb-2">{task.title}</div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">{task.id}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
          task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

export default function TasksKanbanPage() {
  const [tasks, setTasks] = React.useState<AppTask[]>(INITIAL_TASKS);
  const [activeTask, setActiveTask] = React.useState<AppTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task' || true;
    const isOverTask = over.data.current?.type === 'Task' || true;

    if (!isActiveTask) return;

    const activeTaskIndex = tasks.findIndex((t) => t.id === activeId);
    const overTaskIndex = tasks.findIndex((t) => t.id === overId);

    // If dropping over another task
    if (activeTaskIndex !== -1 && overTaskIndex !== -1 && tasks[activeTaskIndex].status !== tasks[overTaskIndex].status) {
       setTasks((prev) => {
         const newTasks = [...prev];
         newTasks[activeTaskIndex] = { ...newTasks[activeTaskIndex], status: newTasks[overTaskIndex].status };
         return arrayMove(newTasks, activeTaskIndex, overTaskIndex);
       });
       return;
    }

    // If dropping over an empty column
    const isOverColumn = COLUMNS.some(c => c.id === overId);
    if (activeTaskIndex !== -1 && isOverColumn) {
       setTasks((prev) => {
         const newTasks = [...prev];
         newTasks[activeTaskIndex].status = overId as TaskStatus;
         return newTasks;
       });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    const overIndex = tasks.findIndex((t) => t.id === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
      setTasks((tasks) => arrayMove(tasks, activeIndex, overIndex));
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Task Board</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
          + New Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max items-start">
            {COLUMNS.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div key={col.id} className="flex flex-col w-80 bg-muted/40 rounded-xl p-4 flex-shrink-0 h-full border border-border/50">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Needs an id to be droppable when empty */}
                  <div className="flex-1" id={col.id}>
                    <SortableContext
                      id={col.id}
                      items={columnTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="min-h-[150px]">
                        {columnTasks.map((task) => (
                          <SortableTaskItem key={task.id} task={task} />
                        ))}
                        {columnTasks.length === 0 && (
                          <div className="h-full w-full border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center text-muted-foreground text-sm py-8">
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="p-4 bg-card border ring-2 ring-primary shadow-xl rounded-md opacity-90 scale-105 transform cursor-grabbing">
                <div className="font-medium text-sm mb-2">{activeTask.title}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">{activeTask.id}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
