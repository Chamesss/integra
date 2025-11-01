import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

type EditorProps = {
  name: string;
  className?: string;
};

export default function MinimalEditor({ name, className }: EditorProps) {
  const { setValue, register, getValues, formState } = useFormContext();

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "ProseMirror focus:outline-none h-full focus:ring-0 focus:border-none focus:shadow-none",
      },
    },
    content: getValues(name),
    onUpdate({ editor }) {
      setValue(name, editor.getHTML(), { shouldValidate: true });
    },
  });

  useEffect(() => {
    register(name);
  }, [register, name]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "w-full border focus-within:border-ring overflow-auto scrollbar focus-within:ring-[3px] transition-all focus-within:ring-ring/50 px-4 py-2.5 h-[120px] resize-y rounded-sm text-sm",
        formState.errors[name]
          ? "border-red-300 focus:border-red-500"
          : "border-gray-300 focus:border-gray-500",
        className
      )}
    >
      <EditorContent className="h-full" editor={editor} />
    </div>
  );
}
