import { FC } from "react";

import { Button, ButtonProps } from "components/Buttons";
import { Modal } from "components/Modal";

import { combineClassName } from "global/helpers";

interface Props {
  button?: {
    primary?: ButtonProps;
    secondary?: ButtonProps;
    className?: string;
  };
  onClose: () => void;
  message: string;
  overlayClassName?: string;
  className?: string;
  messageClassName?: string;
  isOpen: boolean;
  loading?: boolean;
  modalClassName?: string;
}

const ConfirmModal: FC<Props> = ({
  onClose,
  button,
  message,
  className,
  overlayClassName,
  messageClassName,
  isOpen,
  loading,
  modalClassName,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Add"
      className={combineClassName(
        "grid place-content-center gap-4 w-[210px]",
        className
      )}
      overlayClassName={overlayClassName}
      loading={loading}
      modalClassName={combineClassName(
        "p-10 md:px-20 md:py-10 transition-all",
        modalClassName
      )}
    >
      <p
        className={combineClassName(
          "text-xl leading-8 font-sunbird text-center w-full",
          messageClassName
        )}
      >
        {message}
      </p>
      {button?.primary || button?.secondary ? (
        <div
          className={combineClassName(
            "flex justify-center items-center w-full gap-[14px]",
            button?.className
          )}
        >
          {button?.secondary && (
            <Button
              {...button?.secondary}
              variant={button?.secondary?.variant ?? "outlined"}
              onPress={(e) => {
                button?.secondary?.onPress?.(e);
                onClose();
              }}
              className={combineClassName(
                "min-w-[100px]",
                button?.secondary?.className
              )}
            >
              {button?.secondary?.children ?? "CANCEL"}
            </Button>
          )}

          {button?.primary && (
            <Button
              {...button?.primary}
              variant={button?.primary?.variant ?? "filled"}
              className={combineClassName(
                "min-w-[100px]",
                button?.primary?.className
              )}
            >
              {button?.primary?.children ?? "CONFIRM"}
            </Button>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export { ConfirmModal };
