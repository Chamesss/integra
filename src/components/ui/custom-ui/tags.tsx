import { Input } from "../input";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { Button } from "../button";
import { Badge } from "../badge";
import { useState } from "react";

interface Props {
  tags?: string[];
  onChange: (tags: string[]) => void;
}

export default function Tags({ tags, onChange }: Props) {
  const [newTag, setNewTag] = useState("");

  const addTag = (
    tags: string[] | undefined,
    onChange: (v: string[]) => void
  ) => {
    if (newTag.trim() !== "") {
      onChange([...(tags || []), newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (
    tagToRemove: string,
    tags: string[] | undefined,
    onChange: (v: string[]) => void
  ) => {
    const updatedTags = tags?.filter((tag) => tag !== tagToRemove) || [];
    onChange(updatedTags);
    setNewTag("");
  };

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Ajouter une étiquette"
          onKeyDown={(e) => e.key === "Enter" && addTag(tags, onChange)}
        />
        <Button
          type="button"
          onClick={() => addTag(tags, onChange)}
          size="sm"
          className="h-10 w-10 my-auto bg-black/90"
        >
          <Plus className="w-4 h-4 text-white" />
        </Button>
      </div>

      <AnimatePresence>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  className="hover:scale-[1.05] active:scale-[0.95] hover:text-red-600"
                >
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag, tags, onChange)}
                  />
                </button>
              </Badge>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </>
  );
}
