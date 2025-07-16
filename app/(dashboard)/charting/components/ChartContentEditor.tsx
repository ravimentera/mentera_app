"use client";

import type { MDXEditorMethods } from "@mdxeditor/editor";
import { Suspense, lazy, useEffect, useRef, useState } from "react";

// Lazy load the MDXEditor component
const LazyMDXEditor = lazy(() =>
  import("./MDXEditorWrapper").then((module) => ({ default: module.MDXEditorWrapper })),
);

interface ChartContentEditorProps {
  content: string;
  isEditing: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
  onEdit: () => void;
  onContentChange?: (content: string) => void;
}

export function ChartContentEditor({
  content,
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onContentChange,
}: ChartContentEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const editorRef = useRef<MDXEditorMethods>(null);

  // Update local content when prop content changes
  useEffect(() => {
    console.log("Content prop changed, updating editedContent:", content);
    setEditedContent(content);
  }, [content]);

  // Debug log for isEditing prop changes and reset content when switching to read mode
  useEffect(() => {
    console.log("ChartContentEditor: isEditing prop changed to:", isEditing);
    if (!isEditing) {
      // Reset to original content when exiting edit mode
      console.log("Resetting editedContent to original content:", content);
      setEditedContent(content);
    }
  }, [isEditing, content]);

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const handleSave = () => {
    onSave(editedContent);
  };

  const handleCancel = () => {
    setEditedContent(content);
    onCancel();
  };

  const LoadingFallback = ({ isEditing }: { isEditing: boolean }) => (
    <div
      className={`${isEditing ? "min-h-96" : "min-h-32"} flex items-center justify-center bg-gray-50 rounded-lg border`}
    >
      <div className="text-gray-500">Loading {isEditing ? "editor" : "content"}...</div>
    </div>
  );

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Editable MDX Editor */}
        <Suspense fallback={<LoadingFallback isEditing={true} />}>
          <LazyMDXEditor
            key="editor-editable"
            markdown={editedContent}
            onChange={handleContentChange}
            readOnly={false}
            editorRef={editorRef}
          />
        </Suspense>
      </div>
    );
  }

  // Read-only view using MDXEditor
  return (
    <div className="space-y-4">
      <Suspense fallback={<LoadingFallback isEditing={false} />}>
        <LazyMDXEditor key="editor-readonly" markdown={content} readOnly={true} />
      </Suspense>
    </div>
  );
}
