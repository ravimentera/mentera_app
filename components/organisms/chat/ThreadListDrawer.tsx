"use client";

import { Button } from "@/components/atoms";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/organisms/Drawer";
import { ThreadList } from "@/components/organisms/ThreadList";
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
