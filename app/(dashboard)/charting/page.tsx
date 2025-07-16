"use client";

import { Badge, Button, Input } from "@/components/atoms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/molecules";
import { useGetProviderChartsQuery } from "@/lib/store/api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/slices/authSlice";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Toaster } from "sonner";
import { ChartDetailDrawer } from "./components/ChartDetailDrawer";
import { NewChartingDialog } from "./components/NewChartingDialog";
import type { Chart, ChartingPeriod } from "./types";

// Helper function to get chart type badge variant
const getChartTypeBadge = (chartType: string) => {
  switch (chartType) {
    case "prechart":
      return "bg-yellow-100 text-yellow-800";
    case "postchart":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-green-100 text-green-800";
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  // Otherwise return formatted date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Helper function to get patient name from patientId
const getPatientName = (patientId: string) => {
  // This could be enhanced to fetch actual patient names from API
  // For now, using patient ID mapping based on the API response pattern
  const patientNames: Record<string, string> = {
    "PT-1005": "Kathlyn Price",
    "PT-1001": "Emma Rodriguez",
    "PT-1002": "Jessica Brown",
    "PT-1003": "Samuel Doe",
  };

  return patientNames[patientId] || patientId;
};

// Helper function to get provider name from providerId
const getProviderName = (providerIds: string[]) => {
  // This could be enhanced to fetch actual provider names from API
  const providerNames: Record<string, string> = {
    "PR-2001": "Rachel Garcia",
    "PR-2002": "Kate Wilson",
    "PR-2003": "Jackson Smith",
  };

  return providerNames[providerIds[0]] || providerIds[0] || "Unknown";
};

// Skeleton column configuration for charting table
const chartingTableSkeletonColumns = [
  { width: "w-40" }, // Name
  { width: "w-24" }, // Provider
  { width: "w-28" }, // Treatment
  { width: "w-24", shape: "rounded-full" as const }, // Type
  { width: "w-40" }, // Appointment Date
];

export default function ChartingPage() {
  const [activeTab, setActiveTab] = useState<ChartingPeriod>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChartingDialogOpen, setIsNewChartingDialogOpen] = useState(false);
  const [isChartDetailDrawerOpen, setIsChartDetailDrawerOpen] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string>();
  const [selectedPatientId, setSelectedPatientId] = useState<string>();

  // Get current user from auth state
  const user = useAppSelector(selectUser);
  const providerId = user?.providerId || "PR-2001"; // Fallback to default

  // API call to fetch charts
  const { data: charts = [], isLoading, error } = useGetProviderChartsQuery(providerId);

  // Filter charts based on active tab and search query
  const filteredCharts = useMemo(() => {
    let filtered = charts;

    // Filter by period
    if (activeTab !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filtered = charts.filter((chart) => {
        const chartDate = new Date(chart.createdAt);
        chartDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

        if (activeTab === "today") {
          return chartDate.getTime() === today.getTime();
        }

        if (activeTab === "tomorrow") {
          return chartDate.getTime() === tomorrow.getTime();
        }

        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((chart) => {
        const patientName = getPatientName(chart.patientId).toLowerCase();
        const providerName = getProviderName(chart.providerIds).toLowerCase();
        const treatmentType = chart.treatmentType.toLowerCase();

        return (
          patientName.includes(query) ||
          providerName.includes(query) ||
          treatmentType.includes(query) ||
          chart.patientId.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [charts, activeTab, searchQuery]);

  const handleNewCharting = () => {
    setIsNewChartingDialogOpen(true);
  };

  const handleChartClick = (chart: Chart) => {
    // TODO: Handle chart click/edit
    console.log("Chart clicked:", chart);
  };

  const handleContinueCharting = (patientId: string, chartId?: string) => {
    // When a chart is created, show the detail drawer
    setSelectedPatientId(patientId);
    setSelectedChartId(chartId);
    setIsChartDetailDrawerOpen(true);
  };

  const handleRowClick = (chart: Chart) => {
    setSelectedChartId(chart.id);
    setSelectedPatientId(chart.patientId);
    setIsChartDetailDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="space-y-6 flex-none mb-4 p-6 pb-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-gray-900">Charting</h1>
          </div>
          <Button onClick={handleNewCharting}>
            <Plus className="h-4 w-4 mr-2 text-white" />
            New Charting
          </Button>
        </div>

        {/* Tabs and Search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Tabs
              value={activeTab}
              defaultValue="all"
              onValueChange={(value) => setActiveTab(value as ChartingPeriod)}
            >
              <TabsList className="flex py-1.5 bg-ui-background-subtle">
                <TabsTrigger
                  value="today"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                    activeTab === "today"
                      ? "bg-brand-blue-light text-brand-blue border-brand-blue"
                      : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Today
                </TabsTrigger>
                <TabsTrigger
                  value="tomorrow"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                    activeTab === "tomorrow"
                      ? "bg-brand-blue-light text-brand-blue border-brand-blue"
                      : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Tomorrow
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                    activeTab === "all"
                      ? "bg-brand-blue-light text-brand-blue border-brand-blue"
                      : "text-text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative flex items-center">
              <Input
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10 py-2 border-ui-border-subtle h-10 w-80 bg-white"
              />
              <div className="absolute left-3 pointer-events-none">
                <Search className="h-4.5 w-4.5 text-ui-icon-gray" />
              </div>
            </div>
          </div>

          <div className="text-text-muted">
            {isLoading ? (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 inline-block"></div>
            ) : (
              `${filteredCharts.length} records`
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-lg border border-ui-border h-fit min-h-80 border-l-0">
          <Table
            isLoading={isLoading}
            skeletonRows={8}
            skeletonColumns={chartingTableSkeletonColumns}
          >
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="border-b border-ui-border hover:bg-white">
                <TableHead className="text-xs uppercase pl-4">Name</TableHead>
                <TableHead className="text-xs uppercase">Provider</TableHead>
                <TableHead className="text-xs uppercase">Treatment</TableHead>
                <TableHead className="text-xs uppercase">Type</TableHead>
                <TableHead className="text-xs uppercase">Appointment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              {error ? (
                <TableRow>
                  <TableCell
                    colSpan={chartingTableSkeletonColumns.length}
                    className="text-center text-sm text-red-500"
                  >
                    Error loading charts
                  </TableCell>
                </TableRow>
              ) : filteredCharts.length > 0 ? (
                filteredCharts.map((chart) => (
                  <TableRow
                    key={chart.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(chart)}
                  >
                    <TableCell className="font-medium text-gray-900">
                      {getPatientName(chart.patientId)}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {getProviderName(chart.providerIds)}
                    </TableCell>
                    <TableCell className="text-gray-700 capitalize">
                      {chart.treatmentType}
                    </TableCell>
                    <TableCell>
                      <Badge className={getChartTypeBadge(chart.chartType)}>
                        {chart.chartType === "prechart" ? "Pre Chart" : "Post Chart"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{formatDate(chart.createdAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={chartingTableSkeletonColumns.length}
                    className="text-center text-sm text-text-muted"
                  >
                    No charting records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <NewChartingDialog
        open={isNewChartingDialogOpen}
        onOpenChange={setIsNewChartingDialogOpen}
        onContinue={handleContinueCharting}
      />

      <ChartDetailDrawer
        open={isChartDetailDrawerOpen}
        onOpenChange={setIsChartDetailDrawerOpen}
        chartId={selectedChartId}
        patientId={selectedPatientId}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}
