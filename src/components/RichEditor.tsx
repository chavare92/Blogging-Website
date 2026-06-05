import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  ImageIcon,
  X,
  Check,
  SquareCode,
} from "lucide-react";

/* ─── Resizable Image Node View ─────────────────────────────────────── */

function ResizableImageView({ node, updateAttributes }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = imgRef.current?.offsetWidth ?? 300;

    const onMove = (mv: MouseEvent) => {
      const delta = mv.clientX - startX.current;
      const newWidth = Math.max(80, startW.current + delta);
      updateAttributes({ width: newWidth });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [updateAttributes]);

  const width = node.attrs.width as number | undefined;

  return (
    <NodeViewWrapper className="relative inline-block my-4 max-w-full">
      <img
        ref={imgRef}
        src={node.attrs.src as string}
        alt={(node.attrs.alt as string) || ""}
        className="rounded-lg block"
        style={{ width: width ? `${width}px` : undefined, maxWidth: "100%" }}
        draggable={false}
      />
      {/* Drag handle on the right edge */}
      <div
        onMouseDown={onMouseDown}
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-8 bg-blue-600 rounded-full cursor-col-resize opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10"
        title="Drag to resize"
      />
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null, renderHTML: (attrs) => attrs.width ? { style: `width:${attrs.width}px` } : {} },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

/* ─── Editor ─────────────────────────────────────────────────────────── */

interface RichEditorProps {
  onChange: (html: string) => void;
  placeholder?: string;
  value?: string;
}

const ToolbarBtn = ({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()} // keep editor selection alive
    onClick={onClick}                        // fire command after mouseup
    title={title}
    className={`p-1.5 rounded-md transition-colors ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

export default function RichEditor({ onChange, placeholder = "Start writing your article...", value }: RichEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Disable built-ins that we configure separately to avoid duplicate extension warnings
        link: false,
        underline: false,
      }),
      Underline,
      ResizableImage.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // When value is provided externally (edit mode), sync it into the editor once
  const valueRef = useRef(value);
  useEffect(() => {
    if (editor && value !== undefined && value !== valueRef.current && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      valueRef.current = value;
    }
  }, [editor, value]);

  useEffect(() => {
    if (showLinkInput) linkInputRef.current?.focus();
  }, [showLinkInput]);

  useEffect(() => {
    if (showImageInput) imageInputRef.current?.focus();
  }, [showImageInput]);

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor?.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor?.chain().focus().setLink({ href: url }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      const url = imageUrl.startsWith("http") ? imageUrl : `https://${imageUrl}`;
      editor?.chain().focus().setImage({ src: url, alt: "" }).run();
    }
    setShowImageInput(false);
    setImageUrl("");
  };

  if (!editor) return null;

  // Floating bubble state — position derived from browser selection
  const { selection } = editor.state;
  const hasTextSelection = !selection.empty && selection.$from.pos !== selection.$to.pos;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
        {/* Text formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <UnderlineIcon size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Lists & blocks */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <Code size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <SquareCode size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
          <Minus size={15} />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarBtn
            onClick={() => {
              setShowImageInput(false);
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setLinkUrl(editor.getAttributes("link").href || "");
                setShowLinkInput((v) => !v);
              }
            }}
            active={editor.isActive("link") || showLinkInput}
            title="Insert Link"
          >
            <Link2 size={15} />
          </ToolbarBtn>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1.5 min-w-[260px]">
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); } }}
                placeholder="https://example.com"
                className="flex-1 text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={applyLink} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Check size={13} />
              </button>
              <button type="button" onClick={() => { setShowLinkInput(false); setLinkUrl(""); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarBtn
            onClick={() => {
              setShowLinkInput(false);
              setShowImageInput((v) => !v);
            }}
            active={showImageInput}
            title="Insert Image by URL"
          >
            <ImageIcon size={15} />
          </ToolbarBtn>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1.5 min-w-[300px]">
              <input
                ref={imageInputRef}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") insertImage(); if (e.key === "Escape") { setShowImageInput(false); setImageUrl(""); } }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={insertImage} className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Check size={13} />
              </button>
              <button type="button" onClick={() => { setShowImageInput(false); setImageUrl(""); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline floating toolbar — appears when text is selected */}
      {hasTextSelection && (
        <div className="sticky top-0 z-30 flex items-center gap-0.5 bg-gray-900 rounded-lg shadow-xl px-1.5 py-1 mx-3 my-1 w-fit">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs font-bold transition-colors ${editor.isActive("bold") ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"}`}
          >B</button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs italic transition-colors ${editor.isActive("italic") ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"}`}
          >I</button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded text-xs underline transition-colors ${editor.isActive("underline") ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"}`}
          >U</button>
          <div className="w-px h-4 bg-gray-600 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                const url = window.prompt("Enter URL:");
                if (url) editor.chain().focus().setLink({ href: url.startsWith("http") ? url : `https://${url}` }).run();
              }
            }}
            className={`p-1.5 rounded transition-colors ${editor.isActive("link") ? "bg-white text-blue-600" : "text-gray-300 hover:text-white"}`}
            title="Link"
          >
            <Link2 size={12} />
          </button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="px-5 py-4 cursor-text text-gray-800 text-[1.0625rem] leading-[1.85] group"
      />
    </div>
  );
}
