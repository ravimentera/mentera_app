export interface PromptCategory {
  id: string;
  title: string;
  icon: string; // This will now be the icon name instead of emoji
  prompts: Prompt[];
}

export interface Prompt {
  id: string;
  title: string;
  text: string;
  description?: string;
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "appointments",
    title: "Appointments",
    icon: "Calendar",
    prompts: [
      {
        id: "todays-appointments",
        title: "Today's Appointments",
        text: "Show me today's appointment schedule with patient details and treatment types",
        description: "Get a comprehensive view of today's scheduled appointments"
      },
      {
        id: "appointment-reminders",
        title: "Send Appointment Reminders", 
        text: "Create and send appointment reminder messages for tomorrow's patients",
        description: "Automated reminder system for upcoming appointments"
      },
      {
        id: "reschedule-request",
        title: "Reschedule Appointments",
        text: "Help me reschedule appointments for patients who need to change their time slots",
        description: "Manage appointment rescheduling efficiently"
      }
    ]
  },
  {
    id: "patient-communication",
    title: "Patient Communication",
    icon: "MessageSquare",
    prompts: [
      {
        id: "send-reminder-sms",
        title: "Send Reminder SMS",
        text: "Draft a professional SMS reminder for upcoming appointments",
        description: "Create personalized SMS reminders for patients"
      },
      {
        id: "aftercare-message",
        title: "Draft Aftercare Message",
        text: "Create a personalized aftercare message for post-treatment patient care",
        description: "Comprehensive post-treatment care instructions"
      },
      {
        id: "consent-form",
        title: "Send Consent Form", 
        text: "Generate and send appropriate consent forms for upcoming treatments",
        description: "Streamline consent form distribution"
      },
      {
        id: "follow-up-message",
        title: "Follow-up Messages",
        text: "Create follow-up messages to check on patient recovery and satisfaction",
        description: "Maintain patient engagement post-treatment"
      }
    ]
  },
  {
    id: "patient-management",
    title: "Patient Management", 
    icon: "Users",
    prompts: [
      {
        id: "patient-history",
        title: "Patient History Summary",
        text: "Generate a comprehensive patient history summary including treatments and notes",
        description: "Complete overview of patient's treatment history"
      },
      {
        id: "treatment-recommendations",
        title: "Treatment Recommendations",
        text: "Analyze patient profile and suggest appropriate treatment recommendations",
        description: "AI-powered treatment suggestions based on patient data"
      },
      {
        id: "patient-notes",
        title: "Update Patient Notes",
        text: "Help me update and organize patient notes from recent consultations",
        description: "Streamline patient note management"
      }
    ]
  },
  {
    id: "clinical-workflows",
    title: "Clinical Workflows",
    icon: "Activity",
    prompts: [
      {
        id: "pre-post-instructions",
        title: "Pre/Post Instructions",
        text: "Generate detailed pre and post-treatment instructions for specific procedures",
        description: "Customized care instructions for different treatments"
      },
      {
        id: "treatment-plans",
        title: "Create Treatment Plans",
        text: "Develop comprehensive treatment plans based on patient goals and conditions",
        description: "Structured treatment planning assistance"
      },
      {
        id: "medical-documentation",
        title: "Medical Documentation",
        text: "Help me create and organize medical documentation for patient records",
        description: "Efficient medical record keeping"
      }
    ]
  },
  {
    id: "business-operations", 
    title: "Business Operations",
    icon: "BarChart3",
    prompts: [
      {
        id: "create-campaign",
        title: "Create Marketing Campaign",
        text: "Design a marketing campaign for promoting seasonal treatments and services",
        description: "Strategic marketing campaign development"
      },
      {
        id: "inventory-check",
        title: "Inventory Management",
        text: "Check current inventory levels and suggest reorder recommendations",
        description: "Smart inventory tracking and management"
      },
      {
        id: "no-show-reports",
        title: "No-show Analysis",
        text: "Generate reports on no-show patterns and suggest improvement strategies",
        description: "Reduce no-shows with data-driven insights"
      },
      {
        id: "revenue-analysis",
        title: "Revenue Analysis",
        text: "Analyze revenue trends and identify opportunities for growth",
        description: "Financial performance insights and optimization"
      }
    ]
  }
];

// Helper function to get all prompts
export const getAllPrompts = (): Prompt[] => {
  return PROMPT_CATEGORIES.flatMap(category => category.prompts);
};

// Helper function to get prompts by category
export const getPromptsByCategory = (categoryId: string): Prompt[] => {
  const category = PROMPT_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.prompts || [];
};

// Helper function to find a prompt by ID
export const findPromptById = (promptId: string): Prompt | undefined => {
  return getAllPrompts().find(prompt => prompt.id === promptId);
}; 