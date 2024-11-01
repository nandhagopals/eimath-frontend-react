import {
  Dialog,
  DialogProps,
  Heading,
  HeadingProps,
  Modal,
  ModalOverlay,
  ModalOverlayProps,
} from "react-aria-components";

import { combineClassName } from "global/helpers";

const _DialogOverlay = ({
  className,
  isDismissable = true,
  loading,
  ...props
}: ModalOverlayProps & { loading?: boolean }) => (
  <ModalOverlay
    isDismissable={isDismissable}
    className={(values) =>
      combineClassName(
        "fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur",
        values?.isEntering ? "animate-in fade-in duration-300 ease-out" : "",
        values?.isExiting ? "animate-out fade-out duration-200 ease-in" : "",
        loading ? "" : "cursor-pointer",
        typeof className === "function" ? className(values) : className
      )
    }
    {...props}
    onOpenChange={loading ? undefined : props?.onOpenChange}
  />
);

export interface DialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Modal>, "children"> {
  children?: DialogProps["children"];
  role?: DialogProps["role"];
  closeButton?: boolean;
}

const DialogContent = ({
  className,
  children,
  role,
  name,
  modalClassName,
  ...props
}: DialogContentProps & { name: string; modalClassName?: string }) => (
  <Modal
    className={({ isExiting, isEntering }) =>
      combineClassName(
        "max-w-full overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl cursor-default",
        isEntering ? "animate-in zoom-in-95 ease-out duration-300" : "",
        isExiting ? "animate-out zoom-out-95 ease-in duration-200" : "",
        modalClassName
      )
    }
    {...props}
  >
    <Dialog
      role={role}
      className={combineClassName("w-full outline-none", className)}
      aria-label={name || "Dialog"}
    >
      {(values) =>
        typeof children === "function" ? children(values) : children
      }
    </Dialog>
  </Modal>
);

const DialogTitle = ({ className, ...props }: HeadingProps) => (
  <Heading
    slot="title"
    className={combineClassName(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
    aria-label="Dialog"
  />
);

export { _DialogOverlay as DialogOverlay, DialogContent, DialogTitle };
