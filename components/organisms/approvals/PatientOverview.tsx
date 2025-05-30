import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { ApprovalItem } from "@/mock/approvals.data";
import { IdCardIcon } from "@radix-ui/react-icons";
import {
  Bell,
  Calendar,
  Clock,
  CopyPlus,
  ExternalLink,
  Mail,
  Smartphone,
  User,
} from "lucide-react";

interface PatientOverviewProps {
  approval: ApprovalItem;
  className?: string;
}

export function PatientOverview({ approval, className }: PatientOverviewProps) {
  return (
    <div
      className={cn(
        "w-[530px] bg-ui-background-gray rounded-lg p-4 space-y-6 overflow-y-auto",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Patient Overview</h2>
        <ExternalLink className="w-5 h-5 text-brand-purple-dark" />
      </div>

      {/* Next Appointments */}
      <div className="bg-white rounded-lg border border-ui-border p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-brand-blue" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Next Appointment</h3>
          </div>
          <Button variant="outline-ghost" size="sm" className="p-0 h-auto">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {approval.nextAppointments?.slice(0, 2).map((appointment, index) => (
            <div
              key={`appointment-${appointment.procedure}-${appointment.date}-${index}`}
              className={cn("rounded-lg p-3 space-y-2", index === 0 ? "bg-blue-50" : "bg-green-50")}
            >
              <div className="font-medium text-foreground">{appointment.procedure}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {appointment.date}, {appointment.time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{appointment.provider}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Summary */}
      <div className="bg-white rounded-lg border border-ui-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <CopyPlus className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Medical Summary</h3>
          </div>
          <Button variant="outline-ghost" size="sm" className="p-0 h-auto">
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          {approval.medicalSummary?.map((item, index) => (
            <div key={`medical-${item.allergy}-${index}`} className="space-y-1">
              <div className="font-medium text-sm text-foreground">Allergies to {item.allergy}</div>
              <div className="text-sm text-muted-foreground">Reaction : {item.reaction}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Packages */}
      <div className="bg-white rounded-lg border border-ui-border p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
              <IdCardIcon className="w-4 h-4 text-brand-purple" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Active Packages ({approval.activePackages?.length || 0}/
              {approval.activePackages?.length || 0 + 5})
            </h3>
          </div>
          <Button variant="outline-ghost" size="sm" className="p-0 h-auto">
            View All
          </Button>
        </div>

        <div className="space-y-6">
          {approval.activePackages?.map((pkg, index) => (
            <div key={`package-${pkg.name}-${index}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-sm text-foreground">{pkg.name}</div>
                <div className="text-sm text-muted-foreground">
                  {pkg.sessionsCompleted}/{pkg.totalSessions} Sessions
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-brand-purple-hover to-brand-purple-darkest h-2 rounded-full transition-all"
                  style={{ width: `${pkg.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-white rounded-lg border border-ui-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Campaigns</h3>
          </div>
          <Button variant="outline-ghost" size="sm" className="p-0 h-auto">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Last Email Campaign</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {approval.campaigns?.lastEmail || "None"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">SMS Last Campaign</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {approval.campaigns?.lastSms || "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
