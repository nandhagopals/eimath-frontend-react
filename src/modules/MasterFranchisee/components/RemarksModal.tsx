import { FC } from "react";
import { Button, Heading } from "react-aria-components";

import { Modal } from "components/Modal";

import { combineClassName } from "global/helpers";
import CloseIcon from "global/assets/images/close-filled.svg?react";

interface Props {
  remark: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const RemarksModal: FC<Props> = ({ isOpen, onClose, remark }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Remarks"
      className={combineClassName("min-w-80 space-y-4")}
      modalClassName={combineClassName("px-20 py-10")}
    >
      <div className="flex justify-end">
        <Button
          className={({ isHovered, isFocusVisible }) =>
            combineClassName(
              "size-6 text-action-active rounded-full outline-none w-min",
              isHovered || isFocusVisible ? "bg-action-hover" : ""
            )
          }
          onPress={onClose}
        >
          <CloseIcon />
        </Button>
      </div>
      <Heading className="font-sunbird text-xl font-normal text-primary-text text-center">
        Remarks
      </Heading>
      <p
        className={combineClassName("text-base font-roboto text-center w-full")}
      >
        {remark ? remark : "-"}
      </p>
    </Modal>
  );
};

export default RemarksModal;
