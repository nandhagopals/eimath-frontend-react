/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useNavigate } from "@tanstack/react-router";
import { Cell, Row } from "react-aria-components";
import { useWatch } from "react-hook-form";

import { Button } from "components/Buttons";
import TagGroup from "components/Form/TagGroup/TagGroup";
import TitleAndBreadcrumb from "components/TitleAndBreadcrumb/TitleAndBreadcrumb";
import { InputField, Switch } from "components/Form";
import { ConfirmModal } from "components/Modal";
import { Body, Head, Table, TableAction } from "components/Table";

import AddIcon from "global/assets/images/add-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";
import { messageHelper, somethingWentWrongMessage } from "global/helpers";
import { CommonStatus } from "global/types";

import {
  FILTER_STAFFS,
  FilterStaffArgs,
  UPDATE_STAFF,
} from "modules/Accounts/StaffAccount";
import { SEND_FORGOT_PASSWORD_MAIL } from "modules/Authentication";

const fieldArgs = {
  isStaffIsdCodeNeed: true,
  isStaffMobileNumberNeed: true,
  isStaffEmailNeed: true,
  isStaffDobNeed: true,
  isStaffStatusNeed: true,
  isStaffGenderNeed: true,
  isStaffRoleNeed: true,
};

const staffAccountSortBySchema = z
  .object({
    column: z.union([
      z.literal("id"),
      z.literal("name"),
      z.literal("status"),
      z.literal("roles"),
    ]),
    direction: z.union([z.literal("ascending"), z.literal("descending")]),
  })
  .nullish();

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Role", id: "roles" },
  { name: "Mobile Number", id: "mobileNumber", hideSort: true },
  { name: "Email", id: "email", hideSort: true },
  { name: "Status", id: "status" },
  // { name: "Head", id: "Head", hideSort: true },
];

const StaffAccount = () => {
  const { canCreate, canDelete, canUpdate } = useAllowedResource("User", true);
  const canArchiveAndUnarchive = useAllowedResource("ArchiveAndUnarchiveUser");
  const navigate = useNavigate();

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: z.object({
      search: z.string().nullish(),
      pageSize: z.number().nullish(),
      status: z.record(z.number(), z.boolean()),
      filters: z.object({
        status: z.set(z.union([z.literal("ACTIVE"), z.literal("ARCHIVED")])),
        role: z
          .object({
            id: z.number(),
            name: z.string(),
          })
          .nullish(),
      }),
      sortBy: staffAccountSortBySchema,
    }),
    defaultValues: {
      search: "",
      filters: {
        status: new Set(["ACTIVE"]),
        role: null,
      },
      status: {},
      sortBy: { column: "id", direction: "descending" },
      pageSize: defaultPageSize,
    },
  });

  const [watchSearch, watchPageSize, watchStatus, watchSortBy] = useWatch({
    control,
    name: ["search", "pageSize", "filters.status", "sortBy"],
  });

  const status = watchStatus?.values()?.next()?.value;

  const headers =
    status === "ACTIVE"
      ? [
          ...commonTableHeaders
            .filter((header) =>
              !canUpdate && header?.id === "status" ? null : header
            )
            .filter((header) => header),
          { name: "Action", id: "action", hideSort: true },
        ]
      : canArchiveAndUnarchive || canDelete
      ? [
          ...commonTableHeaders
            .filter((header) => (header?.id === "status" ? null : header))
            .filter((header) => header),
          { name: "Action", id: "action", hideSort: true },
        ]
      : commonTableHeaders
          ?.filter((header) => (header?.id === "status" ? null : header))
          ?.filter((header) => header);

  const commonQueryParams: FilterStaffArgs = useMemo(
    () => ({
      ...fieldArgs,
      filter: {
        status: {
          inArray: status === "ACTIVE" ? ["Active", "Inactive"] : ["Archived"],
        },
      },
      sortBy: watchSortBy?.column
        ? {
            column: watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField: watchSortBy?.column === "roles" ? "name" : undefined,
          }
        : undefined,
    }),
    [watchSortBy?.column, watchSortBy?.direction, status]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(FILTER_STAFFS, {
    variables: {
      pagination: { size: watchPageSize },
      ...commonQueryParams,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [confirmModal, setConfirmModal] = useState<
    | { type: "Archive"; id: number }
    | { type: "Reset Password"; id: number }
    | { type: "Unarchive"; id: number }
    | { type: "Delete"; id: number }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const [updateStaff, { loading: updateLoading }] = useMutation(UPDATE_STAFF);

  const [resetPassword, { loading: resetPasswordLoading }] = useMutation(
    SEND_FORGOT_PASSWORD_MAIL
  );

  const confirmHandler = () => {
    if (confirmModal?.id) {
      if (
        confirmModal?.type === "Archive" ||
        confirmModal?.type === "Unarchive" ||
        confirmModal?.type === "Delete"
      ) {
        updateStaff({
          variables: {
            id: confirmModal?.id,
            status:
              confirmModal?.type === "Archive"
                ? "Archived"
                : confirmModal?.type === "Unarchive"
                ? "Active"
                : "Deleted",
            isStaffStatusNeed: true,
          },
        })
          .then((res) => {
            if (res?.data?.updateStaff) {
              closeConfirmModal();
              if (data?.filterStaffs?.edges?.length === 1) {
                resetField("search", {
                  defaultValue: "",
                });
                resetField("pageSize", {
                  defaultValue: defaultPageSize,
                });

                fetchMore({
                  variables: {
                    pagination: {
                      size: defaultPageSize,
                    },
                    ...commonQueryParams,
                  },
                  updateQuery: (_, { fetchMoreResult: { filterStaffs } }) => {
                    return {
                      filterStaffs,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (data?.filterStaffs?.pageInfo?.hasNextPage) {
                const deleteItemIndex = data?.filterStaffs?.edges?.findIndex(
                  (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterStaffs &&
                      data.filterStaffs?.edges &&
                      data.filterStaffs?.edges[(deleteItemIndex || 0) - 1]
                    : null;

                fetchMore({
                  variables: {
                    pagination: {
                      size: 1,
                      after:
                        nextPointCursorData?.cursor ||
                        data?.filterStaffs?.pageInfo?.endCursor,
                    },
                    ...commonQueryParams,
                  },
                }).then((refetchRes) => {
                  if (refetchRes?.data?.filterStaffs?.edges?.length === 1) {
                    updateQuery(({ filterStaffs }) => {
                      const olderRecord =
                        filterStaffs?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterStaffs: filterStaffs
                          ? {
                              pageInfo: refetchRes?.data?.filterStaffs?.pageInfo
                                ? {
                                    ...filterStaffs?.pageInfo,
                                    endCursor:
                                      refetchRes?.data?.filterStaffs?.pageInfo
                                        ?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data?.filterStaffs?.pageInfo
                                        ?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data?.filterStaffs?.pageInfo
                                        ?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterStaffs?.edges &&
                                refetchRes?.data?.filterStaffs?.edges?.length >
                                  0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data?.filterStaffs
                                        ?.edges || []),
                                    ]
                                  : [],
                              __typename: filterStaffs?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterStaffs }) => {
                  return {
                    filterStaffs: filterStaffs
                      ? {
                          pageInfo: filterStaffs?.pageInfo
                            ? {
                                ...filterStaffs?.pageInfo,
                                totalNumberOfItems: filterStaffs?.pageInfo
                                  ?.totalNumberOfItems
                                  ? filterStaffs?.pageInfo?.totalNumberOfItems -
                                    1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterStaffs?.edges &&
                            filterStaffs?.edges?.length > 0
                              ? filterStaffs?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterStaffs?.__typename,
                        }
                      : null,
                  };
                });
              }
            }
          })
          .catch((error) => {
            toastNotification(messageHelper(error));
          });
      } else if (confirmModal?.type === "Reset Password") {
        if (
          (data?.filterStaffs?.edges?.filter(
            (staff) => staff?.node?.id === confirmModal?.id
          )?.[0]?.node?.email?.length || 0) > 0
        ) {
          resetPassword({
            variables: {
              email: data?.filterStaffs?.edges?.filter(
                (staff) => staff?.node?.id === confirmModal?.id
              )?.[0]?.node?.email,
            },
          })
            .then(() => {
              closeConfirmModal();
              toastNotification([
                {
                  message: "Password reset link sent successfully.",
                  messageType: "success",
                },
              ]);
            })
            .catch((error) => toastNotification(messageHelper(error)));
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      }
    }
  };

  const updateStatus = (itemId: number, status: CommonStatus) => {
    updateStaff({
      variables: {
        id: itemId,
        status: status,
        isStaffStatusNeed: true,
      },
    })
      .then((res) => {
        if (res?.data?.updateStaff) {
          updateQuery(({ filterStaffs }) => {
            return {
              filterStaffs: filterStaffs
                ? {
                    pageInfo: filterStaffs?.pageInfo
                      ? {
                          ...filterStaffs?.pageInfo,
                          totalNumberOfItems: filterStaffs?.pageInfo
                            ?.totalNumberOfItems
                            ? filterStaffs?.pageInfo?.totalNumberOfItems - 1
                            : 0,
                        }
                      : null,
                    edges:
                      filterStaffs?.edges && filterStaffs?.edges?.length > 0
                        ? filterStaffs?.edges?.map((edge) => {
                            if (edge?.node?.id === itemId) {
                              return {
                                node: {
                                  id: itemId,
                                  ...edge?.node,
                                  status: res?.data?.updateStaff?.status,
                                },
                                cursor: edge?.cursor,
                              };
                            }
                            return edge;
                          }) || []
                        : [],
                    __typename: filterStaffs?.__typename,
                  }
                : null,
            };
          });
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const rows =
    data?.filterStaffs?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      roles: edge?.node?.roles?.[0]?.name,
      mobileNumber: edge?.node?.mobileNumber
        ? `${edge?.node?.isdCode ? edge?.node?.isdCode : ""} ${
            edge?.node?.mobileNumber
          }`
        : "N/A",
      email: edge?.node?.email,
      status: edge?.node?.status,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          after: data?.filterStaffs?.pageInfo?.endCursor,
        },
        globalSearch: watchSearch || undefined,
        ...commonQueryParams,
      },
      updateQuery: (_, { fetchMoreResult: { filterStaffs } }) => {
        return { filterStaffs };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  }

  const onPrev =() => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          before: data?.filterStaffs?.pageInfo?.startCursor,
        },
        globalSearch: watchSearch || undefined,
        ...commonQueryParams,
      },
      updateQuery: (_, { fetchMoreResult: { filterStaffs } }) => {
        return { filterStaffs };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  }

  const onPageSizeChange: (page: number) => void = (page) => {
    fetchMore({
      variables: {
        pagination: {
          size: page,
        },
        globalSearch: watchSearch || undefined,
        ...commonQueryParams,
      },
      updateQuery: (_, { fetchMoreResult: { filterStaffs } }) => {
        return {
          filterStaffs,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  }

  const totalCount = data?.filterStaffs?.pageInfo?.totalNumberOfItems ?? 0;

  const nextDisabled =
    data?.filterStaffs?.pageInfo?.hasNextPage &&
    data?.filterStaffs?.pageInfo?.endCursor
      ? true
      : false;

  const prevDisabled =
    data?.filterStaffs?.pageInfo?.hasPreviousPage &&
    data?.filterStaffs?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      fetchMore({
        variables: {
          pagination: {
            size: watchPageSize,
          },
          globalSearch: search || undefined,
          ...commonQueryParams,
        },
        updateQuery: (_, { fetchMoreResult: { filterStaffs } }) => {
          return {
            filterStaffs,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, [watchPageSize]);

  const kebabMenuList =
    status === "ACTIVE"
      ? canArchiveAndUnarchive && canUpdate
        ? [{ id: "View/Edit" }, { id: "Archive" }, { id: "Reset Password" }]
        : canArchiveAndUnarchive
        ? [{ id: "View/Edit" }, { id: "Archive" }]
        : canUpdate
        ? [{ id: "View/Edit" }, { id: "Reset Password" }]
        : [{ id: "View/Edit" }]
      : canArchiveAndUnarchive && canDelete
      ? [{ id: "Unarchive" }, { id: "Delete" }]
      : canDelete
      ? [{ id: "Delete" }]
      : canArchiveAndUnarchive
      ? [{ id: "Unarchive" }]
      : [];

  const kebabMenuAction = (value, item) => {
    if (watchStatus?.values()?.next()?.value === "ACTIVE" && item?.id) {
      switch (value?.id) {
        case "View/Edit": {
          navigate({
            to: "/accounts/staff-account/$staffAccountId",
            params: {
              staffAccountId: item?.id?.toString(),
            },
          });

          break;
        }

        case "Archive": {
          setConfirmModal({
            id: item?.id,
            type: "Archive",
          });

          break;
        }

        case "Reset Password": {
          setConfirmModal({
            id: item?.id,
            type: "Reset Password",
          });

          break;
        }

        default: {
          break;
        }
      }
    } else if (
      watchStatus?.values()?.next()?.value === "ARCHIVED" &&
      item?.id
    ) {
      switch (value?.id) {
        case "Unarchive": {
          setConfirmModal({
            type: "Unarchive",
            id: item?.id,
          });

          break;
        }

        case "Delete": {
          setConfirmModal({
            type: "Delete",
            id: item?.id,
          });

          break;
        }

        default: {
          break;
        }
      }
    }
  };

  return (
    <div className={"space-y-6 max-w-5xl"}>
      <div className="flex flex-wrap justify-between py-2 gap-2">
        <TitleAndBreadcrumb
          title="Staff Account"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            { name: "Accounts", to: "/accounts/staff-account" },
            { name: "Staff Account", to: "/accounts/staff-account" },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/accounts/staff-account/$staffAccountId",
                params: {
                  staffAccountId: "new",
                },
              });
            }}
            className={
              "w-min whitespace-nowrap flex items-center gap-1.5 h-min px-4 "
            }
          >
            <AddIcon /> ADD STAFF
          </Button>
        )}
      </div>

      <TagGroup
        control={control}
        name="filters.status"
        tags={[
          { id: "ACTIVE", name: "ACTIVE" },
          { id: "ARCHIVED", name: "ARCHIVED" },
        ]}
        variant="filled"
        className="flex justify-end"
        onChange={() => {
          resetField("search", { defaultValue: "" });
          resetField("sortBy", {
            defaultValue: { column: "id", direction: "descending" },
          });
        }}
      />

      <InputField
        control={control}
        name="search"
        type="search"
        debounceOnChange={onSearchChange}
        variant="small"
        placeholder=""
      />

      <Table
        name="Staffs"
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
      >
        <Head headers={headers} allowsSorting />
        <Body
          headers={headers}
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={headers}
              className={"hover:bg-action-hover focus:outline-none"}
            >
              {(column) => (
                <Cell className={"px-4 last:px-0 whitespace-nowrap"}>
                  {item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : column?.id === "status" ? (
                      <Switch
                        key={item.id}
                        control={control}
                        name={`status.${item?.id!}` as any}
                        onChange={(status) => {
                          updateStatus(
                            item?.id!,
                            status ? "Active" : "Inactive"
                          );
                        }}
                        defaultValue={
                          item[column?.id] === "Active" ? true : false
                        }
                        readOnly={!canUpdate}
                      />
                    ) : (
                      item[column?.id]
                    )
                  ) : (
                    "N/A"
                  )}
                </Cell>
              )}
            </Row>
          )}
        </Body>
      </Table>

      {confirmModal?.id && (
        <ConfirmModal
          message={`Confirm ${
            confirmModal?.type === "Archive"
              ? "Archive"
              : confirmModal?.type === "Unarchive"
              ? "Unarchive"
              : confirmModal?.type === "Delete"
              ? "Delete"
              : "Send Password Reset Link"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: updateLoading || resetPasswordLoading,
              onPress: confirmHandler,
            },
            secondary: {
              isDisabled: updateLoading || resetPasswordLoading,
            },
          }}
          isOpen={!!confirmModal?.id}
          loading={updateLoading || resetPasswordLoading}
        />
      )}
    </div>
  );
};

export default StaffAccount;
