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
      <DrawerContent className="h-screen w-1/2">
        <DrawerClose asChild>
          <Button
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
            aria-label="Close"
          >
            ✕
          </Button>
        </DrawerClose>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>Drawer description content.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto">
          <p>This is the main content of the drawer.</p>
          <p>You can add any elements here.</p>
        </div>
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
