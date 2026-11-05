"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode | ((column: ColumnDef<T>) => React.ReactNode);
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;

  // Pagination
  pagination?: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };

  // Bulk Selection
  enableSelection?: boolean;
  selectedRowKeys?: Set<string>;
  onSelectionChange?: (selectedKeys: Set<string>) => void;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  isLoading,
  emptyMessage = "No results.",
  pagination,
  enableSelection,
  selectedRowKeys,
  onSelectionChange,
}: DataTableProps<T>) {
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const newSelected = new Set<string>();
      data.forEach((row) => newSelected.add(rowKey(row)));
      onSelectionChange(newSelected);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (!onSelectionChange || !selectedRowKeys) return;
    const newSelected = new Set(selectedRowKeys);
    if (e.target.checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    onSelectionChange(newSelected);
  };

  const isAllSelected = data.length > 0 && data.every((row) => selectedRowKeys?.has(rowKey(row)));
  const isSomeSelected =
    data.length > 0 && data.some((row) => selectedRowKeys?.has(rowKey(row))) && !isAllSelected;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {enableSelection && (
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    className="translate-y-[2px]"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {typeof col.header === "function" ? col.header(col) : col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: pagination?.pageSize || 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {enableSelection && (
                    <TableCell className="w-12 text-center">
                      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={`skeleton-${idx}-${col.key}`}>
                      <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length ? (
              data.map((row) => {
                const key = rowKey(row);
                const isSelected = selectedRowKeys?.has(key);
                return (
                  <TableRow
                    key={key}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {enableSelection && (
                      <TableCell className="w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="translate-y-[2px]"
                          checked={isSelected || false}
                          onChange={(e) => handleSelectRow(e, key)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableSelection ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {enableSelection && selectedRowKeys && (
              <span>
                {selectedRowKeys.size} of {pagination.totalCount} row(s) selected.
              </span>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Page {pagination.pageIndex + 1}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-transparent p-0 disabled:opacity-50"
                onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                &lt;
              </button>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-transparent p-0 disabled:opacity-50"
                onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                disabled={
                  (pagination.pageIndex + 1) * pagination.pageSize >= pagination.totalCount
                }
              >
                <span className="sr-only">Go to next page</span>
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
