"use client";

import { cn } from "@/lib/utils";
import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
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
  SendHorizontalIcon,
  ShoppingCartIcon,
  SparklesIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";
import Image from "next/image";
import type { FC, ReactNode } from "react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/atoms";
import { MarkdownText } from "@/components/molecules/MarkdownText";
import { TooltipIconButton } from "@/components/molecules/TooltipIconButton";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { UploadedFile, removeFile, selectAllFiles } from "@/lib/store/slices/fileUploadsSlice";

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
          <h1 className="text-5xl font-bold text-purple-600">Hello, Lucy</h1>
          <h2 className="text-2xl mt-2 text-slate-600">Your Medspa's Smartest Assistant</h2>
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
    className="flex items-center justify-start gap-2 text-sm font-medium p-2 rounded-3xl border bg-white hover:bg-slate-50 transition-colors flex-1 basis-[calc(33.333%-0.5rem)] min-w-[200px]"
  >
    {icon}
    <span>{prompt}</span>
  </ThreadPrimitive.Suggestion>
);

const ThreadWelcomeSuggestions: FC = () => {
  const suggestions = [
    { prompt: "Today's Appointments", icon: <CalendarIcon className="w-4 h-4 text-purple-600" /> },
    {
      prompt: "Send Reminder SMS",
      icon: <MessageSquareIcon className="w-4 h-4 text-purple-600" />,
    },
    {
      prompt: "Draft Aftercare Message",
      icon: <FileTextIcon className="w-4 h-4 text-purple-600" />,
    },
    { prompt: "Patient History Summary", icon: <UsersIcon className="w-4 h-4 text-purple-600" /> },
    {
      prompt: "Pre/Post Instructions",
      icon: <ClipboardListIcon className="w-4 h-4 text-purple-600" />,
    },
    { prompt: "Create Campaign", icon: <SparklesIcon className="w-4 h-4 text-purple-600" /> },
    { prompt: "Send Consent Form", icon: <FileTextIcon className="w-4 h-4 text-purple-600" /> },
    { prompt: "Inventory Check", icon: <ShoppingCartIcon className="w-4 h-4 text-purple-600" /> },
    { prompt: "No-show Reports", icon: <XCircleIcon className="w-4 h-4 text-purple-600" /> },
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

  const triggerBrowse = () => fileInputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    if (!e.target.files) return;
    const files = useSelector(selectAllFiles);
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
    <div className="p-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl shadow-lg w-full">
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
              className="my-2.5 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-lg w-8 h-8 hover:opacity-90 transition-opacity shrink-0"
            >
              <SendHorizontalIcon className="h-5 w-5" />
            </Button>
          </ComposerPrimitive.Send>
        </div>
        <div className=" flex items-center px-2.5 py-1">
          <TooltipIconButton
            tooltip="Attach file"
            variant="ghost"
            className="h-auto p-1.5"
            onClick={triggerBrowse}
          >
            <PaperclipIcon className="h-5 w-5 text-black" />
          </TooltipIconButton>

          <div className="border-t border-slate-200 border h-4"></div>
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

const AssistantMessage: FC = () => {
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

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground flex gap-1 col-start-2 row-start-2 -ml-1"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
    </ActionBarPrimitive.Root>
  );
};
