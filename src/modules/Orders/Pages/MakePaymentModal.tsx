import { FetchMoreFunction } from "@apollo/client/react/hooks/useSuspenseQuery";
import { FC, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UseNavigateResult } from "@tanstack/react-router";

import { ConfirmModal, Modal } from "components/Modal";
import { Button } from "components/Buttons";

import { toastNotification } from "global/cache";
import {
  combineClassName,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";

import { FILTER_MASTER_GENERAL_SETTING } from "modules/Settings/GeneralSetting";
import {
  CONFIRM_ORDERS,
  FilterOrdersArgs,
  FilterOrdersResponse,
} from "modules/Orders";
import { CREATE_MASTER_FRANCHISEE_POINTS_TRANSACTION } from "modules/PointsManagement";
// import { SetState } from "global/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  makePayment: {
    id: number;
    totalPrice: number | null | undefined;
    balanceAvailable: number | null | undefined;
    pricePerSGD: number | null | undefined;
    mfId: number | null | undefined;
  };
  navigate: UseNavigateResult<string>;
  reobserve: FetchMoreFunction<FilterOrdersResponse, FilterOrdersArgs>;
  queryArgs: FilterOrdersArgs;
  // setQueryLoading: SetState<boolean>;
}

const MakePaymentModal: FC<Props> = ({
  isOpen,
  onClose,
  makePayment,
  navigate,
  reobserve,
  queryArgs,
  // setQueryLoading,
}) => {
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const {
    loading: filterMasterGeneralSettingsLoading,
    data: filterMasterGeneralSettings,
  } = useQuery(FILTER_MASTER_GENERAL_SETTING, {
    fetchPolicy: "cache-and-network",
  });

  const totalPayable =
    (makePayment?.totalPrice ?? 0) /
    ((makePayment?.pricePerSGD ?? 1) *
      (filterMasterGeneralSettings?.filterMasterGeneralSettings?.edges?.[0]
        ?.node?.pricePerPoint ?? 1));

  const [confirmOrderMutation, { loading: confirmOrderLoading }] =
    useMutation(CONFIRM_ORDERS);

  const [createMutation, { loading: createPointsTransferLoading }] =
    useMutation(CREATE_MASTER_FRANCHISEE_POINTS_TRANSACTION);

  const confirmModalCloseHandler = () => {
    setConfirmModal(false);
  };

  const confirmHandler = () => {
    if (
      makePayment?.mfId &&
      typeof totalPayable === "number" &&
      !Number.isNaN(+totalPayable)
    ) {
      createMutation({
        variables: {
          type: "Deduct points transfer",
          points: +totalPayable?.toFixed(2),
          masterFranchiseeInformationId: makePayment?.mfId,
        },
      })
        .then(({ data }) => {
          if (data?.createMasterFranchiseePointsTransaction?.id) {
            confirmOrderMutation({
              variables: {
                orderIds: [makePayment?.id],
              },
            })
              .then((res) => {
                if (res?.data) {
                  reobserve({
                    variables: queryArgs,
                  }).catch((error) => {
                    toastNotification(messageHelper(error));
                  });
                  // fetchMore({
                  //   variables: queryArgs,
                  //   updateQuery: (_, { fetchMoreResult: { filterOrders } }) => {
                  //     // setQueryLoading(false);

                  //     return {
                  //       filterOrders,
                  //     };
                  //   },
                  // }).catch((error) => {
                  //   toastNotification(messageHelper(error));
                  // });
                  confirmModalCloseHandler();
                  onClose();
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
              });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  const isInsufficientPoint =
    makePayment?.balanceAvailable &&
    totalPayable &&
    makePayment?.balanceAvailable < totalPayable
      ? true
      : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!filterMasterGeneralSettingsLoading) {
          onClose();
        }
      }}
      name="Make Payments"
      className="p-6 sm:px-20 sm:py-10 space-y-4"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-sunbird text-center">Make Payment</h3>
        {isInsufficientPoint && (
          <p className="text-sm font-normal text-error-dark text-center">
            Insufficient Points. Please Top Up
          </p>
        )}
        <div>
          <p className="text-base text-primary-text">
            <span>Total Payable:</span>
            <span>
              {" "}
              {filterMasterGeneralSettingsLoading
                ? "Loading..."
                : totalPayable?.toFixed(2) ?? "N/A"}
            </span>
          </p>
          <p className="text-primary-main text-xs">(Points) Value</p>
        </div>
        <div>
          <p className="text-base text-primary-text">
            <span>Balance Point:</span>
            <span
              className={combineClassName(
                isInsufficientPoint ? "text-error-dark" : ""
              )}
            >
              {" "}
              {filterMasterGeneralSettingsLoading
                ? "Loading..."
                : makePayment?.balanceAvailable ?? "N/A"}
            </span>
          </p>
          <p
            className={combineClassName(
              "text-xs",
              isInsufficientPoint ? "text-error-dark" : "text-primary-main"
            )}
          >
            (Points) Value
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 min-w-80">
        <Button
          className="w-full shadow-none"
          variant="outlined"
          onPress={() => {
            if (!filterMasterGeneralSettingsLoading) {
              onClose();
            }
          }}
          isDisabled={filterMasterGeneralSettingsLoading}
        >
          CANCEL
        </Button>
        <Button
          className={combineClassName(
            "min-w-full whitespace-nowrap",
            isInsufficientPoint ? "bg-none bg-error-dark border-none" : ""
          )}
          onPress={() => {
            if (isInsufficientPoint) {
              navigate({
                to: "/points-management",
                search: {
                  navigateFrom: "order",
                },
              });
            } else {
              setConfirmModal(true);
            }
          }}
          isDisabled={filterMasterGeneralSettingsLoading}
        >
          {makePayment?.balanceAvailable &&
          totalPayable &&
          makePayment?.balanceAvailable < totalPayable
            ? "TOP UP NOW"
            : "PROCEED"}
        </Button>
      </div>

      <ConfirmModal
        message={"Confirm proceed?"}
        onClose={confirmModalCloseHandler}
        button={{
          primary: {
            loading: confirmOrderLoading || createPointsTransferLoading,
            onPress: confirmHandler,
          },
          secondary: {
            isDisabled: confirmOrderLoading || createPointsTransferLoading,
          },
        }}
        isOpen={confirmModal}
        loading={confirmOrderLoading || createPointsTransferLoading}
      />
    </Modal>
  );
};

export default MakePaymentModal;
