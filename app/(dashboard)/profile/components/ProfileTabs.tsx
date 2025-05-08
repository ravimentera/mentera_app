"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules";
import { TabPlaceholder } from "./TabPlaceholder";

const tabItems = [
  { id: "overview", label: "Overview" },
  { id: "appointments", label: "Appointments" },
  { id: "medical-history", label: "Medical History" },
  { id: "inbox", label: "Inbox" },
  { id: "packages", label: "Packages" },
  { id: "resources", label: "Resources" },
  { id: "documents", label: "Documents" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function ProfileTabs({ activeTab, onTabChange, children }: ProfileTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="flex p-0 bg-[#FCFCFC]">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-b-sm border-b-2 ${
                activeTab === tab.id
                  ? "bg-[#F4F1FE] text-[#6941C6] border-[#6941C6] hover:bg-[#F4F1FE] hover:text-[#6941C6]"
                  : "text-[#475467] border-transparent hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabItems.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.id === "overview" ? children : <TabPlaceholder />}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
