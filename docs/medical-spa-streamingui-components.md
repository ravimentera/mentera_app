# Component Documentation

## Organisms (Complex Components)

---
### Component Name

**CardComponent**

### Props

```ts
interface CardComponentProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
```

### Component Description

`CardComponent` is a flexible UI wrapper component designed to standardize the layout of card-based elements. It optionally supports a `header`, `footer`, and `children` section, while also allowing custom styling via the `className` prop. Internally, it uses structured subcomponents (`CardHeader`, `CardContent`, and `CardFooter`) to maintain a consistent layout hierarchy. It is ideal for creating encapsulated UI blocks like user profiles, product tiles, or notification cards.

### Component Code Example

```tsx
<CardComponent
  header={<h3>User Profile</h3>}
  footer={<button className="text-blue-500">View More</button>}
  className="w-full max-w-sm shadow-md rounded-xl"
>
  <div className="text-center">
    <p className="text-lg font-semibold">John Doe</p>
    <p className="text-sm text-gray-500">Software Engineer</p>
  </div>
</CardComponent>
```

This code example renders a `CardComponent` with a title, body containing a user profile, and a footer action button.
---

### Component Name

**UserHistoryCard**

### Props

```ts
type UserHistory = {
  lastVisitedOn: string;
  lastConnectedEmail: string;
  lastConnectedSMS: string;
  createdOn: string;
};

interface UserHistoryCardProps {
  data: UserHistory;
  userInitial?: string; // optional, defaults to "R"
}
```

### Component Description

`UserHistoryCard` is a display component that presents a summary of a user's recent history within an application. It showcases details such as the user's last visit date, last interaction over email and SMS, and the date the user profile was created. The card also features a circular badge with the user's initial for visual identification. The component is visually styled using utility classes and structured using a `Card` and `CardContent` layout. It includes a reusable internal `Row` subcomponent to standardize the display of label-value pairs.

This component is ideal for user profile overviews, audit logs, or contact history summaries.

### Component Code Example

```tsx
<UserHistoryCard
  data={{
    lastVisitedOn: "2025-07-01",
    lastConnectedEmail: "2025-06-29",
    lastConnectedSMS: "2025-06-28",
    createdOn: "2024-12-01"
  }}
  userInitial="J"
/>
```

This example renders a user history card for a user with the initial "J" and dummy timestamps for each field. The component can be embedded in dashboards, user profile views, or activity feeds.
---

### Component Name

**RecentDocumentsCard**

### Props

```ts
export type DocumentItem = {
  title: string;
  signedOn: string;
};

interface RecentDocumentsCardProps {
  documents: DocumentItem[];
  onViewAllLink?: string; // optional link for 'View All' button, defaults to "#"
}
```

### Component Description

`RecentDocumentsCard` is a card-style UI component used to display a list of recently signed documents. Each document entry shows the title and the date it was signed. A header section includes an icon, a title, and an optional "View All" link that navigates to a detailed documents page.

The component uses `Card` and `CardContent` for visual structure, applies spacing and dividers between entries, and maps over the `documents` prop to dynamically render document data. This makes it suitable for dashboards or activity panels.

### Component Code Example

```tsx
<RecentDocumentsCard
  documents={[
    { title: "Employment Agreement", signedOn: "2025-07-01" },
    { title: "NDA", signedOn: "2025-06-30" },
    { title: "Policy Acknowledgment", signedOn: "2025-06-28" },
  ]}
  onViewAllLink="/documents"
/>
```

This example renders a card listing three documents with their signed dates, and provides a navigation link to "/documents" for viewing the full list.
---

### Component Name

**ActivePackagesCard**

### Props

```ts
type PackageProgress = {
  name: string;
  completedSessions: number;
  totalSessions: number;
  color?: "violet" | "rose"; // Optional progress bar color
};

interface ActivePackagesCardProps {
  totalActive: number;
  totalAvailable: number;
  packages: PackageProgress[];
  onViewAllLink?: string; // optional, defaults to "#"
}
```

### Component Description

`ActivePackagesCard` is a summary card component used to display progress across various active user packages. Each package shows its name, session completion progress (in both numbers and percentage), and a visual progress bar with optional color themes (violet or rose). The component also provides a header section displaying the count of active vs. available packages, an icon for visual context, and an optional "View All" link.

This component is ideal for dashboards or overviews that track progress in educational, wellness, or subscription-based platforms.

### Component Code Example

```tsx
<ActivePackagesCard
  totalActive={3}
  totalAvailable={5}
  onViewAllLink="/packages"
  packages={[
    { name: "Yoga Basics", completedSessions: 4, totalSessions: 10, color: "violet" },
    { name: "Nutrition Plan", completedSessions: 2, totalSessions: 5, color: "rose" },
    { name: "Mindfulness Program", completedSessions: 8, totalSessions: 8 },
  ]}
/>
```

This example renders an `ActivePackagesCard` with three packages showing varying session progress, two of which specify custom color themes for the progress bar.
---

### Component Name

**CampaignsCard**

### Props

```ts
type CampaignItem = {
  channel: "email" | "sms";
  title: string;
  label: string;
};

interface CampaignsCardProps {
  campaigns: CampaignItem[];
  onViewAllLink?: string; // optional, defaults to "#"
}
```

### Component Description

`CampaignsCard` is a card-based UI component used to display a list of recent or active marketing campaigns. Each campaign item includes a channel type (email or SMS), a title with optional styling based on the channel, and a descriptive label (e.g., status or date). Icons (email or SMS) are shown alongside each campaign to visually represent the communication channel.

The card header includes a bell icon, a title, and an optional "View All" link that can navigate to a more detailed campaigns page. This component is ideal for dashboards in marketing tools or customer engagement platforms.

### Component Code Example

```tsx
<CampaignsCard
  onViewAllLink="/campaigns"
  campaigns={[
    { channel: "email", title: "Welcome Series", label: "Sent 2 days ago" },
    { channel: "sms", title: "Promo Blast", label: "Queued" },
    { channel: "email", title: "Survey Invite", label: "Draft" },
  ]}
/>
```

This example renders a `CampaignsCard` with three campaigns across email and SMS channels, each showing different statuses. It also provides a link to the full campaign list.
---

### Component Name

**NextAppointmentCard**

### Props

```ts
type Appointment = {
  title: string;
  time: string; // Formatted time string, e.g., "Tomorrow, 2:00 PM"
  doctor: string;
  isUpcoming?: boolean;
};

interface NextAppointmentCardProps {
  upcomingAppointment: Appointment;
  futureAppointments?: Appointment[]; // Optional list of upcoming appointments
  onViewAllLink?: string; // Optional link to full appointment list, defaults to "#"
}
```

### Component Description

`NextAppointmentCard` is a UI component designed to display the user's next medical appointment along with an optional list of future appointments. The card includes detailed info for each appointment: title, scheduled time, and the doctor's name. Icons are used for better visual context (calendar, clock, and user icons).

The component is structured with a highlighted section for the immediate upcoming appointment and separate styled sections for other future appointments. A header includes a label and an optional "View All" link to navigate to the full appointment list. This component is ideal for health dashboards, appointment schedulers, and patient portals.

### Component Code Example

```tsx
<NextAppointmentCard
  upcomingAppointment={{
    title: "Dental Checkup",
    time: "Tomorrow, 2:00 PM",
    doctor: "Dr. Sophia Patel"
  }}
  futureAppointments={[
    {
      title: "Eye Exam",
      time: "2025-07-12, 10:00 AM",
      doctor: "Dr. Raj Mehta"
    },
    {
      title: "General Consultation",
      time: "2025-07-20, 4:00 PM",
      doctor: "Dr. Emily Wong"
    }
  ]}
  onViewAllLink="/appointments"
/>
```

This example renders a `NextAppointmentCard` with one immediate appointment and two future appointments. It includes proper visual hierarchy and optional navigation to the full appointment list.
---

### Component Name

**MedicalSummaryCard**

### Props

```ts
type Allergy = {
  name: string;
  reactions: string;
};

interface MedicalSummaryCardProps {
  allergies: Allergy[]; // Array of allergy details
  onEditLink?: string;  // Optional edit link, defaults to "#"
}
```

### Component Description

`MedicalSummaryCard` is a card-based component designed to display a summarized list of a user's known allergies and associated reactions. Each allergy item is listed with its name and reaction description. The component header includes an icon and title, along with an optional "Edit" link to allow users to modify the allergy list.

This component is best suited for healthcare portals, patient dashboards, or any interface where quick access to medical history is essential.

### Component Code Example

```tsx
<MedicalSummaryCard
  onEditLink="/edit-medical-summary"
  allergies={[
    { name: "Peanuts", reactions: "Hives, difficulty breathing" },
    { name: "Penicillin", reactions: "Rash and nausea" },
    { name: "Dust", reactions: "Sneezing and itchy eyes" },
  ]}
/>
```

This example renders a `MedicalSummaryCard` listing three allergies with their respective reactions and includes an "Edit" link pointing to a form route.
---

### Component Name

**ProcedureCard**

### Props

```ts
interface ProcedureCardProps {
  procedure: string; // Name or type of the procedure
  areasTreated?: string; // Optional: description of areas treated during the procedure
}
```

### Component Description

`ProcedureCard` is a UI component designed to display basic information about a medical or cosmetic procedure. It shows the procedure name and, optionally, the areas that were treated. The card is styled with a violet background for emphasis and includes a title within a structured header.

This component is useful in health dashboards, treatment history panels, or cosmetic procedure tracking interfaces.

### Component Code Example

```tsx
<ProcedureCard
  procedure="Laser Skin Resurfacing"
  areasTreated="Face and Neck"
/>
```

This example displays a `ProcedureCard` with the procedure name "Laser Skin Resurfacing" and notes that the face and neck were treated during the procedure.
---

### Component Name

**ObservationCard**

### Props

```ts
interface ObservationCardProps {
  notes: string; // Required: observation or summary notes for the patient
}
```

### Component Description

`ObservationCard` is a compact and styled card component that displays clinical or personal observations about a patient. It uses a structured layout with a title header and a scrollable or static content area for the notes. The card features a light blue background (`sky-50`) to visually differentiate it from other cards in a UI.

This component is well-suited for healthcare portals, patient dashboards, or electronic medical record (EMR) interfaces where notes need to be presented clearly.

### Component Code Example

```tsx
<ObservationCard
  notes="Patient reported mild headaches and fatigue. Advised to hydrate and monitor symptoms. Will follow up in 3 days."
/>
```

This example renders an `ObservationCard` with a simple observation note about a patient's recent symptoms and recommendations.
---

### Component Name

**RecommendationCard**

### Props

```ts
interface RecommendationCardProps {
  instructions: string; // Required: provider's recommendations or instructions for the patient
}
```

### Component Description

`RecommendationCard` is a clean and concise card component designed to display provider-issued recommendations or instructions for a patient. The card uses a warm amber background (`amber-50`) to subtly highlight its importance. It includes a header with a descriptive title and a content area that presents the recommendation text.

This component is ideal for healthcare interfaces, post-appointment summaries, or patient care dashboards.

### Component Code Example

```tsx
<RecommendationCard
  instructions="Take prescribed medication twice daily after meals. Avoid strenuous activities and return for follow-up in one week."
/>
```

This example renders a `RecommendationCard` displaying aftercare instructions and follow-up advice.
---

### Component Name

**TreatmentNoteCard**

### Props

```ts
interface TreatmentNoteCardProps {
  title: string;   // Required: title or heading for the treatment note
  content: string; // Required: detailed description or content of the treatment note
}
```

### Component Description

`TreatmentNoteCard` is a reusable card component that displays a titled note or summary regarding a patient's treatment. It is structured with a header for the note title and a content section for descriptive text. The card uses a neutral gray background (`gray-50`) and is styled with borders and shadow for visual separation.

This component is suitable for medical dashboards, patient reports, treatment history views, or provider documentation interfaces.

### Component Code Example

```tsx
<TreatmentNoteCard
  title="Post-Therapy Evaluation"
  content="Patient showed improved range of motion post physical therapy. Recommended continuing exercises at home for 2 weeks."
/>
```

This example renders a `TreatmentNoteCard` with a specific title and treatment-related content describing patient progress and follow-up recommendations.
---

### Component Name

**ActionableInsightsCard**

### Props

```ts
interface ActionableInsightsCardProps {
  procedure: string;      // Required: name or type of the performed procedure
  areasTreated: string;   // Required: description of areas that were treated
  observations: string;   // Required: additional insights or observations
}
```

### Component Description

`ActionableInsightsCard` is a structured UI card component designed to surface clinically relevant insights following a procedure. It outlines the procedure name, areas treated, and key observations, making it easy for both patients and providers to review key takeaways. Styled with a blue-tinted background for emphasis, it presents well in medical dashboards, post-visit summaries, or treatment overviews.

This component uses a bold title, semantic content labels, and consistent formatting to ensure clarity.

### Component Code Example

```tsx
<ActionableInsightsCard
  procedure="Laser Therapy"
  areasTreated="Upper Back and Shoulders"
  observations="Redness observed post-procedure. Patient advised to avoid sun exposure for 48 hours."
/>
```

This example renders an `ActionableInsightsCard` detailing a procedure, the treated regions, and provider notes in a concise, readable format.
---

### Component Name

**AppointmentCalendar**

### Props

```ts
interface AppointmentCalendarProps {
  appointments?: Appointment[]; // Optional: additional appointments to be added to the calendar
  onAppointmentClick?: (appointment: Appointment) => void; // Optional: callback when an appointment is clicked
  onDateChange?: (date: Date) => void; // Optional: callback when the calendar date changes
  initialView?: "day" | "week" | "month"; // Initial view mode (default: "week")
  loadMockData?: boolean; // Optional: flag to load mock data (default: true)
}
```

### Component Description

`AppointmentCalendar` is a dynamic, interactive calendar component tailored for healthcare or scheduling applications. It displays appointments in `day`, `week`, or `month` views and allows users to create, edit, drag/drop, and manage appointments. The component integrates tightly with Redux for state management and supports appointment notifications and care instructions.

It also features appointment dialogs, dynamic drag selection, responsive layout, and fallback support for mock or generated data. The component handles real-time interactions, event highlighting, and user feedback through toasts.

This calendar is ideal for EMR systems, clinic management software, or any scheduling interface requiring flexible appointment handling.

### Component Code Example

```tsx
<AppointmentCalendar
  appointments={[
    {
      id: "apt-001",
      patientId: "pat-001",
      chartId: "chart-001",
      patient: { firstName: "John", lastName: "Doe", condition: "Back Pain" },
      provider: {
        providerId: "prov-001",
        firstName: "Dr. Alice",
        lastName: "Smith",
        specialties: ["Physical Therapy"]
      },
      startTime: new Date("2025-07-25T10:00:00"),
      endTime: new Date("2025-07-25T11:00:00"),
      status: "scheduled",
      type: "therapy"
    }
  ]}
  initialView="day"
  loadMockData={false}
  onAppointmentClick={(apt) => console.log("Clicked Appointment:", apt)}
  onDateChange={(date) => console.log("Date changed to:", date)}
/>
```

This example demonstrates how to initialize an `AppointmentCalendar` with one predefined appointment, disables mock data loading, and adds handlers for appointment click and date changes.
---

### Component Name

**FallbackCard**

### Props

```ts
interface FallbackCardProps {
  title?: string;    // Optional title for the card (defaults to "Details")
  content: string;   // Required text content to display inside the card
}
```

### Component Description

`FallbackCard` is a flexible and minimal card component designed to serve as a fallback UI element for displaying generic information when structured data is unavailable or incomplete. It features a simple title header and a content section that supports multiline formatting via `whitespace-pre-wrap`. The card uses a subtle gray background to maintain visual neutrality.

This component is useful in dashboards, summaries, and data-fetch failure states where fallback messaging or raw content needs to be displayed cleanly.

### Component Code Example

```tsx
<FallbackCard
  title="General Information"
  content={`No specific module was matched for this user.\nPlease check the patient ID and try again.`}
/>
```

This example renders a `FallbackCard` with a custom title and multiline message to display fallback content to the user.
