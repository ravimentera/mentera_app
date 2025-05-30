interface EmptyStateProps {
  className?: string;
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div className={className}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">No pending approvals</h2>
        <p className="text-muted-foreground">All messages have been reviewed.</p>
      </div>
    </div>
  );
}
