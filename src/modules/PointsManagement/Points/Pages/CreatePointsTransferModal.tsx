import { FC, useState } from "react";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";

import { ConfirmModal, Modal } from "components/Modal";
import { InputField, Select, TextArea } from "components/Form";
import { Button as _Button } from "components/Buttons";

import { combineClassName } from "global/helpers";
import { useFormWithZod } from "global/hook";

import {
  PointsTransferForm,
  pointsTransferFormSchema,
} from "modules/PointsManagement";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    type: string,
    points: number,
    remarks: string | null | undefined,
    onClose: () => void
  ) => void;
  loading: boolean;
  isAdmin: boolean;
  maxValue?: number | null;
}

const CreatePointsTransferModal: FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  isAdmin,
}) => {
  const {
    control,
    formState: { isValid },
  } = useFormWithZod({
    schema: pointsTransferFormSchema,
  });

  const [watchPoints, watchType] = useWatch({
    control,
    name: ["points", "type"],
  });

  const [confirmModal, setConfirmModal] = useState(false);

  const conFirmModalCloseHandler = () => {
    setConfirmModal(false);
  };

  const submitHandler: FormSubmitHandler<PointsTransferForm> = ({
    data: { type, points, remarks },
  }) => {
    onSubmit(type, points, remarks, () => {
      conFirmModalCloseHandler();
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Create Points Transfer"
      className={combineClassName("space-y-4")}
      modalClassName={combineClassName("p-6 md:p-8 transition-all")}
    >
      <div className="flex justify-center">
        <p className="whitespace-nowrap text-primary-text text-xl font-sunbird">
          {isAdmin ? "Points Transfer Type" : "Purchase of Points"}
        </p>
      </div>
      <Form control={control} onSubmit={submitHandler} id={"points-transfer"}>
        <div className="grid grid-cols-1 gap-4 sm:w-[524px]">
          <Select
            control={control}
            name="type"
            label="Type of transfer"
            options={["Add Points", "Deduct Points"]}
          />
          <InputField
            control={control}
            name="points"
            label="Points"
            type="number"
          />
          <TextArea control={control} name="remarks" label="Remarks" />
          {watchPoints || watchPoints === 0 ? (
            <div className="text-xl leading-8">
              <p className="font-sunbird">Summary:</p>
              <p className="text-xl text-primary-main">
                {watchType === "Add Points" && watchPoints !== 0
                  ? `+ ${watchPoints}`
                  : watchType === "Deduct Points" && watchPoints !== 0
                  ? `- ${watchPoints}`
                  : watchPoints}{" "}
                Points
              </p>
            </div>
          ) : null}
          <div className="flex gap-4">
            <_Button
              variant="outlined"
              className={"w-full shadow-none"}
              onPress={onClose}
            >
              CANCEL
            </_Button>
            <_Button
              type={"button"}
              className={combineClassName(
                isValid
                  ? "w-full bg-none bg-primary-main border-primary-main"
                  : "w-full bg-none bg-action-disabled shadow-none text-black/[26%]"
              )}
              onPress={() => {
                if (isValid) {
                  setConfirmModal(true);
                }
              }}
              isDisabled={!isValid}
            >
              PROCEED
            </_Button>
          </div>
        </div>

        <ConfirmModal
          message={`Confirm Proceed?`}
          onClose={conFirmModalCloseHandler}
          button={{
            primary: {
              loading,
              type: "submit",
              form: "points-transfer",
            },
            secondary: {
              isDisabled: loading,
            },
          }}
          isOpen={confirmModal}
          loading={loading}
        />
      </Form>
    </Modal>
  );
};

export default CreatePointsTransferModal;
