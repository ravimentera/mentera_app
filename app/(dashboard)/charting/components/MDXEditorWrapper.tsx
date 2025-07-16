"use client";

import {
  BoldItalicUnderlineToggles,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import React from "react";

interface MDXEditorWrapperProps {
  markdown: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  editorRef?: React.RefObject<MDXEditorMethods>;
}

// Custom toolbar component that matches Figma design
const CustomToolbar = () => (
  <div className="flex items-center gap-1">
    {/* Bold, Italic, Underline */}
    <div className="flex items-center">
      <BoldItalicUnderlineToggles />
    </div>
    <div className="w-px h-5 bg-gray-300 mx-1" />
    {/* Lists */}
    <div className="flex items-center">
      <ListsToggle options={["bullet", "number"]} />
    </div>
  </div>
);

export function MDXEditorWrapper({
  markdown,
  onChange,
  readOnly = false,
  editorRef,
}: MDXEditorWrapperProps) {
  console.log("MDXEditorWrapper rendering with readOnly:", readOnly);

  // Core plugins that ensure consistent rendering
  const corePlugins = [
    headingsPlugin(),
    listsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    markdownShortcutPlugin(),
  ];

  const plugins = [...corePlugins];

  // Add toolbar only for editable mode with exact Figma controls
  if (!readOnly) {
    console.log("Adding toolbar plugin for editable mode");
    plugins.push(
      toolbarPlugin({
        toolbarContents: () => {
          console.log("Rendering CustomToolbar");
          return <CustomToolbar />;
        },
      }),
    );
  } else {
    console.log("Skipping toolbar for read-only mode");
  }

  return (
    <div className="overflow-hidden border rounded-lg bg-white">
      <MDXEditor
        key={`mdx-editor-${readOnly ? "readonly" : "editable"}`}
        ref={editorRef}
        markdown={markdown}
        onChange={onChange}
        readOnly={readOnly}
        plugins={plugins}
        className={`${readOnly ? "prose prose-sm max-w-none [&_.mdxeditor]:!border-0 [&_.mdxeditor]:!shadow-none" : "min-h-96 [&_.mdxeditor]:!border-0 [&_.mdxeditor]:!shadow-none"}`}
        contentEditableClassName="prose prose-sm max-w-none focus:outline-none p-4"
      />
    </div>
  );
}
