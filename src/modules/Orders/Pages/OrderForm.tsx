import { Fragment, useEffect, useState } from "react";
import {
  Form,
  FormSubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";

import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";

import { toastNotification } from "global/cache";
import {
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";
import {
  CREATE_ORDER,
  FILTER_ORDERS,
  OrderFieldArgs,
  OrderForm as OrderFormType,
  UPDATE_ORDER,
  orderFormSchema,
  CreateOrderArgs,
} from "modules/Orders";
import OrderPDF from "modules/Orders/Pages/OrderPDF";
import MasterFranchiseeItemField from "modules/MasterFranchisee/components/MasterFranchiseeItemField";
import { MasterFranchiseeField } from "modules/MasterFranchisee";
import StudentField from "modules/Students/components/StudentField";
import { FILTER_FRANCHISEES, FranchiseeField } from "modules/Franchisee";

const fieldArgs: OrderFieldArgs = {
  isOrderRemarksNeed: true,
  isOrderStatusNeed: true,
  isOrderOrderItemsNeed: true,
  isOrderOrderingPartyNameNeed: true,
  isOrderOrderingPartyMFNeed: true,
  isOrderOrderingPartyFranchiseeNeed: true,
  isOrderOrderingPartyStudentNeed: true,
  isOrderSalesOrderFileURLNeed: true,
  isOrderOrderingPartyEmailNeed: true,
};

const OrderForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("Order", true);

  const { authUserDetails } = useAuth();

  const isAdmin = authUserDetails?.type === "User";

  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";

  const isFranchisee = authUserDetails?.type === "Franchisee";

  const navigate = useNavigate();

  const { orderId } = useParams({
    from: "/private-layout/orders/$orderId",
  });

  const { orderWith } = useSearch({
    from: "/private-layout/orders/$orderId",
  });

  useEffect(() => {
    if (isMasterFranchisee) {
      if (
        orderWith === null ||
        orderWith === undefined ||
        (orderWith !== "WITH FRANCHISEE" && orderWith !== "ORDER WITH HQ")
      ) {
        navigate({
          to: "/orders",
        });
      }
    }
  }, [orderWith]);

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchOrder, { loading, data }] = useLazyQuery(FILTER_ORDERS, {
    fetchPolicy: "cache-and-network",
  });

  const order = data?.filterOrders?.edges?.[0]?.node;

  const [createMutation, { loading: createLoading }] =
    useMutation(CREATE_ORDER);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_ORDER);

  const [
    fetchFranchisee,
    { loading: franchiseeLoading, data: filterFranchisees },
  ] = useLazyQuery(FILTER_FRANCHISEES);

  const masterFranchisee =
    filterFranchisees?.filterFranchisees?.edges?.[0]?.node
      ?.masterFranchiseeInformation;

  const {
    control,
    formState: { isValid, errors },
    clearErrors,
    reset,
    resetField,
  } = useFormWithZod({
    schema: orderFormSchema,
    defaultValues: async () => {
      const order =
        orderId && !Number.isNaN(+orderId)
          ? await fetchOrder({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +orderId,
                  },
                  mfScreen: isMasterFranchisee
                    ? orderWith === "ORDER WITH HQ"
                      ? "HQ"
                      : orderWith === "WITH FRANCHISEE"
                      ? "Franchisee"
                      : undefined
                    : undefined,
                },
              },
            })
              .then(({ data }) => {
                if (data?.filterOrders) {
                  return data?.filterOrders?.edges?.[0]?.node || null;
                } else {
                  toastNotification(somethingWentWrongMessage);
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return null;
              })
          : null;

      const masterFranchiseeInformation =
        isMasterFranchisee && orderWith === "ORDER WITH HQ"
          ? await fetchFranchisee({
              variables: {
                filter: {
                  id: {
                    number: authUserDetails?.id,
                  },
                },
                isFranchiseeMasterFranchiseeInformationNeed: true,
              },
            })
              .then(
                ({ data }) =>
                  data?.filterFranchisees?.edges?.[0]?.node
                    ?.masterFranchiseeInformation
              )
              .catch((err) => {
                toastNotification(messageHelper(err));

                return null;
              })
          : null;

      return {
        orderingParty: order?.orderingPartyName
          ? {
              id: order?.orderingPartyName,
              name: order?.orderingPartyName,
            }
          : isAdmin
          ? order?.orderingPartyMF?.id
            ? {
                id: order?.orderingPartyMF?.id,
                name: order?.orderingPartyMF?.masterFranchiseeName ?? "N/A",
              }
            : (null as unknown as { id: number; name: string })
          : isFranchisee
          ? order?.orderingPartyStudent?.id
            ? {
                id: order?.orderingPartyStudent?.id,
                name: order?.orderingPartyStudent?.name ?? "N/A",
              }
            : (null as unknown as { id: number; name: string })
          : isMasterFranchisee
          ? orderWith === "WITH FRANCHISEE"
            ? order?.orderingPartyFranchisee?.id
              ? {
                  id: order?.orderingPartyFranchisee?.id,
                  name: order?.orderingPartyFranchisee?.franchiseeName ?? "N/A",
                }
              : (null as unknown as { id: number; name: string })
            : orderWith === "ORDER WITH HQ"
            ? {
                id: authUserDetails?.id,
                name:
                  masterFranchiseeInformation?.masterFranchiseeName ?? "N/A",
              }
            : (null as unknown as { id: number; name: string })
          : (null as unknown as { id: number; name: string }),
        itemQuantityPrice:
          order?.orderItems && order?.orderItems?.length > 0
            ? order?.orderItems?.map((item) => {
                return {
                  id: item?.id,
                  item:
                    item?.item?.id ||
                    item?.itemName ||
                    item?.workbookInformation?.id ||
                    item?.educationalTerm?.id
                      ? {
                          id: item?.itemName
                            ? (item?.itemName as unknown as number)
                            : item?.item?.id
                            ? item?.item?.id
                            : item?.workbookInformation?.id
                            ? item?.workbookInformation?.id
                            : item?.educationalTerm?.id
                            ? item?.educationalTerm?.id
                            : (null as unknown as number),
                          name:
                            item?.itemName ??
                            item?.item?.name ??
                            item?.workbookInformation?.name ??
                            item?.educationalTerm?.name ??
                            "N/A",
                          type: item?.item?.id
                            ? ("product" as const)
                            : item?.workbookInformation?.id
                            ? ("workbook" as const)
                            : item?.educationalTerm?.id
                            ? ("educationalTerm" as const)
                            : null,
                        }
                      : (null as unknown as {
                          id: number;
                          name: string;
                          type: "product";
                        }),
                  quantity: item?.quantity ?? (null as unknown as number),
                  unitPrice: item?.unitPrice ?? (null as unknown as number),
                  recipientOrStudentName: item?.recipientName
                    ? { id: item?.recipientName, name: item?.recipientName }
                    : (null as unknown as { id: string; name: string }),
                };
              })
            : [
                {
                  item: null as unknown as any,
                  quantity: null as unknown as number,
                  unitPrice: null as unknown as number,
                  recipientOrStudentName: null,
                },
              ],
        remarks: order?.remarks ?? null,
        orderingPartyEmail: isFranchisee
          ? order?.orderingPartyEmail ?? null
          : null,
        isFranchisee,
      };
    },
  });

  const watchOrderingParty = useWatch({
    control,
    name: "orderingParty",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itemQuantityPrice",
  });

  const [showOrderPDF, setShowOrderPDF] = useState<{
    id: number;
    url: string | null | undefined;
  } | null>(null);

  const submitHandler: FormSubmitHandler<OrderFormType> = ({
    data: { orderingParty, remarks, itemQuantityPrice, orderingPartyEmail },
  }) => {
    const commonArgs: CreateOrderArgs = {
      orderingPartyName: isAdmin
        ? null
        : orderingParty?.id === null || typeof orderingParty?.id === "string"
        ? orderingParty?.name
        : order?.id
        ? null
        : undefined,
      orderedToMFId: isMasterFranchisee
        ? orderWith === "WITH FRANCHISEE"
          ? authUserDetails?.id
          : undefined
        : order?.id
        ? null
        : undefined,
      orderingPartyMFId: isMasterFranchisee
        ? orderWith === "ORDER WITH HQ"
          ? authUserDetails?.id
          : undefined
        : isFranchisee
        ? undefined
        : isAdmin && typeof orderingParty?.id === "number"
        ? orderingParty?.id
        : order?.id
        ? null
        : undefined,
      orderedToFranchiseeId: isFranchisee
        ? authUserDetails?.id
          ? authUserDetails?.id
          : order?.id
          ? null
          : undefined
        : undefined,
      isOrderedToHQ: isMasterFranchisee
        ? orderWith === "ORDER WITH HQ"
          ? true
          : undefined
        : isAdmin
        ? true
        : order?.id
        ? false
        : undefined,
      orderingPartyStudentId:
        isFranchisee && typeof orderingParty?.id === "number"
          ? orderingParty?.id
          : order?.id
          ? null
          : undefined,
      orderingPartyFranchiseeId:
        orderWith === "WITH FRANCHISEE" && isMasterFranchisee
          ? typeof orderingParty?.id === "number" && orderingParty?.id
            ? orderingParty?.id
            : order?.id
            ? null
            : undefined
          : undefined,
      orderItems: itemQuantityPrice
        ?.map((itemQuantityPrice) => {
          if (itemQuantityPrice?.item?.name) {
            return {
              id: itemQuantityPrice?.id ?? undefined,
              itemId:
                typeof itemQuantityPrice?.item?.id === "number" &&
                itemQuantityPrice?.item?.type === "product"
                  ? itemQuantityPrice?.item?.id
                  : undefined,
              itemName:
                typeof itemQuantityPrice?.item?.id === "string" ||
                itemQuantityPrice?.item?.id === null
                  ? itemQuantityPrice?.item?.name
                  : undefined,
              quantity: itemQuantityPrice?.quantity!,
              recipientName: itemQuantityPrice?.recipientOrStudentName?.name,
              unitPrice: itemQuantityPrice?.unitPrice!,
              workbookInformationId:
                typeof itemQuantityPrice?.item?.id === "number" &&
                itemQuantityPrice?.item?.type === "workbook"
                  ? itemQuantityPrice?.item?.id
                  : undefined,
              educationalTermId:
                typeof itemQuantityPrice?.item?.id === "number" &&
                itemQuantityPrice?.item?.type === "educationalTerm"
                  ? itemQuantityPrice?.item?.id
                  : undefined,
            };
          } else {
            return null;
          }
        })
        ?.filter(notEmpty),
      remarks: remarks?.trim(),
      orderingPartyEmail: isFranchisee ? orderingPartyEmail?.trim() : undefined,
    };

    if (order?.id) {
      updateMutation({
        variables: {
          id: order?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateOrder?.id) {
            setShowOrderPDF({
              id: data?.updateOrder?.id,
              url: data?.updateOrder?.salesOrderFileURL,
            });

            closeConfirmModal();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
          setShowConfirmModal(false);
        });
    } else {
      createMutation({
        variables: {
          ...fieldArgs,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createOrder?.id) {
            setShowOrderPDF({
              id: data?.createOrder?.id,
              url: data?.createOrder?.salesOrderFileURL,
            });

            closeConfirmModal();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
          setShowConfirmModal(false);
        });
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closeConfirmModal = () => {
    setShowEditForm(false);
    setShowConfirmModal(false);
  };

  const cancelButton = (
    <Button
      className={
        "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
      }
      onPress={() => {
        clearErrors();
        reset();

        orderId && Number.isNaN(+orderId)
          ? navigate({
              to: "/orders",
              search: isMasterFranchisee ? { orderWith } : true,
            })
          : setShowEditForm(false);
      }}
      isDisabled={createLoading || updateLoading}
    >
      CANCEL
    </Button>
  );

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const saveButtonHandler = () => {
    clearErrors();
    setShowConfirmModal(true);
  };

  const preLoading = usePreLoading(loading || franchiseeLoading);

  return (
    <Form
      id={"order-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          orderId && !Number.isNaN(+orderId) ? "Edit Order" : "Create Order"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Orders",
            to: "/orders",
            search: isMasterFranchisee
              ? {
                  orderWith,
                }
              : true,
          },
          {
            name:
              orderId && !Number.isNaN(+orderId)
                ? "Edit Order"
                : "Create Order",
            to: "/orders/$orderId",
            params: { orderId: orderId as unknown as undefined },
            search: true,
          },
        ]}
      />
      <div className="rounded bg-primary-contrast p-4 md:p-8 shadow-card-outline mt-6 grid grid-cols-1 gap-6">
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
              {isAdmin ||
              (isMasterFranchisee && orderWith === "ORDER WITH HQ") ? (
                <MasterFranchiseeField
                  control={control}
                  name="orderingParty"
                  label="Ordering Party"
                  readOnly={
                    isMasterFranchisee && orderWith === "ORDER WITH HQ"
                      ? true
                      : (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                        false
                  }
                />
              ) : isFranchisee ? (
                <StudentField
                  control={control}
                  name={"orderingParty"}
                  label="Ordering Party"
                  readOnly={
                    (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                    false
                  }
                  allowCustomValue
                />
              ) : isMasterFranchisee && orderWith === "WITH FRANCHISEE" ? (
                <FranchiseeField
                  control={control}
                  name={"orderingParty"}
                  label="Ordering Party"
                  readOnly={
                    (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                    false
                  }
                />
              ) : null}
            </Fragment>
          )}
        </div>

        {isFranchisee && typeof watchOrderingParty?.id === "string" ? (
          <InputField
            readOnly={
              (orderId && !Number.isNaN(+orderId) && !showEditForm) || false
            }
            control={control}
            name="orderingPartyEmail"
            label="Email"
          />
        ) : null}

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
              {fields?.length > 0 && (
                <div className="empty:hidden space-y-6">
                  {fields?.map((field, index) => {
                    return (
                      <div key={field.id} className={"flex flex-col gap-6"}>
                        {fields?.length > 1 && (
                          <p className="truncate w-full relative after:content-[''] after:-z-0 after:top-3 after:absolute after:w-full after:left-6 after:border-b after:border-primary-main">
                            {index + 1}.
                          </p>
                        )}
                        <div className="flex gap-10 items-center">
                          <MasterFranchiseeItemField
                            control={control}
                            name={`itemQuantityPrice.${index}.item`}
                            label="Items"
                            onChange={(product) => {
                              if (typeof product?.id === "number") {
                                resetField(
                                  `itemQuantityPrice.${index}.unitPrice`,
                                  {
                                    defaultValue:
                                      orderWith === "ORDER WITH HQ"
                                        ? product?.productPoints ??
                                          (null as unknown as number)
                                        : !isAdmin
                                        ? product?.price ??
                                          (null as unknown as number)
                                        : product?.productPoints ??
                                          (null as unknown as number),
                                  }
                                );
                              }
                            }}
                            readOnly={
                              isAdmin
                                ? watchOrderingParty?.id
                                  ? (orderId &&
                                      !Number.isNaN(+orderId) &&
                                      !showEditForm) ||
                                    false
                                  : true
                                : (orderId &&
                                    !Number.isNaN(+orderId) &&
                                    !showEditForm) ||
                                  false
                            }
                            isTermNeed={false}
                            args={
                              isMasterFranchisee
                                ? {
                                    filter: {
                                      id: {
                                        number:
                                          authUserDetails?.id ?? undefined,
                                      },
                                    },
                                  }
                                : isFranchisee
                                ? {
                                    filter: {
                                      id: {
                                        number:
                                          masterFranchisee?.id ?? undefined,
                                      },
                                    },
                                  }
                                : isAdmin
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
                                : undefined
                            }
                          />
                          <InputField
                            control={control}
                            name={`itemQuantityPrice.${index}.quantity`}
                            label="Quantities"
                            type={"number"}
                            readOnly={
                              (orderId &&
                                !Number.isNaN(+orderId) &&
                                !showEditForm) ||
                              false
                            }
                          />
                          <InputField
                            control={control}
                            name={`itemQuantityPrice.${index}.unitPrice`}
                            label="Price"
                            type={"number"}
                            readOnly={
                              (orderId &&
                                !Number.isNaN(+orderId) &&
                                !showEditForm) ||
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
                                  item: null as unknown as any,
                                  unitPrice: null as unknown as number,
                                  quantity: null as unknown as number,
                                  recipientOrStudentName:
                                    null as unknown as any,
                                });
                              }}
                              isDisabled={
                                orderId && typeof orderId === "number"
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
                                orderId && typeof orderId === "number"
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
                        {isFranchisee ? (
                          <StudentField
                            control={control}
                            name={`itemQuantityPrice.${index}.recipientOrStudentName`}
                            label="Recipient/Student Name"
                            readOnly={
                              (orderId &&
                                !Number.isNaN(+orderId) &&
                                !showEditForm) ||
                              false
                            }
                            allowCustomValue
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* {fields?.length > 1 && (
                <p className="truncate w-full relative after:content-[''] after:-z-0 after:top-3 after:absolute after:w-full after:left-6 after:border-b after:border-primary-main">
                  {fields?.length + 1}.
                </p>
              )} */}
              {/* <div className="flex gap-12">
                <MasterFranchiseeItemField
                  control={control}
                  name={"item"}
                  label="Items"
                  onChange={(product) => {
                    if (typeof product?.id === "number") {
                      resetField("unitPrice", {
                        defaultValue: isAdmin
                          ? product?.price ?? (null as unknown as number)
                          : product?.productPoints ??
                            (null as unknown as number),
                      });
                    }
                  }}
                  readOnly={
                    (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                    false
                  }
                />
                <InputField
                  control={control}
                  name="quantity"
                  label="Quantities"
                  type={"number"}
                  readOnly={
                    (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                    false
                  }
                />
                <InputField
                  control={control}
                  name="unitPrice"
                  label="Price"
                  type={"number"}
                  readOnly={
                    (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                    false
                  }
                />
                <Button
                  className={
                    "w-min whitespace-nowrap rounded-full flex items-center p-4 py-3 bg-action-hover border-none h-[50px] text-primary-text"
                  }
                  variant="outlined"
                  onPress={() => {
                    append({
                      item: watchItem!,
                      unitPrice: watchUnitPrice!,
                      quantity: watchQuantity!,
                      recipientOrStudentName: watchRecipientOrStudentName!,
                    });
                    resetField("item", { defaultValue: null });
                    resetField("quantity", { defaultValue: null });
                    resetField("unitPrice", { defaultValue: null });
                    resetField("recipientOrStudentName", {
                      defaultValue: null,
                    });
                  }}
                  isDisabled={
                    orderId && typeof orderId === "number"
                      ? showEditForm
                        ? createLoading ||
                          updateLoading ||
                          (watchItem && watchUnitPrice && watchQuantity
                            ? false
                            : true)
                        : true
                      : createLoading ||
                        updateLoading ||
                        (watchItem && watchUnitPrice && watchQuantity
                          ? false
                          : true)
                  }
                >
                  <AddIcon className="w-6 h-6" />
                  ADD
                </Button>
              </div>
              {isFranchisee ? (
                <StudentField
                  control={control}
                  name="recipientOrStudentName"
                  label="Recipient/Student Name"
                  readOnly={
                    (orderId && !Number.isNaN(+orderId) && !showEditForm) ||
                    false
                  }
                  allowCustomValue
                />
              ) : null} */}
              {errors?.itemQuantityPrice?.message ? (
                <p className="text-xs text-error-main">
                  {errors?.itemQuantityPrice?.message}
                </p>
              ) : null}
              {fields?.length > 1 && <hr className="border-primary-main" />}
            </div>
          )}
        </div>

        {preLoading ? (
          Array.from({ length: 1 })?.map((_, index) => (
            <div
              className="w-full min-h-[56px] rounded  border shimmer-animation"
              key={index}
            />
          ))
        ) : (
          <InputField
            name={"remarks"}
            control={control}
            label="Remarks"
            readOnly={
              (orderId && !Number.isNaN(+orderId) && !showEditForm) || false
            }
          />
        )}

        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && orderId && !Number.isNaN(+orderId)
            ? cancelButton
            : orderId && Number.isNaN(+orderId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              orderId && !Number.isNaN(+orderId)
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
              orderId && !Number.isNaN(+orderId) ? !canUpdate : !canCreate
            }
          >
            {orderId && !Number.isNaN(+orderId)
              ? showEditForm
                ? "PROCEED"
                : "EDIT"
              : "PROCEED"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          orderId && Number.isNaN(+orderId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "order-form",
          },
          secondary: {
            isDisabled: createLoading || updateLoading,
          },
        }}
        isOpen={showConfirmModal}
        loading={createLoading || updateLoading}
      />
      {showOrderPDF ? (
        <OrderPDF
          isOpen={!!showOrderPDF?.id}
          onClose={() => {
            setShowOrderPDF(null);
          }}
          pageType={{
            id: showOrderPDF?.id,
            type: "order-form",
            pdfType: "sales",
          }}
          isMasterFranchisee={isMasterFranchisee}
          isFranchisee={isFranchisee}
          watchOrderWith={orderWith}
          url={showOrderPDF?.url}
          commonQueryArgs={fieldArgs}
        />
      ) : null}
    </Form>
  );
};

export default OrderForm;
