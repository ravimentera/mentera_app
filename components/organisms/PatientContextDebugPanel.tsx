// components/organisms/PatientContextDebugPanel.tsx
"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { selectCurrentPatient, selectSelectedPatientId } from "@/lib/store/slices/globalStateSlice";
import { classifyQuery } from "@/utils/queryClassifier";
import React, { useState } from "react";
import { useSelector } from "react-redux";

interface PatientContextDebugPanelProps {
  className?: string;
}

export function PatientContextDebugPanel({ className }: PatientContextDebugPanelProps) {
  const [testQuery, setTestQuery] = useState("");
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [showPanel, setShowPanel] = useState(false);

  const selectedPatientId = useSelector(selectSelectedPatientId);
  const currentPatient = useSelector(selectCurrentPatient);

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return;

    try {
      // Test the new API endpoint
      const response = await fetch("/api/queryClassifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: testQuery,
          threadId: "debug-thread-" + Date.now(),
          sessionAttributes: {
            activePatientId: selectedPatientId,
            providerId: "debug-provider",
            medspaId: "debug-medspa",
            threadId: "debug-thread",
          },
          existingMessages: [],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setClassificationResult(result);

        console.log("DEBUG: API Query Classification", {
          query: testQuery,
          result,
          hasPatientId: !!selectedPatientId,
          currentPatient: currentPatient?.name,
        });
      } else {
        console.error("API call failed:", response.status);
        setClassificationResult({ error: "API call failed" });
      }
    } catch (error) {
      console.error("Error calling API:", error);
      setClassificationResult({ error: "Network error" });
    }
  };

  const testQueries = [
    "Show me patient history",
    "What are the patient's allergies?",
    "List all my patients",
    "Show me all providers in the clinic",
    "What medications is the patient taking?",
    "How many patients do I have?",
    "Tell me about this patient's visits",
  ];

  if (!showPanel) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => setShowPanel(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
        >
          Debug Panel
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Patient Context Debug</h3>
        <Button onClick={() => setShowPanel(false)} variant="ghost" size="sm">
          ×
        </Button>
      </div>

      <div className="space-y-4">
        {/* Current State */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm font-medium text-gray-700 mb-2">Current State</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Patient ID: {selectedPatientId || "None selected"}</div>
            <div>Patient Name: {currentPatient?.name || "None"}</div>
          </div>
        </div>

        {/* Query Tester */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Test Query Classification
          </label>
          <div className="space-y-2">
            <Textarea
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter a query to test..."
              className="text-sm"
              rows={2}
            />
            <Button onClick={handleTestQuery} size="sm" className="w-full">
              Classify Query
            </Button>
          </div>
        </div>

        {/* Classification Result */}
        {classificationResult && (
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm font-medium text-blue-700 mb-2">API Classification Result</div>
            {classificationResult.error ? (
              <div className="text-xs text-red-600">Error: {classificationResult.error}</div>
            ) : (
              <div className="text-xs text-blue-600 space-y-1">
                <div>Action: {classificationResult.action}</div>
                <div>Scope: {classificationResult.classification?.scope}</div>
                <div>
                  Requires Patient:{" "}
                  {classificationResult.classification?.requiresPatient ? "Yes" : "No"}
                </div>
                <div>
                  Confidence:{" "}
                  {((classificationResult.classification?.confidence || 0) * 100).toFixed(0)}%
                </div>
                <div>
                  Should Enhance:{" "}
                  {classificationResult.shouldEnhance ? "Yes (First message)" : "No"}
                </div>
                {classificationResult.enhancedQuery && (
                  <div className="mt-2">
                    <div className="font-medium">Enhanced Query Preview:</div>
                    <div className="text-xs bg-gray-100 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                      {classificationResult.enhancedQuery.substring(0, 200)}...
                    </div>
                  </div>
                )}
                <div
                  className={`px-2 py-1 rounded text-xs ${
                    classificationResult.action === "REQUEST_PATIENT_SELECTION"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {classificationResult.action === "REQUEST_PATIENT_SELECTION"
                    ? "Would trigger patient selection"
                    : "Would proceed normally"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Test Queries */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Tests</div>
          <div className="space-y-1">
            {testQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => setTestQuery(query)}
                className="text-xs text-blue-600 hover:text-blue-800 block w-full text-left p-1 hover:bg-blue-50 rounded"
              >
                "{query}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
