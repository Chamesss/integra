import React, { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";
import ErrorMsg from "../misc/error-msg";
import { Textarea } from "../textarea";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: FieldError | string;
  content?: string; // HTML content to inject
}

const FormTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ error, content, ...textareaProps }, ref) => {
    return (
      <div className="w-full space-y-2">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <div className="relative flex flex-row items-center gap-2 w-full">
            <Textarea
              ref={ref}
              className={cn(
                "w-full border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-gray-300",
                error
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-gray-500"
              )}
              {...textareaProps}
            />
            {error ? (
              <ErrorMsg
                message={
                  typeof error === "string"
                    ? error
                    : error.message || "Ce champ est requis."
                }
              />
            ) : null}
          </div>
        )}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
