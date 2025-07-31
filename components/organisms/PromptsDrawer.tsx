"use client";

import { 
  Activity,
  BarChart3,
  Calendar,
  ChevronRightIcon, 
  MessageSquare,
  SearchIcon, 
  SparklesIcon, 
  Users,
  XIcon 
} from "lucide-react";
import { useState } from "react";
import { 
  PROMPT_CATEGORIES, 
  type PromptCategory, 
  type Prompt 
} from "@/app/constants/prompts-config";
import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms/Input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/organisms/Drawer";

interface PromptsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromptSelect: (prompt: Prompt) => void;
}

// Icon mapping function
const getIconComponent = (iconName: string) => {
  const iconMap = {
    Calendar,
    MessageSquare,
    Users,
    Activity,
    BarChart3,
  } as const;
  
  const IconComponent = iconMap[iconName as keyof typeof iconMap];
  return IconComponent ? <IconComponent className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />;
};

export function PromptsDrawer({ open, onOpenChange, onPromptSelect }: PromptsDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter prompts based on search term
  const filteredCategories = PROMPT_CATEGORIES.map(category => ({
    ...category,
    prompts: category.prompts.filter(prompt =>
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.prompts.length > 0);

  const handlePromptClick = (prompt: Prompt) => {
    onPromptSelect(prompt);
    onOpenChange(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const resetView = () => {
    setSelectedCategory(null);
    setSearchTerm("");
  };

  // Show category detail view
  if (selectedCategory) {
    const category = PROMPT_CATEGORIES.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    return (
      <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
        <DrawerContent direction="right" className="w-[90vw] sm:w-[500px] max-w-[500px]">
          <DrawerHeader className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetView}
                  className="h-8 w-8"
                >
                  <ChevronRightIcon className="h-4 w-4 rotate-180" />
                </Button>
                <div>
                  <DrawerTitle className="text-lg font-semibold flex items-center gap-2">
                    {getIconComponent(category.icon)}
                    {category.title}
                  </DrawerTitle>
                  <DrawerDescription className="text-sm text-slate-500">
                    Choose a prompt to get started
                  </DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {category.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="group p-4 rounded-lg border border-slate-200 hover:border-brand-blue hover:bg-brand-50 cursor-pointer transition-all duration-200"
                >
                  <h3 className="font-medium text-slate-900 group-hover:text-brand-blue mb-2">
                    {prompt.title}
                  </h3>
                  {prompt.description && (
                    <p className="text-sm text-slate-600 mb-3">
                      {prompt.description}
                    </p>
                  )}
                  <div className="text-sm text-slate-500 bg-slate-50 rounded-md p-3 border">
                    "{prompt.text}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Main category view
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent direction="right" className="w-[90vw] sm:w-[500px] max-w-[500px]">
        <DrawerHeader className="border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-brand-blue" />
                Explore Prompts
              </DrawerTitle>
              <DrawerDescription className="text-sm text-slate-500">
                Get started with AI-powered assistance
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <XIcon className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {searchTerm ? (
            // Search results view
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900 mb-3">
                Search Results ({filteredCategories.reduce((acc, cat) => acc + cat.prompts.length, 0)})
              </h3>
              {filteredCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  {category.prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => handlePromptClick(prompt)}
                      className="group p-3 rounded-lg border border-slate-200 hover:border-brand-blue hover:bg-brand-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getIconComponent(category.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 group-hover:text-brand-blue">
                            {prompt.title}
                          </h4>
                          <p className="text-xs text-slate-500 mb-2">
                            {category.title}
                          </p>
                          <div className="text-sm text-slate-600 bg-slate-50 rounded-md p-2 border">
                            "{prompt.text}"
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <SparklesIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No prompts found matching your search.</p>
                </div>
              )}
            </div>
          ) : (
            // Categories view
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900 mb-3">Categories</h3>
              {PROMPT_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group p-4 rounded-lg border border-slate-200 hover:border-brand-blue hover:bg-brand-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getIconComponent(category.icon)}
                      <div>
                        <h4 className="font-medium text-slate-900 group-hover:text-brand-blue">
                          {category.title}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {category.prompts.length} prompt{category.prompts.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-brand-blue transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
} 