"use client";

import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessage,
  useThreadRuntime,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardListIcon,
  CopyIcon,
  FileIcon,
  FileTextIcon,
  MessageSquareIcon,
  PaperclipIcon,
  RefreshCwIcon,
  SearchIcon,
  SendHorizontalIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import type { FC, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms/Input";
import { MarkdownText } from "@/components/molecules/MarkdownText";
import { TooltipIconButton } from "@/components/molecules/TooltipIconButton";
import { usePatientContext } from "@/lib/hooks/patientContext";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { useFirstMessageHandler } from "@/lib/hooks/useFirstMessageHandler";
import { AppDispatch } from "@/lib/store";
import { useGetPatientsByProviderQuery } from "@/lib/store/api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectUser } from "@/lib/store/slices/authSlice";
import { UploadedFile, removeFile, selectAllFiles } from "@/lib/store/slices/fileUploadsSlice";
import { addMessage } from "@/lib/store/slices/messagesSlice";
import {
  clearThreadPatient,
  getActiveThreadId,
  selectActiveThreadPatient,
  setThreadPatient,
} from "@/lib/store/slices/threadsSlice";
import type { Patient } from "@/lib/store/types/patient";
import { getFirstProvider } from "@/utils/provider.utils";

// Helper function to cleanly parse potential JSON from the assistant's message
const tryParseAction = (content: string) => {
  // First, try to find a fenced JSON block
  const fencedMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch (e) {
      // Ignore parsing errors for fenced blocks and fall through
    }
  }

  // If no valid fenced block, try to find an inline JSON object
  const inlineMatch = content.match(/({[\s\S]*})/);
  if (inlineMatch?.[1]) {
    try {
      return JSON.parse(inlineMatch[1]);
    } catch (e) {
      // Ignore parsing errors for inline objects
    }
  }

  return null;
};

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="bg-background box-border flex h-full flex-col overflow-hidden">
      <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4">
        <ThreadWelcome />

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>

        <ThreadPrimitive.If empty={false}>
          <div className="sticky bottom-0 mt-3 flex w-full max-w-2xl flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
            <ThreadScrollToBottom />
            <Composer />
          </div>
        </ThreadPrimitive.If>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex h-full w-full flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          <h1 className="text-5xl font-bold bg-gradient-brand bg-clip-text text-transparent">
            Hello, {getFirstProvider()?.firstName ?? "Lucy"}
          </h1>
          <h2 className="text-2xl mt-2 text-slate-600">Your Medspa&lsquo;s Smartest Assistant</h2>
          <p className="mt-4 text-slate-500 max-w-lg">
            From appointment management to compliance, Mentera empowers your entire team to work
            smarter.
          </p>

          <div className="w-full mt-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <Composer />
            </div>
          </div>
          <ThreadWelcomeSuggestions />
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};

interface SuggestionButtonProps {
  prompt: string;
  icon: ReactNode;
}

const SuggestionButton: FC<SuggestionButtonProps> = ({ prompt, icon }) => (
  <ThreadPrimitive.Suggestion
    prompt={prompt}
    method="replace"
    autoSend
    className="flex items-center justify-start gap-2 text-sm font-medium p-2 rounded-lg border bg-white hover:bg-slate-50 transition-colors flex-1 basis-[calc(33.333%-0.5rem)] min-w-[200px]"
  >
    {icon}
    <span>{prompt}</span>
  </ThreadPrimitive.Suggestion>
);

const ThreadWelcomeSuggestions: FC = () => {
  const suggestions = [
    { prompt: "Today's Appointments", icon: <CalendarIcon className="w-4 h-4 text-brand-blue" /> },
    {
      prompt: "Send Reminder SMS",
      icon: <MessageSquareIcon className="w-4 h-4 text-brand-blue" />,
    },
    {
      prompt: "Draft Aftercare Message",
      icon: <FileTextIcon className="w-4 h-4 text-brand-blue" />,
    },
    { prompt: "Patient History Summary", icon: <UsersIcon className="w-4 h-4 text-brand-blue" /> },
    {
      prompt: "Pre/Post Instructions",
      icon: <ClipboardListIcon className="w-4 h-4 text-brand-blue" />,
    },
    { prompt: "Create Campaign", icon: <SparklesIcon className="w-4 h-4 text-brand-blue" /> },
    { prompt: "Send Consent Form", icon: <FileTextIcon className="w-4 h-4 text-brand-blue" /> },
    { prompt: "Inventory Check", icon: <ShoppingCartIcon className="w-4 h-4 text-brand-blue" /> },
    { prompt: "No-show Reports", icon: <XCircleIcon className="w-4 h-4 text-brand-blue" /> },
  ];
  return (
    <div className="mt-6 flex w-full max-w-3xl flex-wrap justify-center gap-2">
      {suggestions.map((s) => (
        <SuggestionButton key={s.prompt} {...s} />
      ))}
    </div>
  );
};

const FilePreview: FC = () => {
  const dispatch = useDispatch();
  const files = useSelector(selectAllFiles);

  if (files.length === 0) return null;

  return (
    <div className="border-t p-2">
      <div className="flex w-full gap-2 overflow-x-auto px-2 py-1">
        {files.map((f: UploadedFile) => (
          <div
            key={f.id}
            className="relative h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center overflow-visible border"
          >
            <button
              onClick={() => dispatch(removeFile(f.id))}
              className="absolute -top-1.5 -right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-[10px] font-bold leading-none text-white shadow hover:bg-red-500 transition-colors"
              aria-label={`Remove ${f.name}`}
              type="button"
            >
              ×
            </button>
            {f.type.startsWith("image/") ? (
              <Image
                src={f.previewUrl}
                alt={f.name}
                layout="fill"
                className="object-cover rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-center p-1">
                <FileIcon className="h-6 w-6 text-gray-500" />
                <span className="text-xs text-gray-500 truncate w-14">{f.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Composer: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useFileUpload();

  const files = useSelector(selectAllFiles);

  const triggerBrowse = () => fileInputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    if (incoming.length + files.length > 5) {
      alert("You can attach a maximum of 5 files per message.");
      e.target.value = "";
      return;
    }
    for (const file of incoming) {
      try {
        await uploadFile(file);
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }
    e.target.value = "";
  };

  return (
    <div className="p-[2px] rounded-xl border border-gradient-blue shadow-lg w-full">
      <ComposerPrimitive.Root className="flex w-full flex-col rounded-[14px] bg-white">
        <FilePreview />
        <div className="flex w-full items-center pl-2.5 pr-1">
          <ComposerPrimitive.Input
            rows={1}
            autoFocus
            placeholder="Ask anything to mentera..."
            className="placeholder:text-slate-400 max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0"
          />
          <ComposerPrimitive.Send asChild>
            <Button
              size="icon"
              className="my-2.5 bg-gradient-to-br from-gradient-dark-start to-gradient-dark-end text-white rounded-lg w-8 h-8 hover:opacity-90 transition-opacity shrink-0"
            >
              <SendHorizontalIcon className="h-5 w-5" />
            </Button>
          </ComposerPrimitive.Send>
        </div>
        <div className="border-t border-slate-200 flex items-center px-2.5 py-1">
          <TooltipIconButton
            tooltip="Attach file"
            variant="ghost"
            className="h-auto p-1.5"
            onClick={triggerBrowse}
          >
            <PaperclipIcon className="h-5 w-5 text-black" />
          </TooltipIconButton>
          <div className="border-l border-slate-200 h-4 mx-2" />
          <Button variant="ghost" className="text-slate-500 p-1.5 h-auto text-sm font-medium">
            Explore Prompts
          </Button>
          <input ref={fileInputRef} type="file" hidden onChange={handleChange} multiple />
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[1fr_auto] gap-y-2 w-full max-w-2xl py-4">
      <div className="bg-muted text-foreground max-w-full break-words rounded-xl px-4 py-2.5 col-start-2 row-start-1">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const PatientSelector: FC<{ originalPrompt: string; message: string }> = ({
  originalPrompt,
  message,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const thread = useSelector(getActiveThreadId) as string;
  const user = useAppSelector(selectUser);
  const providerId = user?.providerId || "PR-2001";
  const { processFirstMessage, needsFirstMessageProcessing } = useFirstMessageHandler();

  // CHANGED: Use thread-specific patient instead of global state
  const selectedPatient = useSelector(selectActiveThreadPatient);

  const { data: patients, isLoading } = useGetPatientsByProviderQuery(providerId);

  // @TODO: Remove this after removing the Mock Data.
  // Helper function to check if a patient ID is from mock data
  const isMockPatientId = (patientId: string): boolean => {
    return patientId.startsWith("PT-") && patientId.length <= 7; // Mock IDs like "PT-1003"
  };

  // FIXED: Don't call usePatientContext with mock patient IDs to prevent unnecessary API calls
  const patientIdForContext =
    selectedPatient?.patientId && !isMockPatientId(selectedPatient.patientId)
      ? selectedPatient.patientId
      : null;

  // Use the patient context hook
  const {
    context,
    isLoading: isContextLoading,
    isError: isContextError,
  } = usePatientContext(patientIdForContext, { providerId });

  const filteredPatients = useMemo(() => {
    if (!patients) return [];
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm),
    );
  }, [patients, searchTerm]);

  useEffect(() => {
    // Conditional logging only when context status changes
    if (selectedPatient) {
      console.log(
        `[PatientSelector] Context status for ${selectedPatient.firstName} ${selectedPatient.lastName}: Loading=${isContextLoading}, Error=${isContextError}, HasContext=${!!context}`,
      );
    }
  }, [selectedPatient, isContextLoading, isContextError, context]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    // Effect to handle context ready state
    if (selectedPatient && context && !isContextLoading && isProcessing) {
      console.log("[PatientSelector] Context ready, processing message...", {
        selectedPatient: selectedPatient.patientId,
        contextReady: !!context,
        isContextLoading,
        isProcessing,
      });

      // Create the enhanced prompt with patient context
      const newPrompt = `${originalPrompt} for patient ${selectedPatient.firstName} ${selectedPatient.lastName}`;

      console.log({ context });

      // Check if this is the first message for the thread
      const isFirstMessage = needsFirstMessageProcessing(thread);

      // Process first message BEFORE adding the message to ensure proper ordering
      if (isFirstMessage) {
        console.log(`[PatientSelector] Processing first message for thread ${thread}`);
        processFirstMessage(thread, newPrompt);
      }

      // Add message with patient context
      dispatch(
        addMessage({
          id: uuidv4(),
          threadId: thread,
          sender: "user",
          text: newPrompt,
          context: context, // Include the patient context
          createdAt: Date.now(),
        }),
      );

      console.log("[PatientSelector] Message sent, patient selection persisted in global state");

      // Reset processing state but KEEP the patient selected in global state
      setIsProcessing(false);
    }
  }, [selectedPatient, context, isContextLoading, isProcessing, dispatch, thread, originalPrompt]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reason for ignoring
  useEffect(() => {
    // Effect to handle context errors
    if (selectedPatient && isContextError && !isContextLoading && isProcessing) {
      console.error(
        "[PatientSelector] Context error, proceeding without context:",
        selectedPatient.patientId,
      );

      // Still proceed with the message but without context
      const newPrompt = `${originalPrompt} for patient ${selectedPatient.firstName} ${selectedPatient.lastName}`;

      // Check if this is the first message for the thread
      const isFirstMessage = needsFirstMessageProcessing(thread);

      // Process first message BEFORE adding the message to ensure proper ordering
      if (isFirstMessage) {
        console.log(`[PatientSelector] Processing first message for thread ${thread}`);
        processFirstMessage(thread, newPrompt);
      }

      dispatch(
        addMessage({
          id: uuidv4(),
          threadId: thread,
          sender: "user",
          text: newPrompt,
          createdAt: Date.now(),
        }),
      );

      console.log("[PatientSelector] Error handled, patient selection persisted in global state");
      setIsProcessing(false);
    }
  }, [
    selectedPatient,
    isContextError,
    isContextLoading,
    isProcessing,
    dispatch,
    thread,
    originalPrompt,
  ]);

  const handleSelectPatient = (patient: Patient) => {
    // Prevent selecting a different patient while processing
    if (isProcessing || isContextLoading) {
      console.log("[PatientSelector] Cannot select patient while processing");
      return;
    }

    console.log("[PatientSelector] Patient selected:", {
      patientId: patient.patientId,
      name: `${patient.firstName} ${patient.lastName}`,
    });

    // CHANGED: Use thread-specific patient instead of global state
    dispatch(setThreadPatient({ threadId: thread, patient }));
    setIsProcessing(true);
  };

  return (
    <div className="bg-white p-4 border-slate-200 w-full max-w-lg">
      <p className="font-medium text-slate-800 mb-3">{message}</p>

      {/* Show currently selected patient with option to clear */}
      {selectedPatient && !isProcessing && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-blue-700">
                Currently selected: {selectedPatient.firstName} {selectedPatient.lastName}
              </span>
              <div className="text-xs text-blue-600 mt-1">
                You can choose a different patient for this specific request
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                dispatch(clearThreadPatient(thread));
              }}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Loading state when fetching context */}
      {(isContextLoading || isProcessing) && selectedPatient && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <span className="text-sm text-blue-700">
              Loading context for {selectedPatient.firstName} {selectedPatient.lastName}...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {isContextError && selectedPatient && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <span className="text-sm text-yellow-700">
            Warning: Could not load full context for {selectedPatient.firstName}{" "}
            {selectedPatient.lastName}. Proceeding with basic information.
          </span>
        </div>
      )}
      <div className="relative mb-3">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search patient by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full bg-slate-50 border-slate-300"
        />
      </div>
      <div className="max-h-60 overflow-y-auto border rounded-md bg-white scrollbar">
        {/* Option to proceed without patient */}
        <button
          type="button"
          onClick={() => {
            // Clear any selected patient and proceed with the original prompt
            dispatch(clearThreadPatient(thread));

            const isFirstMessage = needsFirstMessageProcessing(thread);
            if (isFirstMessage) {
              processFirstMessage(thread, originalPrompt);
            }

            dispatch(
              addMessage({
                id: uuidv4(),
                threadId: thread,
                sender: "user",
                text: originalPrompt,
                createdAt: Date.now(),
              }),
            );
          }}
          disabled={isProcessing || isContextLoading}
          className={`w-full text-left p-3 border-b transition-colors ${
            isProcessing || isContextLoading
              ? "bg-gray-50 cursor-not-allowed opacity-60"
              : "hover:bg-yellow-50 cursor-pointer border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="font-medium text-slate-800">Proceed without patient context</p>
              <p className="text-sm text-slate-500">Continue with general assistance</p>
            </div>
          </div>
        </button>

        {isLoading && <p className="p-4 text-center text-slate-500">Loading patients...</p>}
        {!isLoading && filteredPatients.length === 0 && (
          <p className="p-4 text-center text-slate-500">No patients found.</p>
        )}
        {filteredPatients.map((patient) => {
          const isSelected = selectedPatient?.patientId === patient.patientId;
          const isDisabled = isProcessing || isContextLoading;

          return (
            <button
              type="button"
              key={patient.id}
              onClick={() => !isDisabled && handleSelectPatient(patient as Patient)}
              disabled={isDisabled}
              className={`w-full text-left p-3 border-b last:border-b-0 transition-colors ${
                isSelected
                  ? "bg-green-100 border-green-200"
                  : isDisabled
                    ? "bg-gray-50 cursor-not-allowed opacity-60"
                    : "hover:bg-brand-50 cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">
                    {patient.firstName} {patient.lastName}
                    {isSelected && (
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-500">{patient.email}</p>
                  <p className="text-sm text-slate-500">{patient.phone}</p>
                </div>
                {isSelected && isContextLoading && (
                  <div className="animate-spin h-5 w-5 border-2 border-green-500 rounded-full border-t-transparent"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AssistantMessage: FC = () => {
  const message = useMessage();
  const { getState } = useThreadRuntime();
  const messages = getState().messages;

  const fullText = message.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  const parsedAction = tryParseAction(fullText);

  if (parsedAction?.action === "REQUEST_PATIENT_SELECTION") {
    const currentIndex = messages.findIndex((m) => m.id === message.id);
    const userMessage = messages[currentIndex - 1];
    const originalPrompt =
      userMessage?.content[0]?.type === "text" ? userMessage.content[0].text : "";

    return (
      <MessagePrimitive.Root className="w-full max-w-2xl py-4 flex justify-center">
        <PatientSelector originalPrompt={originalPrompt} message={parsedAction.message} />
      </MessagePrimitive.Root>
    );
  }

  return (
    <MessagePrimitive.Root className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-2xl py-4 gap-x-3 items-start">
      <Image
        src="/assets/icons/chat.png"
        width={32}
        height={32}
        alt="Tera"
        className="rounded-full row-span-2"
      />
      <div className="text-foreground max-w-full break-words leading-7 col-start-2 row-start-1 my-1.5">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
      <AssistantActionBar />
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    autohideFloat="single-branch"
    className="text-muted-foreground flex gap-1 col-start-2 row-start-2 -ml-1"
  >
    {/* Copy */}
    <ActionBarPrimitive.Copy asChild>
      <TooltipIconButton tooltip="Copy">
        <MessagePrimitive.If copied={false}>
          <CopyIcon />
        </MessagePrimitive.If>
        <MessagePrimitive.If copied>
          <CheckIcon />
        </MessagePrimitive.If>
      </TooltipIconButton>
    </ActionBarPrimitive.Copy>

    {/* Thumbs up */}
    <ActionBarPrimitive.FeedbackPositive asChild>
      <TooltipIconButton tooltip="Like">
        <ThumbsUpIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.FeedbackPositive>

    {/* Thumbs down */}
    <ActionBarPrimitive.FeedbackNegative asChild>
      <TooltipIconButton tooltip="Dislike">
        <ThumbsDownIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.FeedbackNegative>

    {/* Retry / Reload */}
    <ActionBarPrimitive.Reload asChild>
      <TooltipIconButton tooltip="Try again">
        <RefreshCwIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.Reload>
  </ActionBarPrimitive.Root>
);
