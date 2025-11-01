import useBodyScrollLock from "@/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { memo } from "react";
import { createPortal } from "react-dom";

interface PopUpProps {
  children: React.ReactNode;
  selected: boolean | null;
  setSelected: React.Dispatch<React.SetStateAction<boolean | null>>;
  className?: string;
}

export default memo(function PopUp({
  children,
  selected,
  setSelected,
  className = "",
}: PopUpProps) {
  useBodyScrollLock(selected ? selected : false);

  return createPortal(
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelected(null)}
          className="fixed inset-0 isolate !z-[99] flex items-center justify-center bg-black/50 bg-opacity-50 sm:p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative max-h-[90vh] w-full max-w-5xl overflow-auto scrollbar rounded-lg bg-white p-4 shadow-xl dark:bg-neutral-700 sm:p-4 md:p-6",
              className
            )}
          >
            {children}
            <X
              onClick={() => setSelected(null)}
              className="absolute right-4 top-5 h-4 cursor-pointer hover:opacity-75"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
});
