import { FC } from "react";
import { Button } from "react-aria-components";

import { Modal } from "components/Modal";

import { combineClassName } from "global/helpers";
import CloseIcon from "global/assets/images/close-filled.svg?react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  value: { page: "remarks"; remarks: string | null | undefined };
}

const RemarksModal: FC<Props> = ({ isOpen, onClose, value }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Edit price or point"
      className={combineClassName("space-y-4")}
      modalClassName={combineClassName(
        "py-10 px-[92px] transition-all min-w-[300px] sm:min-w-[600px]"
      )}
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
      <h1 className="flex justify-center text-primary-text text-xl font-sunbird">
        Remarks
      </h1>
      <p className="text-primary-text text-base">{value?.remarks}</p>
    </Modal>
  );
};

export default RemarksModal;
