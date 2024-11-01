import { useState } from "react";
import {
  Button,
  Cell,
  Checkbox,
  Collection,
  Row,
  Selection,
} from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { formatDate } from "date-fns";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { CustomCheckbox, Select } from "components/Form";
import { Body, Head, Table, TableAction } from "components/Table";
import { ConfirmModal, Modal } from "components/Modal";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useFormWithZod,
  usePreLoading,
  useGetSearchParamOnFirstMount,
} from "global/hook";
import {
  combineClassName,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";
import DeleteIcon from "global/assets/images/close-filled.svg?react";

import {
  FILTER_NOTIFICATIONS,
  FilterNotificationsArgs,
  NotificationStatus,
  UPDATE_NOTIFICATION,
  notificationFilterSchema,
  DELETE_NOTIFICATION,
} from "modules/Notification";

const tableHeaders = [
  { name: "ID", id: "id", isRowHeader: true, showCheckbox: true },
  { name: "Notification", id: "notification" },
  { name: "Date/Time", id: "dateTime" },
  { name: "Actions", id: "action", hideSort: true },
];

const Notifications = () => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { cursor, pageSize, bunkAction } = useGetSearchParamOnFirstMount({
    from: "/private-layout/notifications",
  });

  const { control, resetField } = useFormWithZod({
    schema: notificationFilterSchema,
    defaultValues: {
      bunkAction,
      cursor,
      pageSize: pageSize ?? defaultPageSize,
    },
  });

  const commonQueryArgs: FilterNotificationsArgs = {
    pagination: { size: pageSize ?? defaultPageSize },
    filter: {
      isDeleted: false,
    },
  };

  const { data, loading, fetchMore } = useQuery(FILTER_NOTIFICATIONS, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_NOTIFICATION);

  const [deleteMutation, { loading: deleteLoading }] =
    useMutation(DELETE_NOTIFICATION);

  const [confirmDeleteOrReadNotification, setConfirmDeleteOrReadNotification] =
    useState<{
      id: number[];
      type: "single" | "multiple";
      modalType: "delete" | "read";
    } | null>(null);

  const closeConfirmDelete = () => {
    setConfirmDeleteOrReadNotification(null);
    resetField("bunkAction", { defaultValue: null });
  };

  const deleteNotification = (ids: number[], type: "single" | "multiple") => {
    deleteMutation({
      variables: {
        ids,
      },
    })
      .then((res) => {
        if (res?.data?.deleteNotification) {
          closeConfirmDelete();

          resetField("pageSize", {
            defaultValue: defaultPageSize,
          });

          if (type === "multiple") {
            resetField("bunkAction", { defaultValue: null });
            setSelectedKeys(new Set([]));
          }
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const readNotification = (ids: number[], type: "single" | "multiple") => {
    updateMutation({
      variables: {
        id: ids,
        isRead: true,
      },
    })
      .then((res) => {
        if (res?.data?.updateNotification) {
          closeConfirmDelete();

          resetField("pageSize", {
            defaultValue: defaultPageSize,
          });

          if (type === "multiple") {
            resetField("bunkAction", { defaultValue: null });
            setSelectedKeys(new Set([]));
          }
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const confirmHandler = () => {
    if (confirmDeleteOrReadNotification) {
      if (confirmDeleteOrReadNotification?.modalType === "delete") {
        deleteNotification(
          confirmDeleteOrReadNotification?.id,
          confirmDeleteOrReadNotification?.type
        );
      }

      if (confirmDeleteOrReadNotification?.modalType === "read") {
        readNotification(
          confirmDeleteOrReadNotification?.id,
          confirmDeleteOrReadNotification?.type
        );
      }
    }
  };

  const rows =
    data?.filterNotifications?.edges?.map((edge) => {
      const targetUserName =
        edge?.node?.targetUser?.name ??
        edge?.node?.targetMF?.masterFranchiseeName ??
        edge?.node?.targetFranchisee?.franchiseeName;
      return {
        id: edge?.node?.id,
        notification: edge?.node?.message
          ? `${edge?.node?.message} ${
              targetUserName ? `by ${targetUserName}` : ""
            }`
          : null,
        dateTime: edge?.node?.createdAt,
        isRead: edge?.node?.isRead,
        action: "action" as const,
      };
    }) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      after: data?.filterNotifications?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterNotifications } }) => {
        return { filterNotifications };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      before: data?.filterNotifications?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterNotifications } }) => {
        return { filterNotifications };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      size: page,
    };
    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterNotifications } }) => {
        return {
          filterNotifications,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterNotifications?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterNotifications?.pageInfo?.hasNextPage &&
    data?.filterNotifications?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterNotifications?.pageInfo?.hasPreviousPage &&
    data?.filterNotifications?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const [viewMessage, setViewMessage] = useState<string | null>(null);

  const viewMessageCloseHandler = () => {
    setViewMessage(null);
  };

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const onBunkActionFilter: (
    bunkAction: NotificationStatus | null | undefined
  ) => void = (bunkAction) => {
    if (bunkAction === "Delete") {
      if (selectedKeys === "all" || selectedKeys?.size > 0) {
        const [...keys] = selectedKeys;
        if (
          selectedKeys === "all" &&
          rows?.map((row) => row?.id ?? null)?.filter(notEmpty)?.length > 0
        ) {
          setConfirmDeleteOrReadNotification({
            id: rows?.map((row) => row?.id ?? null)?.filter(notEmpty),
            modalType: "delete",
            type: "multiple",
          });
        } else {
          setConfirmDeleteOrReadNotification({
            id: keys as unknown as number[],
            modalType: "delete",
            type: "multiple",
          });
        }
      } else {
        toastNotification([
          {
            message: "Select at least one notification.",
            messageType: "error",
          },
        ]);
        resetField("bunkAction", { defaultValue: null });
      }
    }
    if (bunkAction === "Read") {
      if (selectedKeys === "all" || selectedKeys?.size > 0) {
        const [...keys] = selectedKeys;
        if (
          selectedKeys === "all" &&
          rows?.map((row) => row?.id ?? null)?.filter(notEmpty)?.length > 0
        ) {
          setConfirmDeleteOrReadNotification({
            id: rows?.map((row) => row?.id ?? null)?.filter(notEmpty),
            modalType: "read",
            type: "multiple",
          });
        } else {
          setConfirmDeleteOrReadNotification({
            id: keys as unknown as number[],
            modalType: "read",
            type: "multiple",
          });
        }
      } else {
        toastNotification([
          {
            message: "Select at least one notification.",
            messageType: "error",
          },
        ]);
        resetField("bunkAction", { defaultValue: null });
      }
    }
  };

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <TitleAndBreadcrumb
        title="Notifications"
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Notifications",
            to: "/notifications",
          },
        ]}
      />

      <Select
        control={control}
        name={"bunkAction"}
        onChange={onBunkActionFilter}
        variant="small"
        className="min-w-[220px] w-min bg-background-default"
        label="Bulk Action"
        options={["Read", "Delete"]}
      />

      <Table
        name="Notifications"
        footer={{
          onNext,
          onPageSizeChange,
          onPrev,
          nextDisabled,
          prevDisabled,
          control,
          noOfItem: rows?.length ?? 0,
        }}
        totalCount={totalCount}
        loading={preLoading}
        className={"font-roboto rounded"}
        control={control}
        selectionBehavior="toggle"
        selectionMode="multiple"
        onSelectionChange={setSelectedKeys}
        selectedKeys={selectedKeys}
      >
        <Head headers={tableHeaders} />
        <Body
          headers={tableHeaders}
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={!!preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={tableHeaders}
              className={({ isSelected }) =>
                combineClassName(
                  "hover:bg-action-hover focus:outline-none",
                  isSelected ? "bg-primary-shade" : ""
                )
              }
            >
              <Collection items={tableHeaders}>
                {(column) => (
                  <Cell
                    className={combineClassName(
                      "px-4 last:px-0",
                      column?.id === "notification" && !item?.isRead
                        ? "text-primary-main underline decoration-primary-shade decoration-1"
                        : ""
                    )}
                  >
                    {item[column?.id] ? (
                      item[column?.id] === "action" ? (
                        <TableAction
                          type="kebab"
                          items={[{ id: "View" }, { id: "Delete" }] as const}
                          onAction={(action) => {
                            if (action?.id && item?.id) {
                              switch (action?.id) {
                                case "View": {
                                  if (item?.notification) {
                                    setViewMessage(item?.notification);
                                    if (item?.isRead === false && item?.id) {
                                      readNotification([item?.id], "single");
                                    }
                                  }
                                  break;
                                }

                                case "Delete": {
                                  setConfirmDeleteOrReadNotification({
                                    id: [item?.id],
                                    modalType: "delete",
                                    type: "single",
                                  });
                                  break;
                                }

                                default: {
                                  break;
                                }
                              }
                            }
                          }}
                        />
                      ) : column?.id === "id" ? (
                        <div className="flex gap-2 items-center">
                          <Checkbox slot={"selection"}>
                            {({
                              isIndeterminate,
                              isSelected,
                              isDisabled,
                              isReadOnly,
                            }) => {
                              return (
                                <CustomCheckbox
                                  isChecked={isSelected}
                                  isIndeterminate={isIndeterminate}
                                  disabled={isDisabled}
                                  readOnly={isReadOnly}
                                />
                              );
                            }}
                          </Checkbox>
                          <p>{item?.id}</p>
                        </div>
                      ) : column?.id === "dateTime" ? (
                        item?.dateTime &&
                        formatDate(
                          item?.dateTime,
                          "dd/MM/yyyy '|' HH:mm:ss a"
                        ) ? (
                          formatDate(item?.dateTime, "dd/MM/yyyy '|' HH:mm a")
                        ) : (
                          "-"
                        )
                      ) : (
                        item[column?.id]
                      )
                    ) : (
                      "N/A"
                    )}
                  </Cell>
                )}
              </Collection>
            </Row>
          )}
        </Body>
      </Table>

      <ConfirmModal
        message={
          confirmDeleteOrReadNotification?.modalType === "delete"
            ? "Confirm delete?"
            : confirmDeleteOrReadNotification?.modalType === "read"
            ? "Confirm Read?"
            : ""
        }
        onClose={closeConfirmDelete}
        button={{
          primary: {
            loading: updateLoading || deleteLoading,
            onPress: confirmHandler,
          },
          secondary: {
            isDisabled: updateLoading || deleteLoading,
          },
        }}
        isOpen={
          confirmDeleteOrReadNotification?.id &&
          confirmDeleteOrReadNotification?.id?.length > 0
            ? true
            : false
        }
        loading={updateLoading}
      />

      {viewMessage && viewMessage?.length > 0 ? (
        <Modal
          isOpen={true}
          onClose={viewMessageCloseHandler}
          name="View Notification"
          className="p-8 min-w-[320px]"
        >
          <div className="flex justify-end items-center">
            <Button
              className={"focus:outline-none text-action-active"}
              onPress={viewMessageCloseHandler}
            >
              <DeleteIcon />
            </Button>
          </div>
          <p className="text-xl lea8 font-sunbird text-primary-text text-center pt-2 pb-[18px]">
            Notification
          </p>
          <p className="text-sm font-normal text-primary-text text-center">
            {viewMessage ?? "-"}
          </p>
        </Modal>
      ) : null}
    </div>
  );
};

export default Notifications;
