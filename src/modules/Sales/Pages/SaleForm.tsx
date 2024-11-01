/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useState } from "react";
import {
  Form,
  FormSubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField, Switch } from "components/Form";

import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, somethingWentWrongMessage, uuid } from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";

import {
  saleFormSchema,
  SaleForm as ISaleForm,
  CREATE_INVOICE,
  GENERATE_RECEIPT_PDF,
} from "modules/Sales";
import {
  FILTER_INVOICES,
  InvoiceFieldArgs,
  UPDATE_INVOICE,
} from "modules/Students";
import ViewInvoiceOrReceipt from "modules/Sales/Pages/ViewInvoiceOrReceipt";
import MasterFranchiseeItemField from "modules/MasterFranchisee/components/MasterFranchiseeItemField";
import { MasterFranchiseeField } from "modules/MasterFranchisee";
import { FILTER_FRANCHISEES, FranchiseeField } from "modules/Franchisee";
import StudentField from "modules/Students/components/StudentField";
import ProductWorkbookTermField from "../components/ProductWorkbookTermField";

const fieldArgs: InvoiceFieldArgs = {
  isInvoiceInvoiceDiscountsNeed: true,
  isInvoiceInvoiceItemsNeed: true,
  isInvoicePaymentMethodNeed: true,
  isInvoiceRemarksNeed: true,
  isInvoiceHasDiscountNeed: true,
  isInvoiceInvoiceFileURLNeed: true,
  isInvoiceReceiptIdNeed: true,
  isInvoiceOrderingPartyNameNeed: true,
  isInvoiceOrderingPartyStudentNeed: true,
  isInvoiceOrderingPartyFranchiseeNeed: true,
  isInvoiceOrderingPartyMFNeed: true,
  isInvoiceOrderingPartyEmailNeed: true,
};

const SaleForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("Invoice", true);
  const navigate = useNavigate();
  const { saleId } = useParams({
    from: "/private-layout/sales/$saleId",
  });
  const { pageStatus } = useSearch({
    from: "/private-layout/sales/$saleId",
  });
  const { authUserDetails } = useAuth();
  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchisee = authUserDetails?.type === "Franchisee";

  const [fetchInvoice, { loading, data }] = useLazyQuery(FILTER_INVOICES, {
    fetchPolicy: "cache-and-network",
  });

  const isReceptForm =
    data?.filterInvoices?.edges?.[0]?.node?.receiptId !== null &&
    data?.filterInvoices?.edges?.[0]?.node?.receiptId !== undefined &&
    data?.filterInvoices?.edges?.[0]?.node?.receiptId?.length > 0;

  const [
    fetchFranchisee,
    { loading: franchiseeLoading, data: filterFranchisees },
  ] = useLazyQuery(FILTER_FRANCHISEES);

  const masterFranchisee =
    filterFranchisees?.filterFranchisees?.edges?.[0]?.node
      ?.masterFranchiseeInformation;

  const {
    control,
    clearErrors,
    formState: { isValid, errors },
    reset,
    resetField,
  } = useFormWithZod({
    schema: saleFormSchema,
    defaultValues: async () => {
      const sale =
        saleId && !Number.isNaN(+saleId)
          ? await fetchInvoice({
              variables: {
                filter: {
                  id: {
                    number: +saleId,
                  },
                  mfScreen: isMasterFranchisee ? "Franchisee" : undefined,
                },
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                return data?.filterInvoices?.edges?.[0]?.node;
              })
              .catch(() => {
                return null;
              })
          : null;

      if (isFranchisee) {
        await fetchFranchisee({
          variables: {
            filter: {
              id: {
                number: authUserDetails?.id,
              },
            },
            isFranchiseeMasterFranchiseeInformationNeed: true,
          },
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }

      return {
        orderingParty: sale?.orderingPartyName
          ? {
              id: `${sale?.orderingPartyName}-${uuid()}`,
              name: sale?.orderingPartyName ?? "N/A",
            }
          : sale?.orderingPartyStudent?.id
          ? {
              id: sale?.orderingPartyStudent?.id,
              name: sale?.orderingPartyStudent?.name ?? "N/A",
            }
          : sale?.orderingPartyFranchisee?.id
          ? {
              id: sale?.orderingPartyFranchisee?.id,
              name: sale?.orderingPartyFranchisee?.franchiseeName ?? "N/A",
            }
          : sale?.orderingPartyMF?.id
          ? {
              id: sale?.orderingPartyMF?.id,
              name: sale?.orderingPartyMF?.masterFranchiseeName ?? "N/A",
            }
          : (null as unknown as any),
        orderingPartyEmail: sale?.orderingPartyEmail,
        itemsQuantitiesPrices:
          sale?.invoiceItems &&
          sale?.invoiceItems?.length > 0 &&
          sale?.invoiceItems?.filter((item) => {
            return item?.item?.id ||
              item?.educationalTerm?.id ||
              item?.workbookInformation?.id
              ? true
              : false;
          })?.length > 0
            ? sale?.invoiceItems
                ?.filter((item) => {
                  return item?.item?.id ||
                    item?.educationalTerm?.id ||
                    item?.workbookInformation?.id
                    ? true
                    : false;
                })
                ?.map((item) => {
                  return {
                    item: item?.item?.id
                      ? {
                          id: item?.item?.id!,
                          name: item?.item?.name ?? "N/A",
                          price:
                            item?.item?.points ?? (null as unknown as number),
                          type: "product" as const,
                        }
                      : item?.educationalTerm?.id
                      ? {
                          id: item?.educationalTerm?.id!,
                          name: item?.educationalTerm?.name ?? "N/A",
                          price:
                            item?.educationalTerm?.price ??
                            (null as unknown as number),
                          type: "term" as const,
                        }
                      : item?.workbookInformation?.id
                      ? {
                          id: item?.workbookInformation?.id!,
                          name: item?.workbookInformation?.name ?? "N/A",
                          price:
                            item?.workbookInformation?.price ??
                            (null as unknown as number),
                          type: "workbook" as const,
                        }
                      : (null as unknown as {
                          id: number;
                          name: string;
                          type: "product";
                        }),
                    price: item?.unitPrice ?? (null as unknown as number),
                    quantity: item?.quantity ?? (null as unknown as number),
                  };
                })
            : ([
                {
                  item: null as unknown as {
                    id: number;
                    name: string;
                    type: "product";
                  },
                  price: null as unknown as number,
                  quantity: null as unknown as number,
                },
              ] as unknown as any),
        others:
          sale?.invoiceItems &&
          sale?.invoiceItems?.length > 0 &&
          sale?.invoiceItems?.filter((item) => {
            return item?.itemName;
          })?.length > 0
            ? true
            : false,
        otherItemsQuantitiesPrices:
          sale?.invoiceItems &&
          sale?.invoiceItems?.length > 0 &&
          sale?.invoiceItems?.filter((item) => {
            return item?.itemName;
          })?.length > 0
            ? sale?.invoiceItems
                ?.filter((item) => {
                  return item?.itemName;
                })
                ?.map((item) => {
                  return {
                    id: item?.id,
                    item: item?.itemName ?? (null as unknown as string),
                    price: item?.unitPrice ?? (null as unknown as number),
                    quantity: item?.quantity ?? (null as unknown as number),
                  };
                })
            : [],
        hasDiscount: sale?.hasDiscount ?? false,
        discountAmountDiscountDescription:
          sale?.invoiceDiscounts && sale?.invoiceDiscounts?.length > 0
            ? sale?.invoiceDiscounts?.map((discount) => {
                return {
                  id: discount?.id,
                  amount:
                    discount?.discountAmount ?? (null as unknown as number),
                  description: discount?.description ?? "N/A",
                };
              })
            : [],
        remarks: sale?.remarks ?? null,
      };
    },
  });

  const [watchOrderingParty, watchOthers, watchHasDiscount] = useWatch({
    control,
    name: ["orderingParty", "others", "hasDiscount"],
  });

  const [createMutation, { loading: createLoading }] =
    useMutation(CREATE_INVOICE);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_INVOICE);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closeConfirmModal = () => {
    setShowEditForm(false);
    setShowConfirmModal(false);
  };

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const cancelButton = (
    <Button
      className={
        "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
      }
      onPress={() => {
        clearErrors();
        reset();
        saleId && Number.isNaN(+saleId)
          ? navigate({
              to: "/sales",
              search: true as any,
            })
          : setShowEditForm(false);
      }}
      isDisabled={createLoading || updateLoading}
    >
      CANCEL
    </Button>
  );

  const saveButtonHandler = () => {
    clearErrors();
    setShowConfirmModal(true);
  };

  const [showInvoiceReceiptPDF, setShowInvoiceReceiptPDF] = useState<
    string | null
  >(null);
  const [pdfFileDetails, setPDFFileDetails] = useState<{
    fileType?: "INVOICE" | "RECEIPT";
    fileTypeId?: number;
  } | null>(null);

  const [generateReceiptPdf, { loading: generateReceiptPdfLoading }] =
    useLazyQuery(GENERATE_RECEIPT_PDF);

  const submitHandler: FormSubmitHandler<ISaleForm> = ({
    data: {
      orderingParty,
      orderingPartyEmail,
      itemsQuantitiesPrices,
      otherItemsQuantitiesPrices,
      others,
      remarks,
      hasDiscount,
      discountAmountDiscountDescription,
    },
  }) => {
    const commonItems = itemsQuantitiesPrices
      ?.map((item) => {
        return {
          id: item?.id ?? undefined,
          itemId:
            typeof item?.item !== "string" && item?.item?.type === "product"
              ? item?.item?.id
              : undefined,
          itemName: typeof item?.item === "string" ? item?.item : undefined,
          unitPrice: item?.price,
          quantity: item?.quantity,
          workbookInformationId:
            typeof item?.item !== "string" && item?.item?.type === "workbook"
              ? item?.item?.id
              : undefined,
          educationalTermId:
            typeof item?.item !== "string" && item?.item?.type === "term"
              ? item?.item?.id
              : undefined,
        };
      })
      ?.filter((item) => item.quantity);
    const commonArgs = {
      hasDiscount,
      orderingPartyName:
        typeof saleId === "number"
          ? undefined
          : typeof orderingParty?.id === "string"
          ? orderingParty?.name
          : undefined,
      orderingPartyStudentId:
        typeof saleId === "number"
          ? undefined
          : typeof orderingParty?.id !== "string" && isFranchisee
          ? orderingParty?.id
          : undefined,
      orderingPartyFranchiseeId:
        typeof saleId === "number"
          ? undefined
          : typeof orderingParty?.id !== "string" && isMasterFranchisee
          ? orderingParty?.id
          : undefined,
      orderingPartyMFId:
        typeof saleId === "number"
          ? undefined
          : typeof orderingParty?.id !== "string" && isAdmin
          ? orderingParty?.id
          : undefined,
      orderingPartyEmail:
        typeof saleId === "number"
          ? typeof orderingParty?.id === "string"
            ? orderingPartyEmail
            : null
          : typeof orderingParty?.id === "string"
          ? orderingPartyEmail
          : undefined,
      remarks,
      invoiceDiscounts: hasDiscount
        ? discountAmountDiscountDescription
            ?.map((discount) => {
              return {
                id: discount?.id ?? undefined,
                description: discount?.description,
                discountAmount: discount?.amount,
              };
            })
            ?.filter((discount) => discount.description)
        : [],
      invoiceItems:
        others && otherItemsQuantitiesPrices?.length > 0
          ? [
              ...commonItems,
              ...otherItemsQuantitiesPrices?.map((item) => {
                return {
                  id: item?.id ?? undefined,
                  itemName: item?.item ?? undefined,
                  unitPrice: item?.price,
                  quantity: item?.quantity,
                };
              }),
            ]?.filter((item) => item.quantity)
          : commonItems ?? [],
    };

    if (typeof saleId === "number") {
      updateMutation({
        variables: {
          id: saleId,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateInvoice?.id) {
            closeConfirmModal();
            navigate({
              to: "/sales",
              search: true as any,
            });
            toastNotification([
              {
                message: "Sale update successfully",
                messageType: "success",
              },
            ]);
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else if (saleId === "new") {
      createMutation({
        variables: {
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          const invoiceId = data?.createInvoice?.id;
          if (data?.createInvoice?.id) {
            if (isReceptForm) {
              generateReceiptPdf({
                variables: {
                  invoiceId: data?.createInvoice?.id,
                },
              })
                .then(({ data }) => {
                  if (data?.generateReceiptPdf?.filePath) {
                    closeConfirmModal();
                    setShowInvoiceReceiptPDF(
                      data?.generateReceiptPdf?.filePath
                    );
                    setPDFFileDetails({
                      fileType: "RECEIPT",
                      fileTypeId: invoiceId || undefined,
                    });
                  } else {
                    toastNotification(somethingWentWrongMessage);
                  }
                })
                .catch((err) => {
                  toastNotification(err);
                });
            } else {
              fetchInvoice({
                variables: {
                  filter: {
                    id: {
                      number: data?.createInvoice?.id,
                    },
                    mfScreen: isMasterFranchisee ? "Franchisee" : undefined,
                  },
                  isInvoiceInvoiceFileURLNeed: true,
                },
              })
                .then(({ data: invoiceData }) => {
                  if (
                    invoiceData?.filterInvoices?.edges?.[0]?.node
                      ?.invoiceFileURL
                  ) {
                    navigate({
                      to: "/sales/$saleId/invoice",
                      params: {
                        saleId: data?.createInvoice?.id!,
                      },
                      search: { pageStatus },
                    });
                    closeConfirmModal();
                  } else {
                    toastNotification(somethingWentWrongMessage);
                  }
                })
                .catch((error) => {
                  toastNotification(messageHelper(error));
                });
            }
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemsQuantitiesPrices",
  });

  const {
    fields: otherItemQuantitiesPriceFields,
    append: otherItemQuantitiesPriceAppend,
    remove: otherItemQuantitiesPriceRemove,
  } = useFieldArray({
    control,
    name: "otherItemsQuantitiesPrices",
  });

  const {
    fields: discountAmountDiscountDescriptionFields,
    append: discountAmountDiscountDescriptionAppend,
    remove: discountAmountDiscountDescriptionRemove,
  } = useFieldArray({
    control,
    name: "discountAmountDiscountDescription",
  });

  const preLoading = usePreLoading(loading || franchiseeLoading);

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6">
      <TitleAndBreadcrumb
        title={
          pageStatus === "INVOICE/RECEIPT" && !isReceptForm
            ? saleId && !Number.isNaN(+saleId)
              ? "Edit Sales Invoice"
              : "Create Sales Invoice"
            : isReceptForm
            ? saleId && !Number.isNaN(+saleId)
              ? "Edit Receipt"
              : "Create Receipt"
            : ""
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Sales",
            to: "/sales",
          },
          {
            name:
              pageStatus === "INVOICE/RECEIPT" && !isReceptForm
                ? saleId && !Number.isNaN(+saleId)
                  ? "Edit Sales Invoice"
                  : "Create Sales Invoice"
                : isReceptForm
                ? saleId && !Number.isNaN(+saleId)
                  ? "Edit Receipt"
                  : "Create Receipt"
                : pageStatus === "INVOICE/RECEIPT" || pageStatus === "CANCELLED"
                ? saleId && !Number.isNaN(+saleId)
                  ? "Edit Sales"
                  : "Create Sales"
                : "",
            params: {
              saleId,
            },
            search: {
              pageStatus,
            },
            to: "/sales/$saleId",
          },
        ]}
      />
      <Form
        control={control}
        onSubmit={submitHandler}
        className="space-y-6 @container bg-white p-8 shadow-card-outline"
        id={"sale"}
      >
        <div className="grid grid-cols-1">
          {preLoading ? (
            Array.from({ length: 1 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              {isAdmin ? (
                <MasterFranchiseeField
                  control={control}
                  name="orderingParty"
                  label="Ordering Party"
                  readOnly={
                    (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
                  }
                  args={{
                    filter: {
                      status: {
                        inArray: ["Active"],
                      },
                    },
                  }}
                  allowCustomValue
                />
              ) : isMasterFranchisee ? (
                <FranchiseeField
                  control={control}
                  name="orderingParty"
                  label="Ordering Party"
                  readOnly={
                    (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
                  }
                  args={{
                    filter: {
                      status: {
                        inArray: ["Active"],
                      },
                    },
                  }}
                  allowCustomValue
                />
              ) : isFranchisee ? (
                <StudentField
                  control={control}
                  name="orderingParty"
                  label="Ordering Party"
                  readOnly={
                    (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
                  }
                  args={{
                    filter: {
                      status: {
                        inArray: ["Active"],
                      },
                    },
                  }}
                  allowCustomValue
                />
              ) : null}
            </Fragment>
          )}
        </div>
        {(typeof watchOrderingParty?.id === "string" ||
          (data?.filterInvoices?.edges?.at(0)?.node?.orderingPartyEmail?.trim()
            ?.length ?? 0) > 0) && (
          <div className="grid grid-cols-1">
            {preLoading ? (
              Array.from({ length: 1 })?.map((_, index) => (
                <div
                  className="w-full min-h-[56px] rounded  border shimmer-animation"
                  key={index}
                />
              ))
            ) : (
              <Fragment>
                <InputField
                  control={control}
                  name={"orderingPartyEmail"}
                  type="email"
                  label="Email"
                  readOnly={
                    (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
                  }
                />
              </Fragment>
            )}
          </div>
        )}

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
                      {isAdmin && typeof watchOrderingParty?.id === "string" ? (
                        <ProductWorkbookTermField
                          control={control}
                          name={`itemsQuantitiesPrices.${index}.item`}
                          label="Items"
                          onChange={(product) => {
                            resetField(`itemsQuantitiesPrices.${index}.price`, {
                              defaultValue:
                                product?.price ?? (null as unknown as number),
                            });
                          }}
                          readOnly={
                            (saleId &&
                              !Number.isNaN(+saleId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                      ) : (
                        <MasterFranchiseeItemField
                          control={control}
                          name={`itemsQuantitiesPrices.${index}.item`}
                          label="Items"
                          onChange={(product) => {
                            resetField(`itemsQuantitiesPrices.${index}.price`, {
                              defaultValue:
                                product?.price ?? (null as unknown as number),
                            });
                          }}
                          readOnly={
                            isAdmin
                              ? typeof watchOrderingParty?.id === "number"
                                ? (saleId &&
                                    !Number.isNaN(+saleId) &&
                                    !showEditForm) ||
                                  false
                                : true
                              : (saleId &&
                                  !Number.isNaN(+saleId) &&
                                  !showEditForm) ||
                                false
                          }
                          allowCustomValue={false}
                          args={
                            isAdmin
                              ? {
                                  filter: {
                                    id: {
                                      number:
                                        typeof watchOrderingParty?.id ===
                                        "number"
                                          ? watchOrderingParty?.id
                                          : undefined,
                                    },
                                  },
                                }
                              : isMasterFranchisee
                              ? {
                                  filter: {
                                    id: {
                                      number: authUserDetails?.id,
                                    },
                                  },
                                }
                              : isFranchisee
                              ? {
                                  filter: {
                                    id: {
                                      number: masterFranchisee?.id,
                                    },
                                  },
                                }
                              : undefined
                          }
                        />
                      )}
                      <InputField
                        control={control}
                        name={`itemsQuantitiesPrices.${index}.quantity`}
                        label="Quantities"
                        type={"number"}
                        readOnly={
                          (saleId && !Number.isNaN(+saleId) && !showEditForm) ||
                          false
                        }
                      />
                      <InputField
                        control={control}
                        name={`itemsQuantitiesPrices.${index}.price`}
                        label="Price"
                        type={"number"}
                        readOnly={
                          (saleId && !Number.isNaN(+saleId) && !showEditForm) ||
                          false
                        }
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
                          isDisabled={
                            saleId && typeof saleId === "number"
                              ? showEditForm
                                ? createLoading || updateLoading
                                : true
                              : createLoading || updateLoading
                          }
                        >
                          <AddIcon className="w-6 h-6" />
                          ADD
                        </Button>
                      ) : (
                        <Button
                          className={
                            "border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover"
                          }
                          variant="outlined"
                          onPress={() => {
                            remove(index);
                          }}
                          isDisabled={
                            saleId && typeof saleId === "number"
                              ? showEditForm
                                ? createLoading || updateLoading
                                : true
                              : createLoading || updateLoading
                          }
                        >
                          <DeleteIcon />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors?.itemsQuantitiesPrices?.message ? (
                <p className="text-xs text-error-main">
                  {errors?.itemsQuantitiesPrices?.message}
                </p>
              ) : null}
            </div>
          )}
        </div>
        <Switch
          control={control}
          name="others"
          className="w-min flex-row-reverse gap-3"
          label="Others?"
          readOnly={
            (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
          }
          onChange={(others) => {
            if (others) {
              otherItemQuantitiesPriceAppend({
                item: null as unknown as string,
                price: null as unknown as number,
                quantity: null as unknown as number,
              });
            } else {
              if (otherItemQuantitiesPriceFields?.length > 0) {
                otherItemQuantitiesPriceFields?.forEach((_, index) => {
                  otherItemQuantitiesPriceRemove(index);
                });
              }
            }
          }}
        />
        {watchOthers ? (
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
                  {otherItemQuantitiesPriceFields?.map((field, index) => {
                    return (
                      <div key={field.id} className="flex gap-10 items-center">
                        <InputField
                          control={control}
                          name={`otherItemsQuantitiesPrices.${index}.item`}
                          label="Item"
                          readOnly={
                            (saleId &&
                              !Number.isNaN(+saleId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                        <InputField
                          control={control}
                          name={`otherItemsQuantitiesPrices.${index}.quantity`}
                          label="Quantities"
                          type={"number"}
                          readOnly={
                            (saleId &&
                              !Number.isNaN(+saleId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                        <InputField
                          control={control}
                          name={`otherItemsQuantitiesPrices.${index}.price`}
                          label="Price"
                          type={"number"}
                          readOnly={
                            (saleId &&
                              !Number.isNaN(+saleId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                        {index ===
                        otherItemQuantitiesPriceFields?.length - 1 ? (
                          <Button
                            className={
                              "w-min whitespace-nowrap rounded-full flex items-center p-4 py-3 bg-action-hover border-none h-[50px] text-primary-text"
                            }
                            variant="outlined"
                            onPress={() => {
                              otherItemQuantitiesPriceAppend({
                                item: null as unknown as string,
                                price: null as unknown as number,
                                quantity: null as unknown as number,
                              });
                            }}
                            isDisabled={
                              saleId && typeof saleId === "number"
                                ? showEditForm
                                  ? createLoading || updateLoading
                                  : true
                                : createLoading || updateLoading
                            }
                          >
                            <AddIcon className="w-6 h-6" />
                            ADD
                          </Button>
                        ) : (
                          <Button
                            className={
                              "border-none shadow-none text-secondary-text w-10 h-10 flex justify-center items-center p-0 min-w-10 min-h-10 rounded-full hover:bg-action-hover focus-visible:bg-action-hover"
                            }
                            variant="outlined"
                            onPress={() => {
                              otherItemQuantitiesPriceRemove(index);
                            }}
                            isDisabled={
                              saleId && typeof saleId === "number"
                                ? showEditForm
                                  ? createLoading || updateLoading
                                  : true
                                : createLoading || updateLoading
                            }
                          >
                            <DeleteIcon />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors?.otherItemsQuantitiesPrices?.message ? (
                  <p className="text-xs text-error-main">
                    {errors?.otherItemsQuantitiesPrices?.message}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
        {preLoading ? (
          <div className="min-w-[130px] shimmer-animation min-h-[38px]" />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Switch
              control={control}
              name="hasDiscount"
              className="w-min flex-row-reverse gap-3"
              label="Discount?"
              readOnly={
                (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
              }
              onChange={(hasDiscountDetails) => {
                if (hasDiscountDetails) {
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
                            readOnly={
                              (saleId &&
                                !Number.isNaN(+saleId) &&
                                !showEditForm) ||
                              false
                            }
                          />
                          <InputField
                            type="number"
                            control={control}
                            name={`discountAmountDiscountDescription.${index}.amount`}
                            label="Discount Amount"
                            readOnly={
                              (saleId &&
                                !Number.isNaN(+saleId) &&
                                !showEditForm) ||
                              false
                            }
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
                            isDisabled={
                              saleId && typeof saleId === "number"
                                ? showEditForm
                                  ? createLoading || updateLoading
                                  : true
                                : createLoading || updateLoading
                            }
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
                            isDisabled={
                              saleId && typeof saleId === "number"
                                ? showEditForm
                                  ? createLoading || updateLoading
                                  : true
                                : createLoading || updateLoading
                            }
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

        <div className="grid grid-cols-1">
          {preLoading ? (
            Array.from({ length: 1 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                readOnly={
                  (saleId && !Number.isNaN(+saleId) && !showEditForm) || false
                }
              />
            </Fragment>
          )}
        </div>
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && saleId && !Number.isNaN(+saleId)
            ? cancelButton
            : saleId && Number.isNaN(+saleId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              saleId && !Number.isNaN(+saleId)
                ? showEditForm
                  ? isValid
                    ? saveButtonHandler()
                    : undefined
                  : editButtonHandler()
                : isValid
                ? saveButtonHandler()
                : undefined;
            }}
            isDisabled={
              saleId && !Number.isNaN(+saleId) ? !canUpdate : !canCreate
            }
          >
            {saleId && !Number.isNaN(+saleId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
        <ConfirmModal
          message={`Confirm ${
            saleId && Number.isNaN(+saleId) ? "Create" : "Save Edit"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading:
                createLoading || updateLoading || generateReceiptPdfLoading,
              type: "submit",
              form: "sale",
            },
            secondary: {
              isDisabled:
                createLoading || updateLoading || generateReceiptPdfLoading,
            },
          }}
          isOpen={showConfirmModal}
          loading={createLoading || updateLoading || generateReceiptPdfLoading}
        />
      </Form>
      {showInvoiceReceiptPDF ? (
        <ViewInvoiceOrReceipt
          isOpen={!!showInvoiceReceiptPDF}
          onClose={() => {
            setShowInvoiceReceiptPDF(null);
            setPDFFileDetails(null);
            navigate({
              to: "/sales",
              search: true as any,
            });
          }}
          url={showInvoiceReceiptPDF}
          fileType={pdfFileDetails?.fileType}
          fileTypeId={pdfFileDetails?.fileTypeId}
        />
      ) : null}
    </div>
  );
};

export default SaleForm;
