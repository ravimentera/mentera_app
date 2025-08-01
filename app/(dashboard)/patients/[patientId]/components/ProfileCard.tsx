"use client";

import { Badge, Button } from "@/components/atoms";
import { Mail, Pencil, Phone, Plus } from "lucide-react";
import { Patient } from "../types";

interface ProfileCardProps {
  patient: Patient;
}

export function ProfileCard({ patient }: ProfileCardProps) {
  return (
    <div className="bg-ui-background-subtle overflow-hidden rounded-2xl w-64">
      {/* Profile Info */}
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full bg-brand-blue-light flex items-center justify-center">
              <span className="text-xl font-medium text-brand-blue">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </span>
            </div>
            {patient.status === "inactive" ? (
              <div className="flex items-center gap-1.5 mt-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <span className="text-sm text-gray-500 font-medium">Inactive</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-sm text-gray-500 font-medium">Active</span>
              </div>
            )}
          </div>
          <h2 className="text-lg font-semibold text-text">
            {patient.firstName} {patient.lastName}
          </h2>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{patient.email}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tags</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
              <Plus className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag.toLowerCase() === "vip" ? "success" : "secondary"}
                className={
                  tag.toLowerCase() === "vip"
                    ? "bg-ui-status-success-light text-ui-status-success hover:bg-ui-status-success-light/80"
                    : "bg-ui-status-warning-light text-ui-status-warning hover:bg-ui-status-warning-light/80"
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Details</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
              <Pencil className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-sm text-gray-500">First Name</span>
              <p className="text-sm text-gray-900">{patient.firstName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Last Name</span>
              <p className="text-sm text-gray-900">{patient.lastName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Date of Birth</span>
              <p className="text-sm text-gray-900">{patient.dateOfBirth} (25 Years)</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Gender</span>
              <p className="text-sm text-gray-900">{patient.gender}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-gray-500">Address</span>
              <p className="text-sm text-gray-900">
                {patient.address.street}, {patient.address.city}, {patient.address.state}{" "}
                {patient.address.zip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
