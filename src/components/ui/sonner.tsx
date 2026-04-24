import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiLoader4Line,
} from "@remixicon/react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      expand={false}
      visibleToasts={4}
      className="toaster"
      icons={{
        success: (
          <span className="app-toast-icon-wrap">
            <RiCheckboxCircleFill className="size-4" />
          </span>
        ),
        info: (
          <span className="app-toast-icon-wrap">
            <RiInformationFill className="size-4" />
          </span>
        ),
        warning: (
          <span className="app-toast-icon-wrap">
            <RiErrorWarningFill className="size-4" />
          </span>
        ),
        error: (
          <span className="app-toast-icon-wrap">
            <RiCloseCircleFill className="size-4" />
          </span>
        ),
        loading: (
          <span className="app-toast-icon-wrap">
            <RiLoader4Line className="size-4 animate-spin" />
          </span>
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
          closeButton: "app-toast-close",
          success: "app-toast-success",
          error: "app-toast-error",
          warning: "app-toast-warning",
          info: "app-toast-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
