import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms/Input";
import { Tooltip } from "@/components/atoms/Tooltip";
import { TooltipIconButton } from "@/components/molecules/TooltipIconButton";
import { AppDispatch, RootState } from "@/lib/store";
import { clear as clearFiles } from "@/lib/store/slices/fileUploadsSlice";
import { addThread, clearThreadPatient, setActiveThreadId } from "@/lib/store/slices/threadsSlice";
import { cn } from "@/lib/utils";
import { ArchiveIcon, Edit, Search } from "lucide-react";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

interface ThreadListProps {
  /**
   * Whether to show the component in sidebar mode (with specific padding/spacing)
   * Default: false (for drawer/modal usage)
   */
  sidebarMode?: boolean;
  /**
   * Custom className for the root container
   */
  className?: string;
}

export const ThreadList: FC<ThreadListProps> = ({ sidebarMode = false, className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { threads, activeThreadId } = useSelector((s: RootState) => s.threads);

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // Filter threads based on search term and first message processing
  const filteredThreads = useMemo(() => {
    // Only show threads that have processed their first message
    const visibleThreads = threads.filter((thread) => thread.isFirstQueryProcessed === true);

    if (!searchTerm) return visibleThreads;

    const searchLower = searchTerm.toLowerCase();
    return visibleThreads.filter((thread) => {
      // Search in thread name (case-insensitive)
      const nameMatch = thread.name.toLowerCase().includes(searchLower);

      // Also search in original first message if available
      const originalMessageMatch = thread.originalFirstMessage
        ? thread.originalFirstMessage.toLowerCase().includes(searchLower)
        : false;

      return nameMatch || originalMessageMatch;
    });
  }, [threads, searchTerm]);

  // Handle new chat creation
  const handleNewChatClick = () => {
    dispatch(clearFiles());
    const newThreadId = uuidv4();
    dispatch(addThread({ id: newThreadId, name: "New Chat", activate: true }));
    // Clear any patient selection for the new thread
    dispatch(clearThreadPatient(newThreadId));
  };

  // Handle thread selection
  const handleSelectChat = (threadId: string) => {
    dispatch(clearFiles());
    dispatch(setActiveThreadId(threadId));
  };

  // Handle thread deletion/archiving
  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent thread selection when deleting
    // You can implement actual deletion logic here
    // For now, we'll just log it
    console.log("Delete thread:", threadId);
  };

  // Apply different styling based on usage mode
  const containerClassName = sidebarMode
    ? "px-3 pb-4 space-y-4" // Sidebar specific padding
    : "flex flex-col items-stretch gap-1.5 h-full"; // Drawer/modal styling

  const searchInputClassName = sidebarMode
    ? "w-full pl-9 h-10 bg-white" // Sidebar search styling
    : "w-full pl-9 h-10 bg-white"; // Drawer search styling (same for now)

  return (
    <div className={cn(containerClassName, className)}>
      {/* New Thread Button and Search - grouped in sidebar mode */}
      {sidebarMode ? (
        <div className="space-y-2">
          <ThreadListNew onNewChat={handleNewChatClick} sidebarMode={sidebarMode} />
          <ThreadListSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            className={searchInputClassName}
          />
        </div>
      ) : (
        <>
          <ThreadListNew onNewChat={handleNewChatClick} sidebarMode={sidebarMode} />
          <ThreadListSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            className={searchInputClassName}
          />
        </>
      )}

      {/* Thread Items */}
      <div className={sidebarMode ? "space-y-1" : "flex-1 overflow-y-auto space-y-1"}>
        {sidebarMode && (
          <div className="px-2 py-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recents
            </span>
          </div>
        )}

        <ThreadListItems
          threads={filteredThreads}
          activeThreadId={activeThreadId}
          searchTerm={searchTerm}
          onSelectThread={handleSelectChat}
          onDeleteThread={handleDeleteThread}
          sidebarMode={sidebarMode}
        />
      </div>
    </div>
  );
};

interface ThreadListNewProps {
  onNewChat: () => void;
  sidebarMode: boolean;
}

const ThreadListNew: FC<ThreadListNewProps> = ({ onNewChat, sidebarMode }) => {
  const buttonClassName = sidebarMode
    ? "w-full justify-start gap-2.5 h-10 px-2 bg-slate-100 text-brand-blue hover:bg-slate-200"
    : "data-[active]:bg-muted hover:bg-muted flex items-center justify-start gap-2.5 rounded-lg px-2.5 py-2 text-start h-10 bg-slate-100 text-brand-blue hover:bg-slate-200";

  return (
    <Button onClick={onNewChat} className={buttonClassName} variant="ghost">
      <Edit className="h-4 w-4" />
      <span className="text-sm font-medium">{sidebarMode ? "New Chat" : "New Thread"}</span>
    </Button>
  );
};

interface ThreadListSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  className?: string;
}

const ThreadListSearch: FC<ThreadListSearchProps> = ({ searchTerm, onSearchChange, className }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search chats and messages..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={className}
        autoComplete="off"
      />
    </div>
  );
};

interface ThreadListItemsProps {
  threads: any[];
  activeThreadId: string | null;
  searchTerm: string;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string, e: React.MouseEvent) => void;
  sidebarMode: boolean;
}

const ThreadListItems: FC<ThreadListItemsProps> = ({
  threads,
  activeThreadId,
  searchTerm,
  onSelectThread,
  onDeleteThread,
  sidebarMode,
}) => {
  if (searchTerm && threads.length === 0) {
    return (
      <div className="px-2 py-4 text-center">
        <p className="text-xs text-gray-500">No chats found</p>
        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
      </div>
    );
  }

  const containerClassName = sidebarMode ? "space-y-1" : "space-y-1";

  return (
    <div className={containerClassName}>
      {threads.map((thread) => (
        <ThreadListItem
          key={thread.id}
          thread={thread}
          isActive={activeThreadId === thread.id}
          onSelect={() => onSelectThread(thread.id)}
          onDelete={(e) => onDeleteThread(thread.id, e)}
          sidebarMode={sidebarMode}
        />
      ))}
    </div>
  );
};

interface ThreadListItemProps {
  thread: any;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  sidebarMode: boolean;
}

const ThreadListItem: FC<ThreadListItemProps> = ({
  thread,
  isActive,
  onSelect,
  onDelete,
  sidebarMode,
}) => {
  // Check if the thread name should show a tooltip
  const tooltipThreshold = sidebarMode ? 30 : 40;
  const shouldShowTooltip = thread.name && thread.name.length > tooltipThreshold;

  // Create tooltip content that shows both the full title and original message if available
  const tooltipContent = shouldShowTooltip ? (
    <div className="max-w-xs">
      <div className="font-medium">{thread.name}</div>
      {thread.originalFirstMessage && thread.originalFirstMessage !== thread.name && (
        <div className="text-xs opacity-75 mt-1">
          Original:{" "}
          {thread.originalFirstMessage.length > 100
            ? thread.originalFirstMessage.substring(0, 100) + "..."
            : thread.originalFirstMessage}
        </div>
      )}
    </div>
  ) : (
    thread.name
  );

  // Different styling for sidebar vs drawer mode
  const containerClassName = sidebarMode
    ? "group" // Simple group for sidebar
    : "data-[active]:bg-muted hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 group";

  const buttonClassName = sidebarMode
    ? cn(
        "w-full justify-start h-9 px-2 text-gray-600 hover:bg-slate-100 text-sm",
        isActive && "bg-slate-200 text-gray-800 font-semibold",
      )
    : cn(
        "flex-grow px-3 py-2 text-start justify-start h-9 text-gray-600 hover:bg-slate-100 text-sm",
        isActive && "bg-slate-200 text-gray-800 font-semibold",
      );

  if (sidebarMode) {
    // Sidebar mode - simpler layout, no visible archive button
    return (
      <Tooltip content={tooltipContent} disabled={!shouldShowTooltip} side="right" align="start">
        <Button variant="ghost" onClick={onSelect} className={buttonClassName}>
          <ThreadListItemTitle title={thread.name} />
        </Button>
      </Tooltip>
    );
  }

  // Drawer mode - full layout with archive button
  return (
    <div className={containerClassName}>
      <Tooltip content={tooltipContent} disabled={!shouldShowTooltip} side="right" align="start">
        <Button variant="ghost" onClick={onSelect} className={buttonClassName}>
          <ThreadListItemTitle title={thread.name} />
        </Button>
      </Tooltip>

      <ThreadListItemArchive onArchive={onDelete} />
    </div>
  );
};

interface ThreadListItemTitleProps {
  title: string;
}

const ThreadListItemTitle: FC<ThreadListItemTitleProps> = ({ title }) => {
  return <span className="text-sm truncate">{title || "New Chat"}</span>;
};

interface ThreadListItemArchiveProps {
  onArchive: (e: React.MouseEvent) => void;
}

const ThreadListItemArchive: FC<ThreadListItemArchiveProps> = ({ onArchive }) => {
  return (
    <TooltipIconButton
      className="opacity-0 group-hover:opacity-100 hover:text-primary text-foreground mr-3 size-4 p-0 transition-opacity"
      variant="ghost"
      tooltip="Archive thread"
      onClick={onArchive}
    >
      <ArchiveIcon />
    </TooltipIconButton>
  );
};
