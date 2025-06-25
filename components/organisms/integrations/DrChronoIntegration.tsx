// Seamless DrChrono Integration UI Component
"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { useState } from "react";

interface DrChronoIntegrationProps {
  organizationId: string;
}

type IntegrationStep =
  | "initial"
  | "instructions"
  | "credentials"
  | "connecting"
  | "connected"
  | "error";

export function DrChronoIntegration({ organizationId }: DrChronoIntegrationProps) {
  const [step, setStep] = useState<IntegrationStep>("initial");
  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
  });
  const [instructions, setInstructions] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getSetupInstructions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations/drchrono/connect-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup-instructions" }),
      });

      const data = await response.json();
      if (data.success) {
        setInstructions(data);
        setStep("instructions");
      } else {
        setError(data.error || "Failed to get setup instructions");
        setStep("error");
      }
    } catch (err) {
      setError("Network error");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const connectDrChrono = async () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      setError("Please enter both Client ID and Client Secret");
      return;
    }

    setLoading(true);
    setStep("connecting");

    try {
      const response = await fetch("/api/integrations/drchrono/connect-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          organizationId,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        }),
      });

      const data = await response.json();
      if (data.success && data.oauthUrl) {
        // Open OAuth URL in current window
        window.location.href = data.oauthUrl;
      } else {
        setError(data.error || "Failed to initiate connection");
        setStep("error");
      }
    } catch (err) {
      setError("Network error");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  // Initial state - show integration option
  if (step === "initial") {
    return (
      <div className="p-6 border rounded-lg bg-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-bold">Dr</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">DrChrono</h3>
            <p className="text-gray-600">Connect your electronic health record system</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Integrate with DrChrono to sync patient data, appointments, and clinical information.
        </p>

        <Button onClick={getSetupInstructions} disabled={loading} className="w-full">
          {loading ? "Loading..." : "Connect DrChrono"}
        </Button>
      </div>
    );
  }

  // Setup instructions
  if (step === "instructions") {
    return (
      <div className="p-6 border rounded-lg bg-white max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">{instructions.title}</h3>
        <p className="text-gray-600 mb-6">{instructions.message}</p>

        <div className="space-y-6">
          {instructions.instructions.map((instruction: any, index: number) => (
            <div key={instruction.step} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                  {instruction.step}
                </span>
                <h4 className="font-medium">{instruction.title}</h4>
              </div>
              <p className="text-gray-600 mb-2">{instruction.description}</p>

              {instruction.url && (
                <a
                  href={instruction.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                >
                  {instruction.action} →
                </a>
              )}

              {instruction.code && (
                <div className="mt-2">
                  <code className="block bg-gray-100 p-3 rounded text-sm font-mono">
                    {instruction.code}
                  </code>
                  <p className="text-xs text-gray-500 mt-1">{instruction.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t">
          <Button onClick={() => setStep("credentials")} className="w-full">
            I&apos;ve completed the setup →
          </Button>
        </div>
      </div>
    );
  }

  // Credentials input
  if (step === "credentials") {
    return (
      <div className="p-6 border rounded-lg bg-white max-w-md">
        <h3 className="text-lg font-semibold mb-4">Enter DrChrono Credentials</h3>
        <p className="text-gray-600 mb-6">
          Copy your Client ID and Client Secret from DrChrono API Management.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="Your DrChrono Client ID"
              value={credentials.clientId}
              onChange={(e) => setCredentials((prev) => ({ ...prev, clientId: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="Your DrChrono Client Secret"
              value={credentials.clientSecret}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, clientSecret: e.target.value }))
              }
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("instructions")} className="flex-1">
              Back
            </Button>
            <Button
              onClick={connectDrChrono}
              disabled={loading || !credentials.clientId || !credentials.clientSecret}
              className="flex-1"
            >
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Connecting state
  if (step === "connecting") {
    return (
      <div className="p-6 border rounded-lg bg-white text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Connecting to DrChrono</h3>
        <p className="text-gray-600">You&apos;ll be redirected to authorize the integration...</p>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="p-6 border rounded-lg bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button
          onClick={() => {
            setError("");
            setStep("initial");
          }}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return null;
}
