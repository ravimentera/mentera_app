"use client";

import { BarChart, Card, DonutChart, LineChart } from "@/components/organisms";
import { useEffect, useState } from "react";

// Use seed values instead of random to prevent hydration errors
const appointmentDataSeed = [
  { date: "Jan", value: 8 },
  { date: "Feb", value: 10 },
  { date: "Mar", value: 7 },
  { date: "Apr", value: 12 },
  { date: "May", value: 9 },
  { date: "Jun", value: 11 },
  { date: "Jul", value: 15 },
  { date: "Aug", value: 14 },
];

const treatmentDataSeed = [
  { label: "Facial", value: 32 },
  { label: "Massage", value: 28 },
  { label: "Laser", value: 18 },
  { label: "Botox", value: 14 },
  { label: "Hair Rem.", value: 10 },
];

const satisfactionDataSeed = [
  { label: "Excellent", value: 56, color: "#22c55e" },
  { label: "Good", value: 32, color: "#3b82f6" },
  { label: "Average", value: 10, color: "#eab308" },
  { label: "Poor", value: 2, color: "#ef4444" },
];

const userDataSeed = [
  {
    id: "user-1",
    name: "Emma Davis",
    email: "emma.davis@example.com",
    phone: "(555) 123-4567",
    nextAppt: "15 Apr, 2:30 PM",
    treatment: "Facial Treatment",
  },
  {
    id: "user-2",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    phone: "(555) 234-5678",
    nextAppt: "18 Apr, 10:00 AM",
    treatment: "Laser Therapy",
  },
  {
    id: "user-3",
    name: "Sophia Lee",
    email: "sophia.lee@example.com",
    phone: "(555) 345-6789",
    nextAppt: "20 Apr, 3:15 PM",
    treatment: "Body Massage",
  },
];

// Get consistent values for display stats
const totalAppointments = 86;
const upcomingAppointments = 4;
const totalCustomers = 78;
const rewardsPoints = 245;

export default function DashboardPage() {
  const [appointmentData] = useState(appointmentDataSeed);
  const [treatmentData] = useState(treatmentDataSeed);
  const [satisfactionData] = useState(satisfactionDataSeed);
  const [userData] = useState(userDataSeed);
  const [lastUpdated, setLastUpdated] = useState("");

  // Set lastUpdated date only on client side to avoid hydration issues
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLastUpdated(`${formattedDate} ${formattedTime}`);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Welcome to your Mentera-AI dashboard. Here you can manage your appointments and
            services.
          </p>
        </div>
        <span className="text-sm text-gray-500">
          {lastUpdated ? `Last updated: ${lastUpdated}` : "Loading..."}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="font-medium">Total Appointments</h3>
          <p className="text-3xl font-bold">{totalAppointments}</p>
          <p className="text-sm text-gray-500 mt-1">Last 8 months</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-medium">Upcoming Appointments</h3>
          <p className="text-3xl font-bold">{upcomingAppointments}</p>
          <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-medium">Total Customers</h3>
          <p className="text-3xl font-bold">{totalCustomers}</p>
          <p className="text-sm text-gray-500 mt-1">Active profiles</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-medium">Rewards Points</h3>
          <p className="text-3xl font-bold">{rewardsPoints}</p>
          <p className="text-sm text-gray-500 mt-1">Redeemable points</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LineChart data={appointmentData} title="Appointments Over Time" width={500} height={250} />

        <BarChart data={treatmentData} title="Popular Treatments" width={500} height={250} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Customers</h3>
          <div className="space-y-4">
            {userData.map((user) => (
              <div key={user.id} className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.nextAppt}</p>
                  <p className="text-sm text-gray-500">{user.treatment}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <DonutChart data={satisfactionData} title="Customer Satisfaction" size={250} />
      </div>
    </div>
  );
}
