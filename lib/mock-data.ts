/**
 * Mock data utilities for generating sample data for development and testing
 */

import { faker } from "@faker-js/faker";

// Define types for our mock data
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string;
  membershipLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  pointsBalance: number;
  preferences: {
    treatments: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      promotions: boolean;
      appointmentReminders: boolean;
    };
    paymentMethods: PaymentMethod[];
  };
  appointments: Appointment[];
}

export interface PaymentMethod {
  id: string;
  type: "Credit Card" | "PayPal" | "Apple Pay" | "Google Pay";
  last4?: string;
  expiry?: string;
  email?: string;
  primary: boolean;
}

export interface Appointment {
  id: string;
  treatment: string;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
  rating: number | null;
}

export interface TreatmentPreference {
  label: string;
  value: number;
  color: string;
}

// List of available treatments
const TREATMENTS = [
  "Facial Treatment",
  "Body Massage",
  "Skin Rejuvenation",
  "Laser Therapy",
  "Hair Removal",
  "Botox",
  "Manicure",
  "Pedicure",
  "Acupuncture",
  "Microdermabrasion",
];

// List of predefined colors for charts
const CHART_COLORS = [
  "#2563eb", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#6366f1", // indigo
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#ef4444", // red
  "#14b8a6", // teal
];

/**
 * Generate a random user profile with appointments and preferences
 */
export function generateMockUser(seed?: number): User {
  if (seed) {
    faker.seed(seed);
  }

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const joinDate = faker.date.past({ years: 3 });
  const membershipLevels: User["membershipLevel"][] = ["Bronze", "Silver", "Gold", "Platinum"];

  // Generate between 1-3 preferred treatments
  const preferredTreatments = faker.helpers.arrayElements(
    TREATMENTS,
    faker.number.int({ min: 1, max: 3 }),
  );

  // Generate between 1-2 payment methods
  const paymentMethods: PaymentMethod[] = Array.from(
    { length: faker.number.int({ min: 1, max: 2 }) },
    (_, i) => generatePaymentMethod(i === 0),
  );

  // Generate between 2-10 appointments
  const appointments: Appointment[] = Array.from(
    { length: faker.number.int({ min: 2, max: 10 }) },
    () => generateAppointment(),
  );

  return {
    id: faker.string.uuid(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number(),
    dateJoined: joinDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    membershipLevel: faker.helpers.arrayElement(membershipLevels),
    pointsBalance: faker.number.int({ min: 0, max: 5000 }),
    preferences: {
      treatments: preferredTreatments,
      notifications: {
        email: faker.datatype.boolean(),
        sms: faker.datatype.boolean(),
        promotions: faker.datatype.boolean(0.3), // 30% chance of being true
        appointmentReminders: faker.datatype.boolean(0.8), // 80% chance of being true
      },
      paymentMethods,
    },
    appointments: appointments.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }),
  };
}

/**
 * Generate a random payment method
 */
function generatePaymentMethod(isPrimary = false): PaymentMethod {
  const paymentTypes: PaymentMethod["type"][] = [
    "Credit Card",
    "PayPal",
    "Apple Pay",
    "Google Pay",
  ];
  const type = faker.helpers.arrayElement(paymentTypes);

  const paymentMethod: PaymentMethod = {
    id: faker.string.uuid(),
    type,
    primary: isPrimary,
  };

  if (type === "Credit Card") {
    paymentMethod.last4 = faker.finance.creditCardNumber("####");
    paymentMethod.expiry = `${faker.number.int({ min: 1, max: 12 }).toString().padStart(2, "0")}/${faker.number.int({ min: 23, max: 28 })}`;
  } else if (type === "PayPal") {
    paymentMethod.email = faker.internet.email().toLowerCase();
  }

  return paymentMethod;
}

/**
 * Generate a random appointment
 */
function generateAppointment(): Appointment {
  const statuses: Appointment["status"][] = ["upcoming", "completed", "cancelled"];
  const status = faker.helpers.arrayElement(statuses);

  let date;
  if (status === "upcoming") {
    date = faker.date.future({ years: 0.5 });
  } else if (status === "completed") {
    date = faker.date.past({ years: 0.5 });
  } else {
    date = faker.date.recent({ days: 30 });
  }

  // Only completed appointments have ratings
  const rating =
    status === "completed"
      ? faker.datatype.boolean(0.9)
        ? faker.number.int({ min: 3, max: 5 })
        : null
      : // 90% chance of rating 3-5
        null;

  return {
    id: `APT-${faker.number.int({ min: 1000, max: 9999 })}`,
    treatment: faker.helpers.arrayElement(TREATMENTS),
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status,
    rating,
  };
}

/**
 * Generate treatment preference data for charts
 */
export function generateTreatmentPreferences(): TreatmentPreference[] {
  // Get 5 random treatments
  const treatments = faker.helpers.arrayElements(TREATMENTS, 5);

  // Generate values that sum to 100
  let remainingValue = 100;
  const result: TreatmentPreference[] = [];

  for (let i = 0; i < treatments.length; i++) {
    // For the last element, use whatever value is left
    const value =
      i === treatments.length - 1
        ? remainingValue
        : faker.number.int({
            min: 5,
            max: Math.min(remainingValue - 5 * (treatments.length - i - 1), 45),
          });

    remainingValue -= value;

    result.push({
      label: treatments[i].split(" ")[0], // Just use the first word for simplicity
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    });
  }

  // Sort by value descending
  return result.sort((a, b) => b.value - a.value);
}

/**
 * Generate a list of random users
 */
export function generateUserList(count = 10): User[] {
  return Array.from({ length: count }, (_, i) => generateMockUser(i));
}
