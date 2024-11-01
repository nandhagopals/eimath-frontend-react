import { FC } from "react";
import { useMutation } from "@apollo/client";
import { Form, FormSubmitHandler } from "react-hook-form";

import { Modal } from "components/Modal";
import { TextArea } from "components/Form";
import { Button } from "components/Buttons";

import { useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, somethingWentWrongMessage } from "global/helpers";
import CancelIcon from "global/assets/images/close-filled.svg?react";
import { RefetchQueryType } from "global/types";

import {
  WITHDRAW_STUDENTS,
  FilterStudentsArgs,
  FilterStudentsResponse,
  withdrawRemarkFormSchema,
  WithdrawForm,
} from "modules/Students";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  withDrawRemark: string | null | undefined;
  refetch: RefetchQueryType<FilterStudentsResponse, FilterStudentsArgs>;
}

const WithdrawWithRemark: FC<Props> = ({
  isOpen,
  onClose,
  studentId,
  withDrawRemark,
  refetch,
}) => {
  const [updateMutation, { loading }] = useMutation(WITHDRAW_STUDENTS);

  const { control } = useFormWithZod({
    schema: withdrawRemarkFormSchema,
    defaultValues: {
      remark: withDrawRemark,
    },
  });
  const submitHandler: FormSubmitHandler<WithdrawForm> = ({
    data: { remark },
  }) => {
    if (studentId) {
      updateMutation({
        variables: {
          withdrawInfo: [
            {
              studentId,
              withdrawRemarks: remark,
            },
          ],
        },
      })
        .then(({ data }) => {
          if (data?.withdrawStudents) {
            refetch();
            onClose();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Remark modal"
      modalClassName="p-10"
    >
      <CancelIcon
        className="cursor-pointer text-secondary-text ml-auto"
        onClick={onClose}
      />

      <Form
        id={"withdraw-remark-form"}
        onSubmit={submitHandler}
        control={control}
        className="space-y-6 min-w-80 md:min-w-[524px]"
      >
        <h2 className="text-xl font-sunbird font-normal text-center my-4">
          Confirm Withdraw?
        </h2>
        <TextArea control={control} name="remark" label="Remarks" />
        <div className="flex justify-center gap-2.5">
          <Button
            onPress={onClose}
            isDisabled={loading}
            variant="outlined"
            className={"w-min shadow-none"}
          >
            CANCEL
          </Button>
          <Button loading={loading} type={"submit"} className={"w-min"}>
            {"CONFIRM"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default WithdrawWithRemark;
