"use client";

import { ThreadList } from "@/components/assistant_ui/thread_list";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThreadListDrawer({ open, onOpenChange }: Props) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      {/* right-hand sliding panel */}
      <DrawerContent className="bg-background w-[280px]">
        <DrawerHeader className="flex-row items-center justify-between border-b">
          <DrawerTitle className="text-base">Conversations</DrawerTitle>

          <DrawerClose asChild>
            <Button size="icon" variant="ghost" aria-label="Close chat list">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <ThreadList />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
