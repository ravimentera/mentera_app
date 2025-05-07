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
import ChatClient from "./chat/ChatClient";

export function DrawerComponent() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          type="button"
          className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full z-50 shadow-lg hover:bg-blue-700 transition"
        >
          <RobotIcon width={48} height={48} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen w-1/2 flex flex-col">
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
