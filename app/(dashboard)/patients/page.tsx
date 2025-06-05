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
import { patients } from "@/mock/patients.data";
import { ChevronDownIcon, Filter, MoreHorizontalIcon, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PatientFilters } from "./types";

// Function to generate dummy contact info
const generateDummyContacts = () => {
  const phoneNumbers = [
    "(555) 123-4567",
    "(555) 234-5678",
    "(555) 345-6789",
    "(555) 456-7890",
    "(555) 567-8901",
  ];

  const emailDomains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"];

  const getRandomPhone = () => phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
  const getRandomEmail = (name: string) => {
    const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
    return `${name.toLowerCase().replace(/\s+/g, ".")}@${domain}`;
  };

  return patients.map((patient) => ({
    ...patient,
    phoneNumber: getRandomPhone(),
    email: getRandomEmail(patient.provider),
  }));
};

// Generate patients with contact info
const patientsWithContacts = generateDummyContacts();

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PatientFilters>({
    status: "All",
  });

  // Filter patients based on search query
  const filteredPatients = patientsWithContacts.filter((patient) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.patientId.toLowerCase().includes(query) ||
      patient.provider.toLowerCase().includes(query) ||
      patient.treatmentNotes.procedure.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.phoneNumber.includes(query)
    );
  });

  const handleRowClick = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="space-y-6 flex-none mb-4 p-6 pb-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">Patients</h1>
            <p className="text-sm text-[#6B7280]">Manage all patients and their data</p>
          </div>
          <Button className="bg-[#8A03D3] hover:bg-[#8A03D3]/90 h-10 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex items-center">
                <Input
                  placeholder="Search by ID, provider, email, or phone"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10 py-2 border-[#E5E7EB] h-10 w-[350px] bg-white"
                />
                <div className="absolute left-3 pointer-events-none">
                  <Search className="h-[18px] w-[18px] text-[#9CA3AF]" />
                </div>
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 border-[#E2E8F0]">
                <Filter className="h-[18px] w-[18px] text-[#6B7280]" />
              </Button>
              <Button variant="outline" className="h-10 px-4 py-2 border-[#E2E8F0]">
                All Status
                <ChevronDownIcon className="h-4 w-4 ml-2 text-[#6B7280]" />
              </Button>
            </div>
          </div>
          <div className="mt-1.5 text-right text-[#71717A]">{filteredPatients.length} records</div>
        </div>
      </div>

      {/* Table with fixed header and scrollable body */}
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-lg border border-[#E2E8F0] h-full border-l-0">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="border-b border-[#E2E8F0] hover:bg-white">
                <TableHead className="text-xs uppercase pl-4">ID</TableHead>
                <TableHead className="text-xs uppercase">Name</TableHead>
                <TableHead className="text-xs uppercase">Phone Number</TableHead>
                <TableHead className="text-xs uppercase">Email</TableHead>
                <TableHead className="text-xs uppercase">Next Session</TableHead>
                <TableHead className="text-xs uppercase">Last Visit Date</TableHead>
                <TableHead className="text-xs uppercase">Tags</TableHead>
                <TableHead className="text-xs uppercase">Status</TableHead>
                <TableHead className="text-xs uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              {filteredPatients.map((patient) => (
                <TableRow key={patient.patientId} onClick={() => handleRowClick(patient.patientId)}>
                  <TableCell className="text-sm text-[#09090B] pl-4">{patient.patientId}</TableCell>
                  <TableCell className="text-sm font-medium text-[#111827]">
                    {patient.provider}
                  </TableCell>
                  <TableCell className="text-sm text-[#09090B]">{patient.phoneNumber}</TableCell>
                  <TableCell className="text-sm text-[#09090B]">{patient.email}</TableCell>
                  <TableCell className="text-sm text-[#09090B]">{patient.followUpDate}</TableCell>
                  <TableCell className="text-sm text-[#09090B]">{patient.visitDate}</TableCell>
                  <TableCell>
                    {patient.alerts.length > 0 ? (
                      patient.alerts.map((alert) => (
                        <Badge
                          key={alert}
                          className="bg-[#EFF6FF] text-[#2563EB] hover:bg-[#EFF6FF] mr-1"
                        >
                          {alert}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-[#EFF6FF] text-[#2563EB] hover:bg-[#EFF6FF]">
                        {patient.providerSpecialty}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        patient.treatmentOutcome === "Positive"
                          ? "bg-[#F0FDF4] text-[#047857] hover:bg-[#F0FDF4]"
                          : "bg-[#F4F4F5] text-[#09090B] hover:bg-[#F4F4F5]"
                      }
                    >
                      {patient.treatmentOutcome}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontalIcon className="h-[17px] w-[17px] text-[#9CA3AF]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
