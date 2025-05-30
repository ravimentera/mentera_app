interface ApprovalsHeaderProps {
  className?: string;
}

export function ApprovalsHeader({ className }: ApprovalsHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Approvals</h1>
      <p className="text-sm text-muted-foreground">Review and Approve Daily Patient Interactions</p>
    </div>
  );
}
