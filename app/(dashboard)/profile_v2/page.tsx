"use client";

import { Button } from "@/components/atoms";
import { StarIcon } from "@/components/atoms/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules";
import { Card, DonutChart } from "@/components/organisms";
import { useTreatments } from "@/lib/hooks/useTreatments";
import { useUser } from "@/lib/hooks/useUser";

export default function ProfilePage() {
  // Fetch user data from API
  const { user, isLoading: userLoading, error: userError } = useUser();

  // Fetch treatment preferences from API
  const { treatments, isLoading: treatmentsLoading, error: treatmentsError } = useTreatments();

  // Loading state
  if (userLoading || treatmentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (userError || treatmentsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-gray-500 mb-4">
            {userError?.message || treatmentsError?.message || "An unexpected error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Profile Data</h2>
          <p className="text-gray-500 mb-4">Unable to load profile information</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    );
  }

  // Calculate statistics from API data
  const totalAppointments = user.appointments.length;
  const completedAppointments = user.appointments.filter((a) => a.status === "completed").length;
  const upcomingAppointments = user.appointments.filter((a) => a.status === "upcoming").length;
  const averageRating = calculateAverageRating(user.appointments);

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  // Generate star rating
  const renderStarRating = (rating: number | null) => {
    if (rating === null) return <span className="text-sm text-gray-500">N/A</span>;

    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={`star-${i}-${rating}`}
            filled={i < rating}
            className={`h-4 w-4 ${i < rating ? "text-yellow-500" : "text-gray-500"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-500">View and manage your personal information and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.phone}</p>
            </div>
            <div className="w-full border-t pt-4 mt-2">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="text-sm font-medium">{user.dateJoined}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">Membership</span>
                <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                  {user.membershipLevel}
                </span>
              </div>
              <Button className="w-full">Edit Profile</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Points Balance</h3>
                  <p className="text-2xl font-bold">{user.pointsBalance}</p>
                  <p className="text-xs text-gray-500 mt-1">Next reward at 3,000 points</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Completed Sessions</h3>
                  <p className="text-2xl font-bold">{completedAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">Lifetime total</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <div className="mt-1">{renderStarRating(averageRating)}</div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
                  <p className="text-2xl font-bold">{upcomingAppointments}</p>
                  <p className="text-xs text-gray-500 mt-1">Reserved appointments</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Treatment Preferences</h3>
                <div className="h-64">
                  <DonutChart
                    data={treatments}
                    title="Preferred Treatments"
                    size={200}
                    thickness={50}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Recent Appointments</h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Treatment
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {user.appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-muted/50">
                          <td className="py-3 px-4">{appointment.id}</td>
                          <td className="py-3 px-4">{appointment.treatment}</td>
                          <td className="py-3 px-4">{appointment.date}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${getStatusBadge(appointment.status)}`}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">{renderStarRating(appointment.rating)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <label htmlFor="email-notifications" className="text-sm font-medium">
                        Email Notifications
                      </label>
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <label htmlFor="sms-notifications" className="text-sm font-medium">
                        SMS Notifications
                      </label>
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <label htmlFor="promo-notifications" className="text-sm font-medium">
                        Promotional Offers
                      </label>
                      <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <label htmlFor="appt-reminders" className="text-sm font-medium">
                        Appointment Reminders
                      </label>
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 bg-white w-4 h-4 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    {user.preferences.paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{method.type}</span>
                            {method.primary && (
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {method.type === "Credit Card"
                              ? `**** **** **** ${method.last4} (Expires: ${method.expiry})`
                              : method.email}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      Add Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Helper function to calculate average rating
function calculateAverageRating(appointments: Array<{ rating: number | null; status: string }>) {
  const completedWithRatings = appointments.filter(
    (a) => a.status === "completed" && a.rating !== null,
  );
  if (completedWithRatings.length === 0) return 0;

  const sum = completedWithRatings.reduce((total, appointment) => {
    return total + (appointment.rating || 0);
  }, 0);

  return sum / completedWithRatings.length;
}
