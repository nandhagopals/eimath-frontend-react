import { FC, ReactNode } from "react";

import { DialogContent, DialogOverlay } from "components/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  name: string;
  overlayClassName?: string;
  modalClassName?: string;
  className?: string;
  loading?: boolean;
  isDismissable?: boolean;
}

const Modal: FC<Props> = ({
  isOpen,
  onClose,
  children,
  name,
  className,
  modalClassName,
  overlayClassName,
  loading,
  isDismissable = true,
}) => {
  return (
    <DialogOverlay
      isOpen={isOpen}
      onOpenChange={onClose}
      className={overlayClassName}
      loading={loading}
      isDismissable={isDismissable}
    >
      <DialogContent
        name={name}
        className={className}
        modalClassName={modalClassName}
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  );
};

export { Modal };
