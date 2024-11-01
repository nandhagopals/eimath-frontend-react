import { FC, useEffect, useState } from "react";
import {
  Form,
  FormSubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Button } from "components/Buttons";
import { Combobox, InputField, Switch, TextArea } from "components/Form";

import { useFormWithZod, usePreLoading } from "global/hook";
import AddIcon from "global/assets/images/add-filled.svg?react";
import { toastNotification } from "global/cache";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";
import {
  combineClassName,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  FILTER_INVOICES,
  StudentRenewalForm as IStudentRenewalForm,
  Invoice,
  InvoiceFieldArgs,
  RENEW_STUDENTS,
  UPDATE_INVOICE,
  studentRenewalFormSchema,
} from "modules/Students";
import StudentRenewalInvoicePDF from "modules/Students/Pages/StudentRenewalInvoicePDF";
import MasterFranchiseeItemField from "modules/MasterFranchisee/components/MasterFranchiseeItemField";

const fieldArgs: InvoiceFieldArgs = {
  isInvoiceInvoiceDiscountsNeed: true,
  isInvoiceInvoiceItemsNeed: true,
  isInvoiceRemarksNeed: true,
  isInvoiceStudentNeed: true,
  isInvoiceInvoiceIdNeed: true,
  isInvoiceOrderingPartyNameNeed: true,
  isInvoiceHasDiscountNeed: true,
  isInvoiceInvoiceFileURLNeed: true,
};

interface Props {
  type: "popup" | "normal";
  onSubmit: (data: IStudentRenewalForm, invoiceId: number) => void;
  studentId?: number;
  submitLoading: boolean;
  invoiceDetails?: Invoice;
  masterFranchiseeId: number;
  formLoading: boolean;
  onClose?: () => void;
}

export const RenewalForm: FC<Props> = ({
  type,
  onSubmit,
  submitLoading,
  invoiceDetails,
  masterFranchiseeId,
  formLoading,
  onClose,
}) => {
  const navigate = useNavigate();

  const {
    control,
    formState: { errors },
    resetField,
  } = useFormWithZod({
    schema: studentRenewalFormSchema,
    defaultValues: async () => {
      return {
        receivingParty: invoiceDetails?.orderingPartyName
          ? invoiceDetails?.orderingPartyName
          : invoiceDetails?.student?.name
          ? invoiceDetails?.student?.name
          : (null as unknown as string),
        discountAmountDiscountDescription:
          invoiceDetails?.invoiceDiscounts &&
          invoiceDetails?.invoiceDiscounts?.length > 0
            ? invoiceDetails?.invoiceDiscounts?.map((discount) => {
                return {
                  id: discount?.id,
                  amount:
                    discount?.discountAmount ?? (null as unknown as number),
                  description: discount?.description ?? "N/A",
                };
              })
            : [],
        discountAmount: null as unknown as number,
        discountDescription: null as unknown as string,
        hasDiscount: invoiceDetails?.hasDiscount ?? false,
        itemQuantityPrice:
          invoiceDetails?.invoiceItems &&
          invoiceDetails?.invoiceItems?.length > 0 &&
          invoiceDetails?.invoiceItems?.filter(
            (invoiceItem) =>
              invoiceItem?.educationalTerm?.id !==
              invoiceDetails?.student?.nextEducationalTerm?.id
          )?.length > 0
            ? invoiceDetails?.invoiceItems
                ?.map((invoiceItem) => {
                  if (
                    invoiceItem?.educationalTerm?.id !==
                    invoiceDetails?.student?.nextEducationalTerm?.id
                  ) {
                    return {
                      item: invoiceItem?.itemName
                        ? {
                            id: invoiceItem?.itemName,
                            name: invoiceItem?.itemName,
                          }
                        : invoiceItem?.item?.id
                        ? {
                            id: invoiceItem?.item?.id!,
                            name: invoiceItem?.item?.name ?? "N/A",
                            price: invoiceItem?.price ?? null,
                            type: "product" as const,
                          }
                        : invoiceItem?.educationalTerm?.id !==
                          invoiceDetails?.student?.nextEducationalTerm?.id
                        ? {
                            id: invoiceItem?.educationalTerm?.id!,
                            name: invoiceItem?.educationalTerm?.name ?? "N/A",
                            price: invoiceItem?.price ?? null,
                            type: "term" as const,
                          }
                        : invoiceItem?.workbookInformation?.id
                        ? {
                            id: invoiceItem?.workbookInformation?.id!,
                            name:
                              invoiceItem?.workbookInformation?.name ?? "N/A",
                            price: invoiceItem?.price ?? null,
                            type: "workbook" as const,
                          }
                        : (null as unknown as {
                            id: number;
                            name: string;
                            type: "product";
                          }),
                      price:
                        invoiceItem?.educationalTerm?.id !==
                        invoiceDetails?.student?.nextEducationalTerm?.id
                          ? invoiceItem?.price ?? (null as unknown as number)
                          : (null as unknown as number),
                      quantity:
                        invoiceItem?.educationalTerm?.id !==
                        invoiceDetails?.student?.nextEducationalTerm?.id
                          ? invoiceItem?.quantity ?? (null as unknown as number)
                          : (null as unknown as number),
                    };
                  } else return null;
                })
                ?.filter(notEmpty)
            : [
                {
                  item: null as unknown as {
                    id: number;
                    name: string;
                    type: "product";
                  },
                },
              ],
        term: invoiceDetails?.student?.nextEducationalTerm?.id
          ? {
              id: invoiceDetails?.student?.nextEducationalTerm?.id,
              name: invoiceDetails?.student?.nextEducationalTerm?.name ?? "N/A",
            }
          : null,
        remarks: invoiceDetails?.remarks ?? null,
      };
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemQuantityPrice",
  });

  const {
    fields: discountAmountDiscountDescriptionFields,
    append: discountAmountDiscountDescriptionAppend,
    remove: discountAmountDiscountDescriptionRemove,
  } = useFieldArray({
    control,
    name: "discountAmountDiscountDescription",
  });

  const [watchHasDiscount, watchReceivingParty] = useWatch({
    control,
    name: ["hasDiscount", "receivingParty"],
  });

  const submitHandler: FormSubmitHandler<IStudentRenewalForm> = ({
    data: submitData,
  }) => {
    if (invoiceDetails?.id) {
      onSubmit(submitData, invoiceDetails?.id);
    } else {
      toastNotification([
        {
          message: "invoice is missing.",
          messageType: "error",
        },
      ]);
    }
  };

  const preLoading = usePreLoading(formLoading);

  return preLoading ? (
    <div
      className={combineClassName(
        "space-y-6 p-8 bg-white shadow-card-outline rounded max-w-[1000px] w-full"
      )}
    >
      <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
      <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
      <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
      <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
      <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
    </div>
  ) : (
    <Form
      control={control}
      onSubmit={submitHandler}
      className={combineClassName(
        type === "popup"
          ? "space-y-6 bg-white"
          : "shadow-card-outline rounded p-8 space-y-6 bg-white"
      )}
    >
      <div
        className={combineClassName(
          type === "popup"
            ? "shadow-card-outline p-8 rounded-md space-y-6"
            : "space-y-6"
        )}
      >
        <InputField
          control={control}
          name="receivingParty"
          label="Receiving Party"
          readOnly={watchReceivingParty ? true : false}
        />
        <Combobox
          control={control}
          name="term"
          label="Term"
          readOnly
          options={
            invoiceDetails?.student?.nextEducationalTerm?.id
              ? [
                  {
                    id: invoiceDetails?.student?.nextEducationalTerm?.id,
                    name:
                      invoiceDetails?.student?.nextEducationalTerm?.name ??
                      "N/A",
                  },
                ]
              : []
          }
          loading={preLoading}
        />
        <div className="grid grid-cols-1">
          {preLoading ? (
            Array.from({ length: 1 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <div className="space-y-6">
              <div className="empty:hidden space-y-6">
                {fields?.map((field, index) => {
                  return (
                    <div key={field.id} className="flex gap-10 items-center">
                      <MasterFranchiseeItemField
                        control={control}
                        name={`itemQuantityPrice.${index}.item`}
                        label="Items"
                        args={{
                          filter: {
                            id: {
                              number: masterFranchiseeId,
                            },
                          },
                        }}
                        readOnly={masterFranchiseeId ? false : true}
                        isTermNeed={false}
                        canClear
                        onChange={(value) => {
                          resetField(`itemQuantityPrice.${index}.price`, {
                            defaultValue:
                              typeof value !== "string" && value?.price
                                ? value?.price
                                : (null as unknown as number),
                          });
                        }}
                      />
                      <InputField
                        control={control}
                        name={`itemQuantityPrice.${index}.quantity`}
                        label="Quantities"
                        type={"number"}
                      />
                      <InputField
                        control={control}
                        name={`itemQuantityPrice.${index}.price`}
                        label="Price"
                        type={"number"}
                      />
                      {index === fields?.length - 1 ? (
                        <Button
                          className={
                            "w-min whitespace-nowrap rounded-full flex items-center p-4 py-3 bg-action-hover border-none h-[50px] text-primary-text"
                          }
                          variant="outlined"
                          onPress={() => {
                            append({
                              item: null as unknown as {
                                id: number;
                                name: string;
                                type: "product";
                              },
                              price: null as unknown as number,
                              quantity: null as unknown as number,
                            });
                          }}
                        >
                          <AddIcon className="w-6 h-6" />
                          ADD
                        </Button>
                      ) : (
                        <Button
                          className={
                            "bg-transparent border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover"
                          }
                          variant="outlined"
                          onPress={() => {
                            remove(index);
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors?.itemQuantityPrice?.message ? (
                <p className="text-xs text-error-main">
                  {errors?.itemQuantityPrice?.message}
                </p>
              ) : null}
            </div>
          )}
        </div>
        {formLoading ? (
          <div className="min-w-[130px] shimmer-animation min-h-[38px]" />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Switch
              control={control}
              name="hasDiscount"
              className="w-min flex-row-reverse gap-3"
              label="Discount?"
              onChange={(hasDiscount) => {
                if (hasDiscount) {
                  discountAmountDiscountDescriptionAppend({
                    amount: null as unknown as number,
                    description: null as unknown as string,
                  });
                } else {
                  if (discountAmountDiscountDescriptionFields?.length > 0) {
                    discountAmountDiscountDescriptionFields?.forEach(
                      (_, index) => {
                        discountAmountDiscountDescriptionRemove(index);
                      }
                    );
                  }
                }
              }}
            />
            {watchHasDiscount ? (
              <div className="space-y-6">
                {discountAmountDiscountDescriptionFields?.map(
                  (field, index) => {
                    return (
                      <div
                        key={field?.id}
                        className="flex gap-6 xl:gap-10 items-center w-full"
                      >
                        <div className="flex flex-col gap-6 md:flex-row xl:gap-10 items-center flex-1">
                          <InputField
                            control={control}
                            name={`discountAmountDiscountDescription.${index}.description`}
                            label="Description"
                          />
                          <InputField
                            type="number"
                            control={control}
                            name={`discountAmountDiscountDescription.${index}.amount`}
                            label="Discount Amount"
                          />
                        </div>
                        {index ===
                        discountAmountDiscountDescriptionFields?.length - 1 ? (
                          <Button
                            className={
                              "whitespace-nowrap rounded-full bg-action-hover border-none h-10 text-primary-text p-0 w-10 flex justify-center items-center"
                            }
                            variant="outlined"
                            onPress={() => {
                              discountAmountDiscountDescriptionAppend({
                                amount: null as unknown as number,
                                description: null as unknown as string,
                              });
                            }}
                          >
                            <AddIcon className="w-6 h-6" />
                          </Button>
                        ) : (
                          <Button
                            className={
                              "bg-transparent border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover"
                            }
                            variant="outlined"
                            onPress={() => {
                              discountAmountDiscountDescriptionRemove(index);
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        )}
                      </div>
                    );
                  }
                )}{" "}
              </div>
            ) : null}
            {errors?.discountAmountDiscountDescription?.message ? (
              <p className="text-xs text-error-main">
                {errors?.discountAmountDiscountDescription?.message}
              </p>
            ) : null}
          </div>
        )}
        <TextArea control={control} name="remarks" label="Remarks" />
      </div>

      <div className="flex justify-end gap-y-6 gap-2.5">
        <Button
          className={
            "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
          }
          isDisabled={submitLoading}
          onPress={() => {
            if (type === "normal") {
              navigate({
                to: "/students",
              });
            } else {
              onClose?.();
            }
          }}
        >
          {type === "normal" ? "BACK" : "CANCEL"}
        </Button>

        <Button type={"submit"} className={"w-min"} loading={submitLoading}>
          {type === "normal" ? "PROCEED" : "SAVE"}
        </Button>
      </div>
    </Form>
  );
};

const StudentRenewalForm = () => {
  const { studentId } = useParams({
    from: "/private-layout/students/$studentId/renewal/$renewalId",
  });

  const { loading: invoiceLoading, data: filterInvoices } = useQuery(
    FILTER_INVOICES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      variables: {
        filter: {
          studentId: {
            number: studentId,
          },
          category: {
            isExactly: "Renewal",
          },
          status: {
            isExactly: "Pending",
          },
        },
        ...fieldArgs,
        pagination: {
          size: 1,
        },
      },
    }
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_INVOICE,
    {
      fetchPolicy: "network-only",
    }
  );

  const [showRenewalPDF, setShowRenewalPDF] = useState<{
    url: string;
    invoiceId: number;
  } | null>(null);

  const invoiceCloseHandler = () => {
    setShowRenewalPDF(null);
  };

  const [
    renewStudent,
    { loading: renewStudentLoading, data: renewStudentDetailsData },
  ] = useMutation(RENEW_STUDENTS);

  useEffect(() => {
    setTimeout(() => {
      if (
        studentId &&
        !invoiceLoading &&
        filterInvoices?.filterInvoices?.edges?.[0]?.node?.id === null &&
        filterInvoices?.filterInvoices?.edges?.[0]?.node?.id === undefined
      ) {
        renewStudent({
          variables: {
            studentIds: [studentId],
            ...fieldArgs,
          },
        })
          .then(({ data }) => {
            if (data?.renewStudents && data?.renewStudents?.length > 0) {
              null;
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          })
          .catch((err) => toastNotification(messageHelper(err)));
      }
    }, 50);
  }, [invoiceLoading, filterInvoices?.filterInvoices?.edges?.[0]?.node?.id]);

  const preLoading = usePreLoading(renewStudentLoading || invoiceLoading);

  const fetchInvoiceDetails =
    renewStudentDetailsData?.renewStudents?.[0]?.invoice ??
    filterInvoices?.filterInvoices?.edges?.[0]?.node;

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6">
      <div className="py-2">
        <TitleAndBreadcrumb
          title={"Edit Renewal"}
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Student Account",
              to: "/students",
            },
            {
              name: "Edit Renewal",
              to: "/students/$studentId/renewal/$renewalId",
              params: true,
            },
          ]}
        />
      </div>
      {preLoading ? (
        <div className="space-y-6 p-8 bg-white shadow-card-outline rounded">
          <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
          <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
          <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
          <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
          <div className="min-w-[130px] shimmer-animation min-h-[56px]" />
        </div>
      ) : (
        <RenewalForm
          type="normal"
          onSubmit={(
            {
              hasDiscount,
              discountAmountDiscountDescription,
              remarks,
              itemQuantityPrice,
              term,
            },
            invoiceId
          ) => {
            const educationalTerm = fetchInvoiceDetails?.invoiceItems?.filter(
              (item) => item?.educationalTerm?.id === term?.id
            )?.[0];

            const items =
              itemQuantityPrice
                ?.map((item) => {
                  if (item?.quantity) {
                    return {
                      id: item?.id ?? undefined,
                      itemId:
                        typeof item?.item?.id === "number" &&
                        item?.item?.type === "product"
                          ? item?.item?.id
                          : undefined,
                      itemName:
                        typeof item?.item?.id === "string"
                          ? item?.item?.name
                          : undefined,
                      unitPrice: item?.price,
                      quantity: item?.quantity,
                      workbookInformationId:
                        typeof item?.item?.id === "number" &&
                        item?.item?.type === "workbook"
                          ? item?.item?.id
                          : undefined,
                      educationalTermId:
                        typeof item?.item?.id === "number" &&
                        item?.item?.type === "term"
                          ? item?.item?.id
                          : undefined,
                    };
                  } else {
                    return null;
                  }
                })
                ?.filter(notEmpty) ?? [];

            updateMutation({
              variables: {
                id: invoiceId,
                hasDiscount,
                invoiceDiscounts: hasDiscount
                  ? discountAmountDiscountDescription
                      ?.map((discount) => {
                        if (discount?.amount) {
                          return {
                            id: discount?.id ?? undefined,
                            description: discount?.description,
                            discountAmount: discount?.amount,
                          };
                        } else {
                          return null;
                        }
                      })
                      ?.filter(notEmpty)
                  : [],
                invoiceItems:
                  educationalTerm && educationalTerm?.id
                    ? [
                        ...items,
                        {
                          id: educationalTerm?.id,
                          educationalTermId:
                            educationalTerm?.educationalTerm?.id,
                          unitPrice: educationalTerm?.unitPrice,
                          quantity: educationalTerm?.quantity,
                        },
                      ]
                    : items,
                remarks,
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                if (
                  data?.updateInvoice?.id &&
                  data?.updateInvoice?.invoiceFileURL
                ) {
                  setShowRenewalPDF({
                    invoiceId: data?.updateInvoice?.id!,
                    url: data?.updateInvoice?.invoiceFileURL,
                  });
                } else {
                  toastNotification(somethingWentWrongMessage);
                }
              })
              .catch((err) => {
                toastNotification(messageHelper(err));
              });
          }}
          studentId={studentId}
          submitLoading={updateLoading}
          invoiceDetails={fetchInvoiceDetails || undefined}
          masterFranchiseeId={
            fetchInvoiceDetails?.student?.masterFranchiseeInformation?.id!
          }
          formLoading={preLoading}
        />
      )}

      {showRenewalPDF?.url ? (
        <StudentRenewalInvoicePDF
          isOpen={!!showRenewalPDF?.url}
          onClose={invoiceCloseHandler}
          url={showRenewalPDF?.url}
          invoiceId={showRenewalPDF?.invoiceId}
        />
      ) : null}
    </div>
  );
};

export default StudentRenewalForm;
