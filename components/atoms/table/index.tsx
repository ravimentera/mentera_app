import * as React from "react";

import { cn } from "@/lib/utils";

// Skeleton Row Component
const SkeletonRow = ({
  columns,
}: { columns: Array<{ width: string; shape?: "rounded" | "rounded-full" | "square" }> }) => (
  <TableRow className="hover:bg-white">
    {columns.map((column) => (
      <TableCell key={crypto.randomUUID()} className={columns.indexOf(column) === 0 ? "pl-4" : ""}>
        <div
          className={cn(
            "bg-gray-200 animate-pulse",
            column.width,
            column.shape === "rounded-full"
              ? "h-5 rounded-full"
              : column.shape === "square"
                ? "h-8 w-8 rounded"
                : "h-4 rounded",
          )}
        />
      </TableCell>
    ))}
  </TableRow>
);

// Enhanced Table component with skeleton loading
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  isLoading?: boolean;
  skeletonRows?: number;
  skeletonColumns?: Array<{ width: string; shape?: "rounded" | "rounded-full" | "square" }>;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    { className, isLoading = false, skeletonRows = 8, skeletonColumns = [], children, ...props },
    ref,
  ) => {
    if (isLoading && skeletonColumns.length > 0) {
      // Extract header from children if it exists
      const childrenArray = React.Children.toArray(children);
      const header = childrenArray.find(
        (child) => React.isValidElement(child) && child.type === TableHeader,
      );

      return (
        <div className="relative w-full overflow-auto">
          <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props}>
            {/* Render the original header */}
            {header}
            <TableBody className="overflow-y-auto">
              {Array.from({ length: skeletonRows }, () => crypto.randomUUID()).map((id) => (
                <SkeletonRow key={id} columns={skeletonColumns} />
              ))}
            </TableBody>
          </table>
        </div>
      );
    }

    return (
      <div className="relative w-full overflow-auto">
        <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props}>
          {children}
        </table>
      </div>
    );
  },
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors hover:bg-gray-50 data-[state=selected]:bg-muted cursor-pointer",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-2 text-left align-middle font-semibold text-text-muted [&:has([role=checkbox])]:pr-0",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("py-4 px-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
