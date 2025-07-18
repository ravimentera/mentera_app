
# Component Documentation

## Organisms (Complex Components)
### Card
**Props:**
- `header`
- `footer`
- `children`
- `className`

**Description:** Card container with header/footer support  
**Example:**  
```tsx
<Card>
  <CardHeader>Recent Activity</CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p>Item 1</p>
      <p>Item 2</p>
    </div>
  </CardContent>
</Card>
```

### DashboardLayout
**Props:**
- `children`
- `className`

**Description:** Main dashboard layout with sidebar and content area  
**Example:**  
```tsx
<DashboardLayout>
  <Sidebar />
  <MainContent>
    <DashboardPage />
  </MainContent>
</DashboardLayout>
```

### Chart Components (BarChart, DonutChart, LineChart)
**Props:**
- `data`
- `config`
- `className`

**Description:** Reusable chart components with configuration support  
**Example:**  
```tsx
<LineChart data={chartData} config={{ x: 'time', y: 'value' }} />
```
---

### UserHistoryCard

**Props:**

* `data: { lastVisitedOn: string; lastConnectedEmail: string; lastConnectedSMS: string; createdOn: string; }`
* `userInitial?: string` – fallback to `"R"`

**Description:** Card displaying user activity history with visual avatar and labeled timestamps.

**Example:**

```tsx
<UserHistoryCard
  data={{
    lastVisitedOn: "2025-03-03",
    lastConnectedEmail: "2025-03-03",
    lastConnectedSMS: "2025-03-03",
    createdOn: "2025-03-03",
  }}
/>
```

---

### RecentDocumentsCard

**Props:**

* `documents: { title: string; signedOn: string; }[]`
* `onViewAllLink?: string`

**Description:** Card listing recently signed documents with title and timestamp. Includes a View All link.

**Example:**

```tsx
<RecentDocumentsCard
  documents={[{ title: "Treatment Consent Form", signedOn: "Mar 1, 2025" }]}
  onViewAllLink="/documents"
/>
```

---

### ActivePackagesCard

**Props:**

* `totalActive: number`
* `totalAvailable: number`
* `packages: { name: string; completedSessions: number; totalSessions: number; color?: "violet" | "rose"; }[]`
* `onViewAllLink?: string`

**Description:** Shows active packages and progress using colored bars. Includes counts and progress states.

**Example:**

```tsx
<ActivePackagesCard
  totalActive={2}
  totalAvailable={7}
  onViewAllLink="/packages"
  packages=[
    { name: "Botox Package", completedSessions: 3, totalSessions: 6, color: "violet" },
    { name: "Facelift Package", completedSessions: 3, totalSessions: 8, color: "rose" },
  ]
/>
```

---

### CampaignsCard

**Props:**

* `campaigns: { channel: "email" | "sms"; title: string; label: string; }[]`
* `onViewAllLink?: string`

**Description:** Lists past campaigns by channel with icons. Email links are underlined.

**Example:**

```tsx
<CampaignsCard
  campaigns={[
    { channel: "email", title: "Last Email Campaign", label: "Follow - Up" },
    { channel: "sms", title: "SMS Last Campaign", label: "New Year Offer" },
  ]}
  onViewAllLink="/campaigns"
/>
```

---

### NextAppointmentCard

**Props:**

* `upcomingAppointment: { title: string; time: string; doctor: string; }`
* `futureAppointments?: { title: string; time: string; doctor: string; }[]`
* `onViewAllLink?: string`

**Description:** Displays the next appointment prominently, with optional future appointments listed below.

**Example:**

```tsx
<NextAppointmentCard
  upcomingAppointment={{ title: "Botox Treatment", time: "Tomorrow, 2:00 PM", doctor: "Dr. Sarah Wilson" }}
  futureAppointments={[{ title: "Lip Treatment", time: "2025-05-06, 2:00 PM", doctor: "Dr. Sarah Wilson" }]}
  onViewAllLink="/appointments"
/>
```

---

### MedicalSummaryCard

**Props:**

* `allergies: { name: string; reactions: string; }[]`
* `onEditLink?: string`

**Description:** Shows medical allergy summary with reactions. Edit option included.

**Example:**

```tsx
<MedicalSummaryCard
  allergies={[
    { name: "Amfearmone", reactions: "Fever" },
    { name: "Paracitamole", reactions: "Breathing issue, Rashes" },
  ]}
  onEditLink="/medical-summary/edit"
/>
```

### ProcedureCard

**Props:**

* `procedure: string` – the name of the procedure performed
* `areasTreated?: string` – optional info about treated regions

**Description:** Card component to display treatment procedure details such as type and areas involved.

**Example:**

```tsx
<ProcedureCard procedure="HydraFacial" areasTreated="Full Face" />
```

---

### ObservationCard

**Props:**

* `notes: string` – patient condition, outcomes, or subjective observations

**Description:** Renders a formatted paragraph of patient-related observations post-treatment.

**Example:**

```tsx
<ObservationCard notes="Skin appeared hydrated and glowing. Improved texture noted." />
```

---

### RecommendationCard

**Props:**

* `instructions: string` – provider’s follow-up or care recommendations

**Description:** Displays provider’s recommendations or clinical advice in a readable, styled format.

**Example:**

```tsx
<RecommendationCard instructions="Incorporate LED therapy weekly for enhanced results." />
```

---

### TreatmentNoteCard

**Props:**

* `title: string` – label for the insight or note
* `content: string` – detailed content or instruction

**Description:** A generic reusable card component to hold free-form titled content related to treatments.

**Example:**

```tsx
<TreatmentNoteCard title="Follow-up Note" content="Patient responded well, continue same protocol." />
```

### ActionableInsightsCard

**Props:**

* `procedure: string` – name of the treatment or service
* `areasTreated: string` – area(s) where the procedure was applied
* `observations: string` – follow-up or result-oriented notes post-treatment

**Description:** Displays structured insight including procedure name, treated areas, and follow-up observations in a highlighted layout.

**Example:**

```tsx
<ActionableInsightsCard
  procedure="HydraFacial"
  areasTreated="Full Face"
  observations="Skin appeared hydrated and glowing. Patient noted improved texture and reduced fine lines."
/>
```


### AppointmentCalendar

**Props:**

* `appointments?: Appointment[]`
* `onAppointmentClick?: (appointment: Appointment) => void`
* `onDateChange?: (date: Date) => void`

**Types:**

```ts
interface Appointment {
  id: string;
  patientId: string;
  chartId: string;
  patient: {
    firstName: string;
    lastName: string;
    condition?: string;
  };
  provider: {
    providerId: string;
    firstName: string;
    lastName: string;
    specialties: string[];
  };
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  notes?: string;
  type: "therapy" | "consultation" | "followup" | "general";
  notificationStatus?: {
    status: "pending" | "approved" | "disapproved";
    sent: boolean;
    message?: string;
    type: "pre-care" | "post-care";
    editedMessage?: string;
  };
}
```

**Description:** Full-featured calendar view component that supports day/week/month views with appointment drag/drop, editing, and creation. Integrated with dialog modals for appointment management.

**Example:**

```tsx
<AppointmentCalendar
  appointments={mockAppointments} // Appointment interface
  onAppointmentClick={(appointment) => console.log("Clicked", appointment)}
  onDateChange={(date) => console.log("Date changed", date)}
  initialView="month"
/>
```

---

### FallbackCard

**Props:**

* `title?: string` – optional label for the section (default: "Details")
* `content: string` – raw markdown or plain text content to render

**Description:** A neutral UI container for rendering unmatched or unclassified markdown content from StreamingUI. Useful for catching anything the parser doesn't semantically map.

**Example:**

```tsx
<FallbackCard
  title="Additional Information"
  content="Patient reported mild redness. Will check in via phone in 48 hours."
/>
```

---

### ApprovalsContainer

**Props:**

* `cards?: ApprovalCardData[]` – Optional array of approval message data to inject

**Types:**

```ts
interface ApprovalCardData {
  id: string;
  appointmentId: string;
  patientName: string;
  patientId: string;
  isVip: boolean;
  time: string;
  subject: string;
  message: string;
  originalMessage: string;
  notificationType: "pre-care" | "post-care";
  aiGeneratedMessage: string;
  messageVariant: number;
  showTeraCompose: boolean;
  chatHistory?: {
    id: string;
    text: string;
    sender: "provider" | "patient";
    timestamp: string;
    isOutbound: boolean;
  }[];
}
```

**Description:** Stateful container for managing AI-generated messages that require provider approval. Includes navigation between cards, toast alerts, message regeneration, in-context chat memory, and Tera Compose fallback.

**Example:**

```tsx
<ApprovalsContainer cards={mockApprovals} />
```
