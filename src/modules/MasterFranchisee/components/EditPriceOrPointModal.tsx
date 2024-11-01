import { FC, Fragment, useState } from "react";
import { Button } from "react-aria-components";
import { Form, FormSubmitHandler } from "react-hook-form";

import { ConfirmModal, Modal } from "components/Modal";
import { Combobox, InputField, TextArea } from "components/Form";
import { Button as _Button } from "components/Buttons";

import { combineClassName, notEmpty } from "global/helpers";
import CloseIcon from "global/assets/images/close-filled.svg?react";
import { useAllowedResource, useFormWithZod } from "global/hook";

import {
  MasterFranchiseeEditPriceOrPointForm,
  MasterFranchiseeInformation,
  MasterFranchiseeProductFee,
  MasterFranchiseeTermFee,
  MasterFranchiseeWorkBookFee,
  masterFranchiseePriceOrPointFormSchema,
} from "modules/MasterFranchisee";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  value:
    | { page: "term-fee"; termFee: MasterFranchiseeTermFee }
    | { page: "work-book-fee"; workBookFee: MasterFranchiseeWorkBookFee }
    | { page: "product-fee"; productFee: MasterFranchiseeProductFee };
  onSubmit: (value: number, onClose: () => void) => void;
  loading: boolean;
  masterFranchiseeInformation: MasterFranchiseeInformation | null | undefined;
}

const EditPriceOrPointModal: FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  value,
  loading,
  masterFranchiseeInformation,
}) => {
  const { canUpdate } = useAllowedResource(
    value?.page === "term-fee"
      ? "MasterFranchiseeEducationalTerm"
      : value?.page === "work-book-fee"
      ? "MasterFranchiseeWorkBook"
      : value.page === "product-fee"
      ? "MasterFranchiseeProduct"
      : "",
    true
  );

  const countryOrCategory =
    value?.page === "term-fee"
      ? value?.termFee?.educationalTerm?.country?.id
        ? {
            id: value?.termFee?.educationalTerm?.country?.id,
            name: value?.termFee?.educationalTerm?.country?.name || "N/A",
          }
        : null
      : value?.page === "work-book-fee"
      ? value?.workBookFee?.workBookInformation?.country?.id
        ? {
            id: value?.workBookFee?.workBookInformation?.country?.id,
            name:
              value?.workBookFee?.workBookInformation?.country?.name || "N/A",
          }
        : null
      : value.page === "product-fee"
      ? value?.productFee?.product?.productCategory &&
        value?.productFee?.product?.productCategory?.length > 0
        ? value?.productFee?.product?.productCategory
            ?.map((category) => {
              if (category?.id) {
                return {
                  id: category?.id,
                  name: category?.name || "N/A",
                };
              } else {
                return null;
              }
            })
            ?.filter(notEmpty) || []
        : null
      : null;
  const name =
    value?.page === "term-fee"
      ? value?.termFee?.educationalTerm?.name ?? null
      : value?.page === "work-book-fee"
      ? value?.workBookFee?.workBookInformation?.name ?? null
      : value?.page === "product-fee"
      ? value?.productFee?.product?.name ?? null
      : null;
  const priceOrPoint =
    value?.page === "term-fee"
      ? value?.termFee?.price
      : value?.page === "work-book-fee"
      ? value?.workBookFee?.price
      : value?.page === "product-fee"
      ? value?.productFee?.price
      : null;
  const workbookInformation =
    value?.page === "term-fee"
      ? value?.termFee?.educationalTerm?.workbookInformation &&
        value?.termFee?.educationalTerm?.workbookInformation?.length > 0
        ? value?.termFee?.educationalTerm?.workbookInformation
            ?.map((workbook) =>
              workbook?.id
                ? {
                    id: workbook?.id,
                    name: workbook?.name || "N/A",
                    status: workbook?.status,
                  }
                : null
            )
            .filter(notEmpty)
        : (null as unknown as { id: number; name: string }[])
      : (null as unknown as { id: number; name: string }[]);

  const {
    control,
    formState: { isValid },
  } = useFormWithZod({
    schema: masterFranchiseePriceOrPointFormSchema,
    defaultValues: {
      countryOrCategory,
      name,
      priceOrPoint: priceOrPoint ?? (null as unknown as number),
      description:
        value?.page === "product-fee" && value?.productFee?.product?.description
          ? value?.productFee?.product?.description
          : null,
      workbookInformation,
    },
  });

  const [confirmModal, setConfirmModal] = useState(false);

  const conFirmModalCloseHandler = () => {
    setConfirmModal(false);
  };

  const submitHandler: FormSubmitHandler<
    MasterFranchiseeEditPriceOrPointForm
  > = ({ data: { priceOrPoint } }) => {
    onSubmit(priceOrPoint, () => {
      conFirmModalCloseHandler();
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Edit price or point"
      className={combineClassName("space-y-4")}
      modalClassName={combineClassName("p-6 md:p-8 transition-all")}
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
      <Form
        control={control}
        onSubmit={submitHandler}
        id={"price-or-point"}
        className="md:p-8"
      >
        <div className="space-y-6">
          {value?.page === "term-fee" || value?.page === "work-book-fee" ? (
            <p className="text-xs font-normal text-primary-text">
              {value?.page === "term-fee"
                ? "Terms Information"
                : "Workbook Information"}
            </p>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-12">
            <InputField
              disable
              control={control}
              name="name"
              label={
                value?.page === "term-fee"
                  ? "Term Name"
                  : value?.page === "work-book-fee"
                  ? "Workbook Name"
                  : value?.page === "product-fee"
                  ? "Product Name"
                  : ""
              }
            />
            <Combobox
              disabled
              control={control}
              name="countryOrCategory"
              label={value?.page === "product-fee" ? "Categories" : "Country"}
              options={countryOrCategory ? [countryOrCategory] : []}
              multiple={value?.page === "product-fee"}
            />
          </div>
          <div
            className={combineClassName(
              "grid grid-cols-1 gap-6 xl:gap-12",
              value?.page === "product-fee" ? "" : "md:grid-cols-2"
            )}
          >
            <InputField
              control={control}
              type="number"
              name="priceOrPoint"
              label={
                value?.page === "term-fee" || value?.page === "work-book-fee"
                  ? `Price ${
                      masterFranchiseeInformation?.currencyCountry?.currency
                        ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
                        : ""
                    }`
                  : "Points"
              }
            />
          </div>
          {value?.page === "product-fee" ? (
            <div className={"grid grid-cols-1 gap-6 xl:gap-12"}>
              <TextArea
                control={control}
                name="description"
                label={"Description/Information"}
                disable
                parentClassName={"border-dotted border-outline-border"}
              />
            </div>
          ) : null}
          {value?.page === "term-fee" && workbookInformation?.length > 0 && (
            <Fragment>
              <p className="font-normal text-xs">Additional Information</p>
              <div className="grid grid-cols-1 gap-6 lg:gap-12">
                <Combobox
                  control={control}
                  name="workbookInformation"
                  label="Workbook"
                  options={[]}
                  disabled
                  multiple
                />
              </div>
            </Fragment>
          )}
        </div>
        <div className="flex justify-end gap-2.5 mt-16">
          <_Button
            variant="outlined"
            className={"w-min shadow-none"}
            onPress={onClose}
          >
            CANCEL
          </_Button>
          <_Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              if (isValid) {
                setConfirmModal(true);
              }
            }}
            isDisabled={!canUpdate}
          >
            SAVE
          </_Button>
        </div>
        <ConfirmModal
          message={`Confirm Save?`}
          onClose={conFirmModalCloseHandler}
          button={{
            primary: {
              loading,
              type: "submit",
              form: "price-or-point",
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

export default EditPriceOrPointModal;
