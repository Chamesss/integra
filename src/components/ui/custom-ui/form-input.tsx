import React, { forwardRef, useState } from "react";
import { Input } from "../input";
import { FieldError } from "react-hook-form";
import { Eye, EyeClosed } from "lucide-react";
import { cn } from "@/lib/utils";
import ErrorMsg from "../misc/error-msg";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError | string;
  prefix?: string;
}

const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ error, prefix, type, style, ...inputProps }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    // calculate dynamic prefix occupied space
    const PrefixHtmlElement = document.createElement("span") as HTMLSpanElement;
    PrefixHtmlElement.textContent = prefix ?? "";
    PrefixHtmlElement.style.whiteSpace = "pre";
    document.body.appendChild(PrefixHtmlElement);
    const prefixLength = PrefixHtmlElement.offsetWidth || 0;
    document.body.removeChild(PrefixHtmlElement);

    return (
      <div className="relative flex flex-row items-center gap-2 w-full">
        {prefix && prefixLength > 0 ? (
          <span className="absolute text-sm text-gray-400 left-3">
            {prefix}
          </span>
        ) : null}
        <Input
          ref={ref}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={cn(
            "w-full border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-gray-300",
            error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-gray-500"
          )}
          {...inputProps}
          {...(type === "number" ? { min: 0 } : {})}
          style={{
            ...style,
            ...(prefixLength && {
              paddingLeft: `${prefixLength + 15}px`,
            }),
          }}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 cursor-pointer top-1/2 z-[5] -translate-y-1/2 rounded-full bg-white p-1 transition-all hover:scale-105 hover:bg-black/10 active:scale-95"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <Eye size={18} className="opacity-75" />
            ) : (
              <EyeClosed size={18} className="opacity-75" />
            )}
          </button>
        ) : null}
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
    );
  }
);
FormInput.displayName = "FormInput";

export default FormInput;
