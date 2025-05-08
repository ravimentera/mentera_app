import { Button } from "@/components/atoms";
import { RobotIcon } from "@/components/atoms/icons/RobotIcon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import { useState } from "react";
import ChatClient from "./chat/ChatClient";

export function DrawerComponent() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full z-50 shadow-lg hover:bg-blue-700 transition 
             p-0 w-[54px] h-[54px] flex items-center justify-center"
        >
          <Image
            src="/assets/icons/chat.png"
            width={54}
            height={54}
            alt="Tera Chat Button"
            className="rounded-full object-contain"
          />
        </Button>
      </DrawerTrigger>

      <DrawerContent isExpanded={isExpanded}>
        <Button
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
          aria-label="Close"
          onClick={() => setIsExpanded(true)}
        >
          ✕AZ
        </Button>
        <DrawerClose asChild>
          <Button
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
            aria-label="Close"
          >
            ✕
          </Button>
        </DrawerClose>
        <DrawerHeader className="shrink-0">
          <DrawerTitle>Talk to Tera</DrawerTitle>
          <DrawerDescription>Your smart assistant is here to help you anytime.</DrawerDescription>
        </DrawerHeader>

        {/* Allocate full height for ChatClient between header and footer */}
        <div className="flex-1 overflow-hidden">
          <ChatClient />
        </div>

        <DrawerFooter className="shrink-0 hidden" />
      </DrawerContent>
    </Drawer>
  );
}
