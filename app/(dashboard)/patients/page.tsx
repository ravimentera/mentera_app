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
import { useGetPatientsByProviderQuery } from "@/lib/store/api";
import { ChevronDownIcon, Filter, MoreHorizontalIcon, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define skeleton column configuration for patients table
const patientTableSkeletonColumns = [
  { width: "w-16" }, // ID
  { width: "w-32" }, // Name
  { width: "w-28" }, // Phone Number
  { width: "w-40" }, // Email
  { width: "w-24" }, // Next Session
  { width: "w-24" }, // Last Visit Date
  { width: "w-20", shape: "rounded-full" as const }, // Tags
  { width: "w-16", shape: "rounded-full" as const }, // Status
  { width: "w-8", shape: "square" as const }, // Action
];

// Patient interface is imported from API types
type Patient = {
  id: string;
  patientId: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  status: string;
  lastVisitDate: string | null;
  nextAppointment: string | null;
};

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // API call to fetch patients from slice
  const { data: apiPatients, isLoading: apiLoading } = useGetPatientsByProviderQuery("NR-2001");

  // Use API data or fallback to empty array
  const patientsData = apiPatients || [];

  // Filter patients based on search query
  const filteredPatients = patientsData.filter((patient: Patient) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return (
      patient.patientId.toLowerCase().includes(query) ||
      fullName.includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.phone.includes(query)
    );
  });

  const handleRowClick = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Format phone helper
  const formatPhone = (phone: string) => {
    // Remove +1 and format as (xxx) xxx-xxxx
    const cleaned = phone.replace(/^\+1/, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="space-y-6 flex-none mb-4 p-6 pb-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-gray-900">Patients</h1>
            <p className="text-sm text-text-gray-500">Manage all patients and their data</p>
          </div>
          <Button className="bg-brand-purple-dark hover:bg-brand-purple-dark/90 h-10 px-4 py-2">
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
                  placeholder="Search by ID, name, email, or phone"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10 py-2 border-ui-border-subtle h-10 w-22 bg-white"
                />
                <div className="absolute left-3 pointer-events-none">
                  <Search className="h-4.5 w-4.5 text-ui-icon-gray" />
                </div>
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 border-ui-border">
                <Filter className="h-4.5 w-4.5 text-text-gray-500" />
              </Button>
              <Button variant="outline" className="h-10 px-4 py-2 border-ui-border">
                All Status
                <ChevronDownIcon className="h-4 w-4 ml-2 text-text-gray-500" />
              </Button>
            </div>
          </div>
          <div className="mt-1.5 text-right text-text-muted">
            {apiLoading ? (
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 inline-block"></div>
            ) : (
              `${filteredPatients.length} records`
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Table with Skeleton Loading */}
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-lg border border-ui-border h-full border-l-0">
          <Table
            isLoading={apiLoading}
            skeletonRows={8}
            skeletonColumns={patientTableSkeletonColumns}
          >
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="border-b border-ui-border hover:bg-white">
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
              {filteredPatients.map((patient: Patient) => (
                <TableRow key={patient.patientId} onClick={() => handleRowClick(patient.patientId)}>
                  <TableCell className="text-sm text-text pl-4">{patient.patientId}</TableCell>
                  <TableCell className="text-sm font-medium text-text-gray-900">
                    {`${patient.firstName} ${patient.lastName}`}
                  </TableCell>
                  <TableCell className="text-sm text-text">{formatPhone(patient.phone)}</TableCell>
                  <TableCell className="text-sm text-text">{patient.email}</TableCell>
                  <TableCell className="text-sm text-text">
                    {formatDate(patient.nextAppointment)}
                  </TableCell>
                  <TableCell className="text-sm text-text">
                    {formatDate(patient.lastVisitDate)}
                  </TableCell>
                  <TableCell>
                    {patient.tags.length > 0 ? (
                      patient.tags.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-brand-blue-light text-brand-blue hover:bg-brand-blue-light mr-1"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">No Tags</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        patient.status === "active"
                          ? "bg-brand-green-light text-brand-green hover:bg-brand-green-light"
                          : "bg-secondary text-text hover:bg-secondary"
                      }
                    >
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontalIcon className="h-[17px] w-[17px] text-ui-icon-gray" />
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
