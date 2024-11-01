/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useNavigate } from "@tanstack/react-router";
import { Cell, Row } from "react-aria-components";
import { useWatch } from "react-hook-form";

import { Button } from "components/Buttons";
import TitleAndBreadcrumb from "components/TitleAndBreadcrumb/TitleAndBreadcrumb";
import { InputField, RadioGroup, Switch } from "components/Form";
import { ConfirmModal } from "components/Modal";
import { Body, Head, Table, TableAction } from "components/Table";

import AddIcon from "global/assets/images/add-filled.svg?react";
import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import {
  combineClassName,
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import { CommonStatus } from "global/types";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_FRANCHISEES,
  FilterFranchiseesArgs,
  FranchiseeFieldArgs,
  GENERATE_FRANCHISEE_CSV,
  UPDATE_FRANCHISEE,
  franchiseeFilterSchema,
} from "modules/Franchisee";
import { SEND_FORGOT_PASSWORD_MAIL } from "modules/Authentication";

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Owner Name", id: "name" },
  { name: "Master Franchisee", id: "masterFranchiseeInformation" },
  { name: "Franchisee Prefix", id: "prefix" },
  { name: "Country", id: "country" },
  { name: "Mobile Number", id: "mobileNumber", hideSort: true },
  { name: "Email", id: "email", hideSort: true },
];

const Franchisee = () => {
  const { canCreate, canDelete, canUpdate } = useAllowedResource(
    "FranchiseeInformation",
    true
  );
  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveFranchiseeInformation"
  );
  const canDownloadCSV = useAllowedResource("DownloadFranchiseeInformation");
  const { authUserDetails } = useAuth();
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const filteredCommonTableHeaders = commonTableHeaders
    ?.filter((tableHeader) =>
      authUserDetails?.type !== "User" &&
      tableHeader?.id === "masterFranchiseeInformation"
        ? null
        : tableHeader
    )
    ?.filter((tableHeader) => tableHeader);

  const fieldArgs: FranchiseeFieldArgs = {
    isFranchiseeCompanyUENNeed: true,
    isFranchiseeCountryNeed: true,
    isFranchiseeOwnerEmailNeed: true,
    isFranchiseeOwnerHomeAddressNeed: true,
    isFranchiseeOwnerIsdCodeNeed: true,
    isFranchiseeOwnerMobileNumberNeed: true,
    isFranchiseePrefixNeed: true,
    isFranchiseeStatusNeed: true,
    isFranchiseeMasterFranchiseeInformationNeed:
      authUserDetails?.type === "User",
    isFranchiseeOwnerNameNeed: true,
  };

  const { control, resetField } = useFormWithZod({
    schema: franchiseeFilterSchema,
    defaultValues: {
      search: "",
      filters: {
        status: "ACTIVE",
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

  const headers =
    watchStatus === "ACTIVE"
      ? [
          ...filteredCommonTableHeaders,
          { name: "Status", id: "status" },
          { name: "Action", id: "action", hideSort: true },
        ]
      : canArchiveAndUnarchive || canDelete
      ? [
          ...filteredCommonTableHeaders,
          { name: "Action", id: "action", hideSort: true },
        ]
      : filteredCommonTableHeaders;

  const status = watchStatus;

  const commonQueryArgs: FilterFranchiseesArgs = useMemo(
    () => ({
      ...fieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        status: {
          inArray: status === "ACTIVE" ? ["Active", "Inactive"] : ["Archived"],
        },
      },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "name"
                ? ("ownerName" as unknown as "name")
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
          }
        : undefined,
    }),
    [watchSortBy?.column, watchSortBy?.direction, status]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_FRANCHISEES,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_FRANCHISEE);

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_FRANCHISEE_CSV
  );

  const [resetPassword, { loading: resetPasswordLoading }] = useMutation(
    SEND_FORGOT_PASSWORD_MAIL
  );

  const [confirmModal, setConfirmModal] = useState<
    | { type: "Archive"; id: number }
    | { type: "Unarchive"; id: number }
    | { type: "Delete"; id: number }
    | { type: "Reset Password"; id: number }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const confirmHandler = () => {
    if (confirmModal?.id && confirmModal?.type) {
      if (confirmModal?.type === "Reset Password") {
        if (
          (data?.filterFranchisees?.edges?.filter(
            (franchisee) => franchisee?.node?.id === confirmModal?.id
          )?.[0]?.node?.ownerEmail?.length || 0) > 0
        ) {
          resetPassword({
            variables: {
              email: data?.filterFranchisees?.edges?.filter(
                (franchisee) => franchisee?.node?.id === confirmModal?.id
              )?.[0]?.node?.ownerEmail,
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
      } else {
        updateMutation({
          variables: {
            id: confirmModal?.id,
            status:
              confirmModal?.type === "Archive"
                ? "Archived"
                : confirmModal?.type === "Unarchive"
                ? "Active"
                : "Deleted",
            isFranchiseeStatusNeed: true,
          },
        })
          .then((res) => {
            if (res?.data?.updateFranchisee) {
              closeConfirmModal();

              if (data?.filterFranchisees?.edges?.length === 1) {
                resetField("search", {
                  defaultValue: "",
                });
                resetField("pageSize", {
                  defaultValue: defaultPageSize,
                });

                const queryArgs = commonQueryArgs;

                queryArgs.globalSearch = undefined;

                fetchMore({
                  variables: queryArgs,
                  updateQuery: (
                    _,
                    { fetchMoreResult: { filterFranchisees } }
                  ) => {
                    return {
                      filterFranchisees,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (data?.filterFranchisees?.pageInfo?.hasNextPage) {
                const deleteItemIndex =
                  data?.filterFranchisees?.edges?.findIndex(
                    (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                  );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterFranchisees &&
                      data.filterFranchisees?.edges &&
                      data.filterFranchisees?.edges[(deleteItemIndex || 0) - 1]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterFranchisees?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (
                    refetchRes?.data?.filterFranchisees?.edges?.length === 1
                  ) {
                    updateQuery(({ filterFranchisees }) => {
                      const olderRecord =
                        filterFranchisees?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterFranchisees: filterFranchisees
                          ? {
                              pageInfo: refetchRes?.data?.filterFranchisees
                                ?.pageInfo
                                ? {
                                    ...filterFranchisees?.pageInfo,
                                    endCursor:
                                      refetchRes?.data?.filterFranchisees
                                        ?.pageInfo?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data?.filterFranchisees
                                        ?.pageInfo?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data?.filterFranchisees
                                        ?.pageInfo?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterFranchisees?.edges &&
                                refetchRes?.data?.filterFranchisees?.edges
                                  ?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data?.filterFranchisees
                                        ?.edges || []),
                                    ]
                                  : [],
                              __typename: filterFranchisees?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterFranchisees }) => {
                  return {
                    filterFranchisees: filterFranchisees
                      ? {
                          pageInfo: filterFranchisees?.pageInfo
                            ? {
                                ...filterFranchisees?.pageInfo,
                                totalNumberOfItems: filterFranchisees?.pageInfo
                                  ?.totalNumberOfItems
                                  ? filterFranchisees?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterFranchisees?.edges &&
                            filterFranchisees?.edges?.length > 0
                              ? filterFranchisees?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterFranchisees?.__typename,
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
      }
    }
  };

  const rows =
    data?.filterFranchisees?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.ownerName,
      masterFranchiseeInformation:
        edge?.node?.masterFranchiseeInformation?.masterFranchiseeName,
      prefix: edge?.node?.prefix,
      country: edge?.node?.country?.code,
      mobileNumber: edge?.node?.ownerMobileNumber
        ? `${edge?.node?.ownerIsdCode ? edge?.node?.ownerIsdCode : ""} ${
            edge?.node?.ownerMobileNumber
          }`
        : "N/A",
      email: edge?.node?.ownerEmail,
      status: edge?.node?.status,
      action: "action" as const,
    })) || [];

  const onNext =() => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterFranchisees?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterFranchisees } }) => {
        return { filterFranchisees };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterFranchisees?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterFranchisees } }) => {
        return { filterFranchisees };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = 
    (page) => {
      const queryArgs = commonQueryArgs;
      queryArgs.globalSearch = watchSearch || undefined;
      queryArgs.pagination = {
        size: page,
      };

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterFranchisees } }) => {
          return {
            filterFranchisees,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    };

  const totalCount = data?.filterFranchisees?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterFranchisees?.pageInfo?.hasNextPage &&
    data?.filterFranchisees?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterFranchisees?.pageInfo?.hasPreviousPage &&
    data?.filterFranchisees?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterFranchisees } }) => {
          return {
            filterFranchisees,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const updateStatus = (itemId: number, status: CommonStatus) => {
    updateMutation({
      variables: {
        id: itemId,
        status: status,
        isFranchiseeStatusNeed: true,
      },
    })
      .then((res) => {
        if (res?.data?.updateFranchisee) {
          updateQuery(({ filterFranchisees }) => {
            return {
              filterFranchisees: filterFranchisees
                ? {
                    pageInfo: filterFranchisees?.pageInfo
                      ? {
                          ...filterFranchisees?.pageInfo,
                          totalNumberOfItems: filterFranchisees?.pageInfo
                            ?.totalNumberOfItems
                            ? filterFranchisees?.pageInfo?.totalNumberOfItems -
                              1
                            : 0,
                        }
                      : null,
                    edges:
                      filterFranchisees?.edges &&
                      filterFranchisees?.edges?.length > 0
                        ? filterFranchisees?.edges?.map((edge) => {
                            if (edge?.node?.id === itemId) {
                              return {
                                node: {
                                  id: itemId,
                                  ...edge?.node,
                                  status: res?.data?.updateFranchisee?.status,
                                },
                                cursor: edge?.cursor,
                              };
                            }
                            return edge;
                          }) || []
                        : [],
                    __typename: filterFranchisees?.__typename,
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

  const kebabMenuList =
    status === "ACTIVE"
      ? canArchiveAndUnarchive || canUpdate
        ? ([
            { id: "View/Edit" },
            { id: "Archive" },
            { id: "Reset Password" },
          ] as any)
        : canArchiveAndUnarchive
        ? [{ id: "View/Edit" }, { id: "Archive" }]
        : ([{ id: "View/Edit" }, { id: "Reset Password" }] as any)
      : canArchiveAndUnarchive && canDelete
      ? ([{ id: "Unarchive" }, { id: "Delete" }] as any)
      : canDelete
      ? ([{ id: "Delete" }] as any)
      : ([{ id: "Unarchive" }] as any);

  const kebabMenuAction = (value, item) => {
    if (watchStatus === "ACTIVE" && item?.id) {
      switch (value?.id) {
        case "View/Edit": {
          navigate({
            to: "/franchisee/$franchiseeId",
            params: {
              franchiseeId: item?.id,
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
    } else if (watchStatus === "ARCHIVED" && item?.id) {
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

  const generateCSVHandler = () => {
    generateCSV()
      .then(({ data }) => {
        if (
          data?.generateFranchiseeCSV !== null &&
          data?.generateFranchiseeCSV !== undefined &&
          data?.generateFranchiseeCSV?.length > 5
        ) {
          fileDownload(data?.generateFranchiseeCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <div className={"space-y-6 max-w-5xl"}>
      <div className="flex flex-wrap justify-between py-2 gap-2">
        <TitleAndBreadcrumb
          title="Franchisee Account"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            { name: "Franchisee Account", to: "/franchisee" },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/franchisee/$franchiseeId",
                params: {
                  franchiseeId: "new",
                },
              });
            }}
            className={
              "w-min whitespace-nowrap flex items-center gap-1.5 h-min px-4 "
            }
          >
            <AddIcon /> ADD FRANCHISEE
          </Button>
        )}
      </div>

      <RadioGroup
        control={control}
        name="filters.status"
        options={["ACTIVE", "ARCHIVED"]}
        variant="filled"
        className="flex justify-end"
        onChange={() => {
          resetField("search", { defaultValue: "" });
          resetField("sortBy", {
            defaultValue: { column: "id", direction: "descending" },
          });
        }}
      />

      <div className="flex flex-wrap justify-center items-center sm:justify-between gap-2">
        <InputField
          control={control}
          name="search"
          type="search"
          debounceOnChange={onSearchChange}
          variant="small"
          className="min-w-[220px] max-w-[220px]"
        />
        {canDownloadCSV && totalCount > 0 && (
          <Button
            variant="outlined"
            onPress={generateCSVHandler}
            className={
              "min-w-[220px] w-min h-min flex items-center justify-center  whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
            }
            loading={csvFileLoading}
            loadingColor="secondary"
          >
            <DownloadIcon />
            DOWNLOAD CSV
          </Button>
        )}
      </div>

      <Table
        name="Franchisee"
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
                <Cell
                  className={combineClassName(
                    "px-4 last:px-0",
                    item[column?.id] === "action" ? "" : "py-[15px]",
                    column?.id === "mobileNumber" ? "whitespace-nowrap" : ""
                  )}
                >
                  {item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : column?.id === "status" && item?.id ? (
                      <Switch
                        key={item.id}
                        control={control}
                        name={`status.${item?.id}` as unknown as any}
                        onChange={(status) => {
                          updateStatus(
                            item.id!,
                            status ? "Active" : "Inactive"
                          );
                        }}
                        defaultValue={
                          item[column?.id] === "Active" ? true : false
                        }
                        disable={!canUpdate}
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
              : confirmModal?.type === "Reset Password"
              ? "Send Password Link"
              : ""
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

export default Franchisee;
