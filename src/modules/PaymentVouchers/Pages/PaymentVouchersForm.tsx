import { Fragment, useState } from "react";
import { Form, FormSubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { DateField, InputField, TextArea } from "components/Form";
import { Button } from "components/Buttons";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { dateTimeSubmitFormat, messageHelper } from "global/helpers";

import {
  CREATE_PAYMENT_VOUCHER,
  PaymentVoucherField,
  PaymentVoucherFieldArgs,
  PaymentVoucherForm,
  ShowPDF,
  paymentVoucherFormSchema,
  PDFShowing,
} from "modules/PaymentVouchers";

const fieldArgs: PaymentVoucherFieldArgs = {
  isAmountNeed: true,
  isDateNeed: true,
  isPayeeNeed: true,
  isDescriptionNeed: true,
  isRemarksNeed: true,
};

const PaymentVouchersForm = () => {
  const { canCreate } = useAllowedResource("PaymentVoucher", true);
  const navigate = useNavigate();

  const { paymentVoucherId } = useParams({
    from: "/private-layout/payment-vouchers/$paymentVoucherId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_PAYMENT_VOUCHER
  );

  const { control, clearErrors, reset } = useFormWithZod({
    schema: paymentVoucherFormSchema,
  });

  const cancelButton = (
    <Button
      className={
        "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
      }
      onPress={() => {
        clearErrors();
        reset();

        paymentVoucherId && Number.isNaN(+paymentVoucherId)
          ? navigate({
              to: "/payment-vouchers",
            })
          : setShowEditForm(false);
      }}
      isDisabled={createLoading}
    >
      CANCEL
    </Button>
  );

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const [pdfModal, setPDFModal] = useState<ShowPDF>({
    showPDF: false,
    paymentVoucherId: null,
  });

  const submitHandler: FormSubmitHandler<PaymentVoucherForm> = ({
    data: { amount, date, description, payee, remarks },
  }) => {
    const commonArgs = {
      amount,
      date:
        date && dateTimeSubmitFormat(date)
          ? dateTimeSubmitFormat(date, true)!
          : undefined!,
      description: description?.trim() ?? null,
      payee: payee?.name,
      remarks: remarks?.trim() || undefined,
    };

    createMutation({
      variables: {
        ...fieldArgs,
        ...commonArgs,
      },
    })
      .then(({ data }) => {
        if (data?.createPaymentVoucher?.id) {
          setPDFModal({
            showPDF: true,
            paymentVoucherId: data?.createPaymentVoucher?.id,
          });
        } else {
          toastNotification([
            {
              message: "Something went wrong.",
              messageType: "error",
            },
          ]);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <Form
      id={"payment-voucher-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          paymentVoucherId && !Number.isNaN(+paymentVoucherId)
            ? "Edit Payment Voucher"
            : "Create Payment Voucher"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Payment Vouchers",
            to: "/payment-vouchers",
          },
          {
            name:
              paymentVoucherId && !Number.isNaN(+paymentVoucherId)
                ? "Edit Payment Voucher"
                : "Create Payment Voucher",
            to: "/payment-vouchers/$paymentVoucherId",
            params: {
              paymentVoucherId: paymentVoucherId as unknown as undefined,
            },
          },
        ]}
      />
      <div className="rounded bg-primary-contrast p-4 md:p-8 shadow-card-outline mt-6 grid grid-cols-1 gap-6">
        <Fragment>
          <p className="font-normal text-xs">Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            <PaymentVoucherField
              control={control}
              name="payee"
              label="Payee"
              readOnly={
                (paymentVoucherId &&
                  !Number.isNaN(+paymentVoucherId) &&
                  !showEditForm) ||
                false
              }
              args={{
                filter: {
                  status: {
                    isExactly: "Confirmed",
                  },
                },
                isPayeeNeed: true,
              }}
              allowCustomValue
            />
            <InputField
              control={control}
              name="description"
              label="Item Description"
              readOnly={
                (paymentVoucherId &&
                  !Number.isNaN(+paymentVoucherId) &&
                  !showEditForm) ||
                false
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            <DateField
              control={control}
              name="date"
              label="Date & Time"
              readOnly={
                (paymentVoucherId &&
                  !Number.isNaN(+paymentVoucherId) &&
                  !showEditForm) ||
                false
              }
              type="date-time"
            />
            <InputField
              control={control}
              name="amount"
              label="Amount"
              readOnly={
                (paymentVoucherId &&
                  !Number.isNaN(+paymentVoucherId) &&
                  !showEditForm) ||
                false
              }
              type="number"
            />
          </div>
          <p className="font-normal text-xs">Additional Information</p>
          <TextArea
            name="remarks"
            control={control}
            label="Remarks"
            readOnly={
              (paymentVoucherId &&
                !Number.isNaN(+paymentVoucherId) &&
                !showEditForm) ||
              false
            }
          />
        </Fragment>
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && paymentVoucherId && !Number.isNaN(+paymentVoucherId)
            ? cancelButton
            : paymentVoucherId && Number.isNaN(+paymentVoucherId)
            ? cancelButton
            : null}

          <Button
            type="submit"
            className={"w-min"}
            onPress={editButtonHandler}
            isDisabled={!canCreate}
            loading={createLoading}
          >
            PROCEED
          </Button>
        </div>
      </div>
      {pdfModal?.paymentVoucherId && (
        <PDFShowing
          isOpen={pdfModal?.showPDF}
          setPDFModal={setPDFModal}
          pdfModal={pdfModal}
          modalFrom="Form"
        />
      )}
    </Form>
  );
};

export default PaymentVouchersForm;
