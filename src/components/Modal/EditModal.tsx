import { FC, useState } from "react";
import { Form, FormSubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Button, ButtonProps } from "components/Buttons";
import { ConfirmModal, Modal } from "components/Modal";
import { TextArea } from "components/Form";

import { combineClassName } from "global/helpers";
import { useFormWithZod } from "global/hook";

const editModalSchema = z.object({
  fieldValue: z.string().trim().nullish(),
});

interface Props {
  button?: {
    primary?: Omit<ButtonProps, "type" | "onPress">;
    secondary?: ButtonProps;
    className?: string;
  };
  onClose: () => void;
  onSubmitHandler: FormSubmitHandler<z.infer<typeof editModalSchema>>;
  inputFieldValue?: string | null;
  overlayClassName?: string;
  className?: string;
  inputFieldClassName?: string;
  isOpen: boolean;
  loading?: boolean;
  modalClassName?: string;
  title?: string;
  titleClassName?: string;
  inputFieldLabel?: string;
  inputFieldPlaceholder?: string;
}

const EditModal: FC<Props> = ({
  onClose,
  onSubmitHandler,
  button,
  inputFieldValue,
  className,
  overlayClassName,
  inputFieldClassName,
  isOpen,
  loading,
  modalClassName,
  title,
  titleClassName,
  inputFieldLabel,
  inputFieldPlaceholder,
}) => {
  const { control } = useFormWithZod({
    schema: editModalSchema,
    defaultValues: {
      fieldValue: inputFieldValue,
    },
  });

  const [showEdit, setShowEdit] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closeConfirmModal = () => {
    setShowEdit(false);
    setShowConfirmModal(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Add"
      className={combineClassName(
        "grid place-content-center gap-4 w-auto",
        className
      )}
      overlayClassName={overlayClassName}
      loading={loading}
      modalClassName={combineClassName(
        "px-20 py-4 sm:py-10 gap-y-4",
        modalClassName
      )}
    >
      <Form
        id="edit-modal-form"
        control={control}
        onSubmit={onSubmitHandler}
        className="space-y-4"
      >
        {title && (
          <p
            className={combineClassName(
              "text-xl leading-8 font-sunbird text-center w-full",
              titleClassName
            )}
          >
            {title}
          </p>
        )}

        <TextArea
          control={control}
          name={"fieldValue"}
          inputClassName={inputFieldClassName}
          label={inputFieldLabel}
          placeholder={inputFieldPlaceholder}
          readOnly={!showEdit}
        />

        {button?.primary || button?.secondary ? (
          <div
            className={combineClassName(
              "flex justify-center items-center w-full gap-[14px]",
              button?.className
            )}
          >
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
            <Button
              {...button?.primary}
              variant={button?.primary?.variant ?? "filled"}
              className={combineClassName(
                "min-w-[100px]",
                button?.primary?.className
              )}
              type={"button"}
              onPress={() => {
                showEdit ? setShowConfirmModal(true) : setShowEdit(true);
              }}
            >
              {button?.primary?.children
                ? button?.primary?.children
                : showEdit
                ? "SAVE"
                : "EDIT"}
            </Button>
          </div>
        ) : null}

        <ConfirmModal
          message={"Confirm Edit?"}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: button?.primary?.loading,
              form: "edit-modal-form",
              type: "submit",
            },
            secondary: {
              isDisabled: button?.primary?.loading,
            },
          }}
          isOpen={showConfirmModal}
          loading={button?.primary?.loading}
        />
      </Form>
    </Modal>
  );
};

export default EditModal;
