"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { useState } from "react";

interface EHRProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  popular?: boolean;
  comingSoon?: boolean;
}

interface EHRIntegrationStepProps {
  organizationId: string;
  onComplete: (ehrData: any) => void;
  onSkip?: () => void;
}

const EHR_PROVIDERS: EHRProvider[] = [
  {
    id: "drchrono",
    name: "DrChrono",
    description: "Cloud-based EHR for medical practices",
    logo: "Dr",
    popular: true,
  },
  {
    id: "epic",
    name: "Epic",
    description: "Enterprise healthcare software",
    logo: "E",
    comingSoon: true,
  },
  {
    id: "cerner",
    name: "Cerner",
    description: "Health information technology",
    logo: "C",
    comingSoon: true,
  },
  {
    id: "athenahealth",
    name: "athenahealth",
    description: "Cloud-based healthcare platform",
    logo: "A",
    comingSoon: true,
  },
];

export function EHRIntegrationStep({
  organizationId,
  onComplete,
  onSkip,
}: EHRIntegrationStepProps) {
  const [selectedEHR, setSelectedEHR] = useState<string>("");
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEHRSelect = (ehrId: string) => {
    if (ehrId === "drchrono") {
      setSelectedEHR(ehrId);
      setShowCredentials(true);
    } else {
      // Coming soon providers
      alert("This EHR integration is coming soon!");
    }
  };

  const handleConnect = async () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      setError("Please enter both Client ID and Client Secret");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First get setup instructions
      const setupResponse = await fetch("/api/integrations/drchrono/connect-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup-instructions" }),
      });

      const setupData = await setupResponse.json();

      if (!setupData.success) {
        throw new Error("Failed to get setup instructions");
      }

      // Then initiate connection
      const connectResponse = await fetch("/api/integrations/drchrono/connect-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          organizationId,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        }),
      });

      const connectData = await connectResponse.json();

      if (connectData.success && connectData.oauthUrl) {
        // Store EHR data and redirect to OAuth
        const ehrData = {
          provider: "drchrono",
          clientId: credentials.clientId,
          status: "connecting",
          oauthUrl: connectData.oauthUrl,
        };

        onComplete(ehrData);

        // Redirect to OAuth
        window.location.href = connectData.oauthUrl;
      } else {
        throw new Error(connectData.error || "Failed to initiate connection");
      }
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Connect Your EHR System</h2>
        <p className="text-gray-600">
          Integrate with your Electronic Health Record system to sync patient data seamlessly
        </p>
      </div>

      {!showCredentials ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose your EHR provider:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EHR_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={`relative p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                  provider.comingSoon ? "opacity-50 cursor-not-allowed" : "hover:border-blue-300"
                } ${selectedEHR === provider.id ? "border-blue-500 bg-blue-50" : ""}`}
                onClick={() => !provider.comingSoon && handleEHRSelect(provider.id)}
              >
                {provider.popular && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
                {provider.comingSoon && (
                  <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{provider.logo}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{provider.name}</h4>
                    <p className="text-sm text-gray-600">{provider.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleSkip}>
              Skip for now
            </Button>
            <div className="text-sm text-gray-500 self-center">
              You can add EHR integration later from your dashboard
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">DrChrono Integration Setup</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>Before continuing, you&apos;ll need to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Sign in to your DrChrono account</li>
                <li>
                  Go to{" "}
                  <a
                    href="https://app.drchrono.com/api-management/"
                    target="_blank"
                    className="underline"
                    rel="noreferrer"
                  >
                    API Management
                  </a>
                </li>
                <li>
                  Add this redirect URI:{" "}
                  <code className="bg-blue-100 px-1 rounded">
                    https://mentera-app.vercel.app/api/integrations/drchrono/callback
                  </code>
                </li>
                <li>Copy your Client ID and Client Secret</li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="clientId">DrChrono Client ID</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter your DrChrono Client ID"
                value={credentials.clientId}
                onChange={(e) => setCredentials((prev) => ({ ...prev, clientId: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="clientSecret">DrChrono Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Enter your DrChrono Client Secret"
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

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCredentials(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConnect}
                disabled={loading || !credentials.clientId || !credentials.clientSecret}
                className="flex-1"
              >
                {loading ? "Connecting..." : "Connect DrChrono"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
