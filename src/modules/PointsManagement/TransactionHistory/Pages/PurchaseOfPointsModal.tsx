import { FC, Fragment, useEffect, useState } from "react";
import { ApolloQueryResult, useMutation, useQuery } from "@apollo/client";
import { Controller, Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { RadioGroup } from "@headlessui/react";

import { Modal } from "components/Modal";
import { InputField, Select } from "components/Form";
import { Button as _Button } from "components/Buttons";

import {
  combineClassName,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import { useAuth, useFormWithZod } from "global/hook";
import AddIcon from "global/assets/images/add-filled.svg?react";
import MinusIcon from "global/assets/images/remove-filled.svg?react";
import { toastNotification } from "global/cache";
import { CursorPaginationReturnType } from "global/types";

import {
  CREATE_MASTER_FRANCHISEE_POINTS_PURCHASE,
  DELETE_MASTER_FRANCHISEE_POINTS_PURCHASE,
  FilterMasterFranchiseePointsTransactionsArgs,
  GET_MF_POINT_PURCHASE_PAYMENT_METHOD,
  MAKE_ONLINE_PAYMENT,
  MasterFranchiseePointsTransaction,
  PurchaseOfPointsForm,
  UPDATE_MASTER_FRANCHISEE_POINTS_PURCHASE,
  purchaseOfPointsFormSchema,
} from "modules/PointsManagement";
import { FILTER_MASTER_GENERAL_SETTING } from "modules/Settings/GeneralSetting";
import { FILTER_MASTER_FRANCHISEE_INFORMATION } from "modules/MasterFranchisee";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  masterFranchiseeId: number | null | undefined;
  refetch: (
    variables?:
      | Partial<FilterMasterFranchiseePointsTransactionsArgs>
      | undefined
  ) => Promise<
    ApolloQueryResult<{
      filterMasterFranchiseePointsTransactions?:
        | CursorPaginationReturnType<MasterFranchiseePointsTransaction>
        | null
        | undefined;
    }>
  >;
}

const PurchaseOfPointsModal: FC<Props> = ({
  isOpen,
  onClose,
  masterFranchiseeId,
  refetch,
}) => {
  const {
    data: getMFPointsPurchasePaymentMethod,
    loading: getMFPointsPurchasePaymentMethodLoading,
  } = useQuery(GET_MF_POINT_PURCHASE_PAYMENT_METHOD, {
    fetchPolicy: "cache-and-network",
  });

  const paymentMethodOptions =
    getMFPointsPurchasePaymentMethod?.getMFPointsPurchasePaymentMethod ?? [];
  const [createMutation, { loading: createLoading, data }] = useMutation(
    CREATE_MASTER_FRANCHISEE_POINTS_PURCHASE
  );

  const [updateMutation, { loading: updateLoading, data: updateData }] =
    useMutation(UPDATE_MASTER_FRANCHISEE_POINTS_PURCHASE);

  const [deleteMutation, { loading: deleteLoading }] = useMutation(
    DELETE_MASTER_FRANCHISEE_POINTS_PURCHASE
  );

  const [makeOnlinePaymentMutation, { loading: makeOnlinePaymentLoading }] =
    useMutation(MAKE_ONLINE_PAYMENT);

  const { authUserDetails } = useAuth();
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";

  const {
    control,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useFormWithZod({
    schema: purchaseOfPointsFormSchema,
    defaultValues: {
      numberOfPoints: 10,
      pointsOptions: "10 POINTS",
      type: "Form",
      paymentMethod: "Offline payment",
    },
  });

  const { data: masterFranchiseeData } = useQuery(
    FILTER_MASTER_FRANCHISEE_INFORMATION,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: !isMasterFranchisee,
      variables: {
        isMasterFranchiseeInformationCurrencyNeed: true,
      },
    }
  );

  const currency = isMasterFranchisee
    ? masterFranchiseeData
      ? masterFranchiseeData?.filterMasterFranchiseeInformation?.edges?.[0]
          ?.node?.currency ?? null
      : null
    : null;

  const {
    loading: filterMasterGeneralSettingsLoading,
    data: filterMasterGeneralSettings,
  } = useQuery(FILTER_MASTER_GENERAL_SETTING, {
    fetchPolicy: "cache-and-network",
  });

  const generalSetting =
    filterMasterGeneralSettings?.filterMasterGeneralSettings?.edges?.[0]
      ?.node || null;

  const [watchPointsOptions, watchPoints] = useWatch({
    name: ["pointsOptions", "numberOfPoints"],
    control,
  });

  const chosenPoints =
    watchPointsOptions === "10 POINTS"
      ? 10
      : watchPointsOptions === "50 POINTS"
      ? 50
      : watchPointsOptions === "100 POINTS"
      ? 100
      : null;

  const [showPointsSummary, setShowPointsSummary] = useState(false);

  useEffect(() => {
    setValue("type", showPointsSummary ? "Summary" : "Form");
  }, [showPointsSummary, setValue]);

  const pointsValidationHandler = (value: number) => {
    if (value >= 10 && value % 10 !== 0) {
      setError("numberOfPoints", {
        type: "custom",
        message: "Only in multiples of 10",
      });
      setValue("numberOfPoints", Math.trunc(value / 10) * 10);
      errors?.numberOfPoints &&
        setTimeout(() => {
          clearErrors("numberOfPoints");
        }, 2000);
    }
  };

  const submitHandler: FormSubmitHandler<PurchaseOfPointsForm> = ({
    data: { numberOfPoints, paymentMethod },
  }) => {
    if (showPointsSummary) {
      if (data?.createMasterFranchiseePointsPurchase?.id && paymentMethod) {
        updateMutation({
          variables: {
            id: data?.createMasterFranchiseePointsPurchase?.id,
            paymentMethod,
          },
        })
          .then(({ data }) => {
            if (data?.updateMasterFranchiseePointsPurchase?.id) {
              if (
                data?.updateMasterFranchiseePointsPurchase?.paymentMethod ===
                "Credit card"
              ) {
                makeOnlinePaymentMutation({
                  variables: {
                    masterFranchiseePointsPurchaseId:
                      data?.updateMasterFranchiseePointsPurchase?.id,
                  },
                })
                  .then(({ data }) => {
                    if (
                      data?.makeOnlinePayment?.id &&
                      data?.makeOnlinePayment?.paymentURL
                    ) {
                      window.location.href =
                        data?.makeOnlinePayment?.paymentURL;
                    } else {
                      toastNotification(somethingWentWrongMessage);
                    }
                  })
                  .catch((err) => toastNotification(messageHelper(err)));
              } else {
                onClose();
                refetch();
              }
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          })
          .catch((err) => {
            toastNotification(messageHelper(err));
          });
      } else {
        toastNotification(somethingWentWrongMessage);
      }
    } else {
      if (masterFranchiseeId && typeof numberOfPoints === "number") {
        createMutation({
          variables: {
            masterFranchiseeInformationId: masterFranchiseeId,
            numberOfPoints,
          },
        })
          .then(({ data }) => {
            if (data?.createMasterFranchiseePointsPurchase?.id) {
              setShowPointsSummary(true);
            } else {
              toastNotification(somethingWentWrongMessage);
            }
          })
          .catch((err) => {
            toastNotification(messageHelper(err));
          });
      } else {
        toastNotification(somethingWentWrongMessage);
      }
    }
  };

  const deleteMutationHandler = () => {
    const id =
      data?.createMasterFranchiseePointsPurchase?.id ||
      updateData?.updateMasterFranchiseePointsPurchase?.id;
    if (id) {
      deleteMutation({
        variables: {
          id,
        },
      })
        .then(({ data }) => {
          if (data?.deleteMasterFranchiseePointsPurchase) {
            onClose();
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showPointsSummary) {
          deleteMutationHandler();
        } else {
          if (
            !deleteLoading &&
            !createLoading &&
            !updateLoading &&
            !makeOnlinePaymentLoading
          ) {
            onClose();
          }
        }
      }}
      name="Purchase of Points"
      className={combineClassName("space-y-4")}
      modalClassName={combineClassName("p-6 md:p-8 transition-all")}
    >
      <div className="flex flex-col gap-6 items-center">
        <p className="whitespace-nowrap text-primary-text text-xl">
          Purchase of Points
        </p>
        <Form control={control} onSubmit={submitHandler} id={"points-transfer"}>
          <div
            className={`flex flex-col gap-6 ${
              showPointsSummary ? "" : "items-center"
            } sm:w-[524px]`}
          >
            {showPointsSummary ? (
              <Fragment>
                <div className="space-y-2  px-12 ">
                  <p className="flex flex-col text-xl leading-[32px]">
                    <span className="font-sunbird">Total Points Purchase:</span>
                    <span className="text-primary-main">
                      {`${
                        data?.createMasterFranchiseePointsPurchase
                          ?.numberOfPoints ??
                        watchPoints ??
                        "N/A"
                      }`}{" "}
                      Points
                    </span>
                  </p>
                  <p className="flex flex-col text-xl leading-[32px]">
                    <span className="font-sunbird">Total Payable:</span>
                    <span className="text-primary-main">
                      {currency ?? ""}{" "}
                      {data?.createMasterFranchiseePointsPurchase?.totalPayable
                        ? data?.createMasterFranchiseePointsPurchase
                            ?.totalPayable
                        : watchPoints
                        ? `${
                            watchPoints *
                              (generalSetting?.pricePerPoint ?? 1) || "N/A"
                          }`
                        : "N/A"}
                    </span>
                  </p>
                  <Select
                    control={control}
                    name="paymentMethod"
                    options={paymentMethodOptions}
                    loading={getMFPointsPurchasePaymentMethodLoading}
                    label="Payment method"
                  />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="flex flex-col items-center">
                  <Controller
                    control={control}
                    name="pointsOptions"
                    render={({ field: { value, onChange } }) => {
                      return (
                        <RadioGroup
                          value={value}
                          onChange={onChange}
                          className={
                            "flex border rounded border-primary-main divide-x divide-primary-main"
                          }
                        >
                          {(
                            ["10 POINTS", "50 POINTS", "100 POINTS"] as const
                          ).map((saveAsOption, index) => {
                            return (
                              <RadioGroup.Option
                                key={index}
                                value={saveAsOption}
                                onClick={() => {
                                  setValue(
                                    "numberOfPoints",
                                    saveAsOption === "10 POINTS"
                                      ? 10
                                      : saveAsOption === "50 POINTS"
                                      ? 50
                                      : saveAsOption === "100 POINTS"
                                      ? 100
                                      : (null as unknown as number)
                                  );
                                }}
                                as="p"
                                className={({ checked, disabled }) =>
                                  combineClassName(
                                    "px-[22px] py-2  line-clamp-4 text-on-surface text-[15px] font-medium text-primary-main cursor-pointer outline-1 outline-irish-green outline-offset-4",
                                    checked ? "bg-[#FF5F001F]" : "",
                                    disabled
                                      ? "cursor-not-allowed bg-surface-disabled text-disabled"
                                      : "cursor-pointer"
                                  )
                                }
                              >
                                {saveAsOption}
                              </RadioGroup.Option>
                            );
                          })}
                        </RadioGroup>
                      );
                    }}
                  />
                  <p className="mt-1 text-xs text-secondary-text">
                    {currency ?? ""}{" "}
                    {filterMasterGeneralSettingsLoading
                      ? "Loading..."
                      : generalSetting?.pricePerPoint ?? 1}{" "}
                    is equal to 1 point. Only in multiple of 10 points.
                  </p>
                </div>
                <div className="flex gap-8 items-center">
                  <_Button
                    className={combineClassName(
                      "w-min px-2 rounded-full",
                      (watchPointsOptions === "10 POINTS" &&
                        (watchPoints ?? 1) > 10) ||
                        (watchPointsOptions === "50 POINTS" &&
                          (watchPoints ?? 1) > 50) ||
                        (watchPointsOptions === "100 POINTS" &&
                          (watchPoints ?? 1) > 100)
                        ? "bg-none bg-primary-main border-none text-white shadow-gradient-elevation"
                        : "bg-none bg-action-disabled text-black/[26%] border-none"
                    )}
                    onPress={() => {
                      chosenPoints &&
                        (+(watchPoints ?? 1) || +(watchPoints ?? 1) === 0) &&
                        ((watchPointsOptions === "10 POINTS" &&
                          (watchPoints ?? 1) > 10) ||
                          (watchPointsOptions === "50 POINTS" &&
                            (watchPoints ?? 1) > 50) ||
                          (watchPointsOptions === "100 POINTS" &&
                            (watchPoints ?? 1) > 100)) &&
                        setValue(
                          "numberOfPoints",
                          +(watchPoints ?? 1) - chosenPoints >= 0
                            ? +(watchPoints ?? 1) - 10
                            : 0
                        );
                    }}
                    isDisabled={
                      (watchPointsOptions === "10 POINTS" &&
                        (watchPoints ?? 1) > 10) ||
                      (watchPointsOptions === "50 POINTS" &&
                        (watchPoints ?? 1) > 50) ||
                      (watchPointsOptions === "100 POINTS" &&
                        (watchPoints ?? 1) > 100)
                        ? false
                        : true
                    }
                  >
                    <MinusIcon className="text-inherit" />
                  </_Button>
                  <InputField
                    type="number"
                    control={control}
                    name="numberOfPoints"
                    label="Number of Points"
                    className="max-w-[180px]"
                    onChange={(value) => {
                      pointsValidationHandler(value ?? 1);
                    }}
                  />
                  <_Button
                    className={
                      "w-min h-min px-2 rounded-full flex items-center whitespace-nowrap text-[14px] leading-6 bg-none bg-primary-main border-none shadow-gradient-elevation"
                    }
                    onPress={() => {
                      chosenPoints &&
                        (+(watchPoints ?? 1) || +(watchPoints ?? 1) === 0) &&
                        +(watchPoints ?? 1) >= 0 &&
                        setValue("numberOfPoints", +(watchPoints ?? 1) + 10);
                    }}
                  >
                    <AddIcon />
                  </_Button>
                </div>
              </Fragment>
            )}
            <div
              className={`flex w-full ${
                showPointsSummary ? "px-12" : "items-center"
              }  gap-4`}
            >
              <_Button
                variant="outlined"
                className={"w-full shadow-none"}
                onPress={() => {
                  setShowPointsSummary(false);
                  if (!showPointsSummary) {
                    if (
                      !deleteLoading &&
                      !updateLoading &&
                      !createLoading &&
                      !makeOnlinePaymentLoading
                    ) {
                      onClose();
                    }
                  }
                }}
                loading={deleteLoading}
              >
                CANCEL
              </_Button>
              <_Button
                type={"submit"}
                className={"w-full"}
                loading={
                  createLoading || updateLoading || makeOnlinePaymentLoading
                }
                isDisabled={deleteLoading}
              >
                PROCEED
              </_Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default PurchaseOfPointsModal;
