import { Button } from "@/components/atoms";
import { Tooltip } from "@/components/atoms/Tooltip";
import { TooltipIconButton } from "@/components/molecules/TooltipIconButton";
import { ThreadListItemPrimitive, ThreadListPrimitive } from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";
import type { FC } from "react";

export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="data-[active]:bg-muted hover:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start"
        variant="ghost"
      >
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="data-[active]:bg-muted hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2">
      <ThreadListItemPrimitive.Trigger className="flex-grow px-3 py-2 text-start">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    // @ts-ignore
    <ThreadListItemPrimitive.Title fallback="New Chat">
      {(title: string) => {
        // Check if the title is truncated (longer than ~40 characters)
        const shouldShowTooltip = title && title.length > 40;

        return (
          <Tooltip content={title} disabled={!shouldShowTooltip} side="right" align="start">
            <p className="text-sm truncate">{title}</p>
          </Tooltip>
        );
      }}
    </ThreadListItemPrimitive.Title>
  );
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="hover:text-primary text-foreground ml-auto mr-3 size-4 p-0"
        variant="ghost"
        tooltip="Archive thread"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
