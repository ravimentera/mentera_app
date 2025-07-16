"use client";

import type { ChartGenerationRequest } from "@/app/(dashboard)/charting/types";
import { Button, Input } from "@/components/atoms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules";
import { useGenerateChartMutation, useGetPatientsByProviderQuery } from "@/lib/store/api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/slices/authSlice";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface NewChartingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: (selectedPatient: string, chartId?: string) => void;
}

// Format phone number helper
const formatPhone = (phone: string) => {
  // Remove +1 and format as needed
  const cleaned = phone.replace(/^\+1/, "");
  if (cleaned.length === 10) {
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export function NewChartingDialog({ open, onOpenChange, onContinue }: NewChartingDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  // Get current user from auth state
  const user = useAppSelector(selectUser);
  const providerId = user?.providerId || "PR-2001"; // Fallback to default

  // API calls
  const { data: patients = [], isLoading, error } = useGetPatientsByProviderQuery(providerId);
  const [generateChart, { isLoading: isGenerating }] = useGenerateChartMutation();

  const handleCancel = () => {
    setSearchQuery("");
    setSelectedPatient("");
    onOpenChange(false);
  };

  const handleContinue = async () => {
    if (!selectedPatient) return;

    try {
      // Prepare chart generation request with mock values for now
      // In a real application, these would come from a form or props
      const chartRequest: ChartGenerationRequest = {
        providerIds: [providerId],
        primaryProviderId: providerId,
        patientId: selectedPatient,
        visitId: "a8428e58-ccdd-4212-b79d-59182a0b3906", // Mock visit ID
        treatmentId: "cb1aef45-2b3f-44f1-b5d0-9e7f5f6de4e7", // Mock treatment ID
        chartType: "prechart",
        templateId: "3f65bf7e-5f2c-4342-92bd-38c5af51855f", // Mock template ID
        additionalContext: "Standard charting procedure",
        useAI: true,
        aiOptions: {
          tone: "professional",
          detail: "standard",
        },
      };

      const result = await generateChart(chartRequest).unwrap();

      toast.success("Chart generated successfully!");

      if (onContinue) {
        onContinue(selectedPatient, result.id);
      }

      handleCancel(); // Close and reset
    } catch (error) {
      console.error("Failed to generate chart:", error);
      toast.error("Failed to generate chart. Please try again.");
    }
  };

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients; // Show all patients when no search query

    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        patient.phone.includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.patientId.toLowerCase().includes(query)
      );
    });
  }, [patients, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Charting</DialogTitle>
          <DialogDescription className="sr-only">
            Select a patient to create a new chart
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <label htmlFor="patient-search" className="text-base font-semibold text-gray-900">
              Select Patient
            </label>

            <div className="space-y-2">
              <div className="relative flex items-center">
                <Input
                  id="patient-search"
                  placeholder="Search patient by name or phone…"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10 py-2 border-gray-300 h-10 bg-white"
                />
                <div className="absolute left-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Patient List */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading patients...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">Error loading patients</div>
                ) : filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, index) => (
                    <div key={patient.patientId}>
                      <button
                        type="button"
                        className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                          selectedPatient === patient.patientId ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => {
                          setSelectedPatient(patient.patientId);
                        }}
                      >
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.patientId} | {formatPhone(patient.phone)} | {patient.email}
                          </div>
                        </div>
                      </button>
                      {index < filteredPatients.length - 1 && (
                        <div className="border-b border-gray-100" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery
                      ? "No patients found matching your search"
                      : "No patients available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedPatient || isGenerating}
            className={`${!selectedPatient || isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isGenerating ? "Generating..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
