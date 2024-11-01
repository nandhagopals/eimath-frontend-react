/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField, RadioGroup, Switch } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";
import {
  combineClassName,
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_MASTER_FRANCHISEE_INFORMATION,
  FilterMasterFranchiseeInformationArgs,
  UPDATE_MASTER_FRANCHISEE_INFORMATION,
  MasterFranchiseeInformationFieldArgs,
  masterFranchiseeFilterSchema,
  GENERATE_MASTER_FRANCHISEE_CSV,
} from "modules/MasterFranchisee";
import { SEND_FORGOT_PASSWORD_MAIL } from "modules/Authentication";

const queryFieldArgs: MasterFranchiseeInformationFieldArgs = {
  isMasterFranchiseeInformationBankAccountNumberNeed: true,
  isMasterFranchiseeInformationCompanyNameNeed: true,
  isMasterFranchiseeInformationCompanyUENNeed: true,
  isMasterFranchiseeInformationCurrencyCountryNeed: true,
  isMasterFranchiseeInformationCurrencyNeed: true,
  isMasterFranchiseeInformationEducationCategoryNeed: true,
  isMasterFranchiseeInformationInSingaporeNeed: true,
  isMasterFranchiseeInformationIsdCountryNeed: true,
  isMasterFranchiseeInformationOwnerEmailNeed: true,
  isMasterFranchiseeInformationOwnerIsdCodeNeed: true,
  isMasterFranchiseeInformationOwnerMobileNumberNeed: true,
  isMasterFranchiseeInformationOwnerNameNeed: true,
  isMasterFranchiseeInformationPrefixNeed: true,
  isMasterFranchiseeInformationRevenueRoyaltiesNeed: true,
  isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed: true,
  isMasterFranchiseeInformationStatusNeed: true,
};

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Owner Name", id: "ownerName" },
  { name: "Master Franchise Prefix", id: "prefix" },
  { name: "Mobile Number", id: "mobileNumber", hideSort: true },
  { name: "Email", id: "email", hideSort: true },
  // { name: "Head", id: "head" },
];

const MasterFranchisee = () => {
  const { canCreate, canDelete, canUpdate } = useAllowedResource(
    "MasterFranchiseeInformation",
    true
  );
  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveMasterFranchiseeInformation"
  );
  const canDownloadCSV = useAllowedResource(
    "DownloadMasterFranchiseeInformation"
  );
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: masterFranchiseeFilterSchema,
    defaultValues: {
      search: "",
      filters: {
        status: "ACTIVE",
      },
      sortBy: { column: "id", direction: "descending" },
      pageSize: defaultPageSize,
    },
  });

  const [watchSearch, watchPageSize, watchStatus, watchSortBy] = useWatch({
    control,
    name: ["search", "pageSize", "filters.status", "sortBy"],
  });

  const tableHeaders =
    watchStatus === "ACTIVE"
      ? [
          ...commonTableHeaders,
          { name: "Status", id: "status" },
          { name: "Actions", id: "action", hideSort: true },
        ]
      : canArchiveAndUnarchive || canDelete
      ? [
          ...commonTableHeaders,
          { name: "Actions", id: "action", hideSort: true },
        ]
      : commonTableHeaders;

  const status = watchStatus;

  const commonQueryArgs: FilterMasterFranchiseeInformationArgs = useMemo(
    () => ({
      ...queryFieldArgs,
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
              watchSortBy?.column === "ownerName"
                ? "status"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
          }
        : undefined,
    }),
    [status, watchSortBy?.column, watchSortBy?.direction]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_MASTER_FRANCHISEE_INFORMATION,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_FRANCHISEE_INFORMATION
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_MASTER_FRANCHISEE_CSV
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
    if (confirmModal?.id) {
      if (
        confirmModal?.type === "Archive" ||
        confirmModal?.type === "Unarchive" ||
        confirmModal?.type === "Delete"
      ) {
        updateMutation({
          variables: {
            id: confirmModal?.id,
            status:
              confirmModal?.type === "Archive"
                ? "Archived"
                : confirmModal?.type === "Unarchive"
                ? "Active"
                : "Deleted",
            isMasterFranchiseeInformationStatusNeed: true,
          },
        })
          .then((res) => {
            if (res?.data?.updateMasterFranchiseeInformation) {
              closeConfirmModal();

              if (
                data?.filterMasterFranchiseeInformation?.edges?.length === 1
              ) {
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
                    { fetchMoreResult: { filterMasterFranchiseeInformation } }
                  ) => {
                    return {
                      filterMasterFranchiseeInformation,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (
                data?.filterMasterFranchiseeInformation?.pageInfo?.hasNextPage
              ) {
                const deleteItemIndex =
                  data?.filterMasterFranchiseeInformation?.edges?.findIndex(
                    (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                  );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterMasterFranchiseeInformation &&
                      data.filterMasterFranchiseeInformation?.edges &&
                      data.filterMasterFranchiseeInformation?.edges[
                        (deleteItemIndex || 0) - 1
                      ]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterMasterFranchiseeInformation?.pageInfo
                      ?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (
                    refetchRes?.data?.filterMasterFranchiseeInformation?.edges
                      ?.length === 1
                  ) {
                    updateQuery(({ filterMasterFranchiseeInformation }) => {
                      const olderRecord =
                        filterMasterFranchiseeInformation?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterMasterFranchiseeInformation:
                          filterMasterFranchiseeInformation
                            ? {
                                pageInfo: refetchRes?.data
                                  ?.filterMasterFranchiseeInformation?.pageInfo
                                  ? {
                                      ...filterMasterFranchiseeInformation?.pageInfo,
                                      endCursor:
                                        refetchRes?.data
                                          ?.filterMasterFranchiseeInformation
                                          ?.pageInfo?.endCursor,
                                      hasNextPage:
                                        refetchRes?.data
                                          ?.filterMasterFranchiseeInformation
                                          ?.pageInfo?.hasNextPage,
                                      totalNumberOfItems:
                                        refetchRes?.data
                                          ?.filterMasterFranchiseeInformation
                                          ?.pageInfo?.totalNumberOfItems,
                                    }
                                  : null,
                                edges:
                                  refetchRes?.data
                                    ?.filterMasterFranchiseeInformation
                                    ?.edges &&
                                  refetchRes?.data
                                    ?.filterMasterFranchiseeInformation?.edges
                                    ?.length > 0
                                    ? [
                                        ...olderRecord,
                                        ...(refetchRes?.data
                                          ?.filterMasterFranchiseeInformation
                                          ?.edges || []),
                                      ]
                                    : [],
                                __typename:
                                  filterMasterFranchiseeInformation?.__typename,
                              }
                            : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterMasterFranchiseeInformation }) => {
                  return {
                    filterMasterFranchiseeInformation:
                      filterMasterFranchiseeInformation
                        ? {
                            pageInfo:
                              filterMasterFranchiseeInformation?.pageInfo
                                ? {
                                    ...filterMasterFranchiseeInformation?.pageInfo,
                                    totalNumberOfItems:
                                      filterMasterFranchiseeInformation
                                        ?.pageInfo?.totalNumberOfItems
                                        ? filterMasterFranchiseeInformation
                                            ?.pageInfo?.totalNumberOfItems - 1
                                        : 0,
                                  }
                                : null,
                            edges:
                              filterMasterFranchiseeInformation?.edges &&
                              filterMasterFranchiseeInformation?.edges?.length >
                                0
                                ? filterMasterFranchiseeInformation?.edges?.filter(
                                    (edge) =>
                                      edge?.node?.id !== confirmModal?.id
                                  ) || []
                                : [],
                            __typename:
                              filterMasterFranchiseeInformation?.__typename,
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
          (data?.filterMasterFranchiseeInformation?.edges?.filter(
            (masterFranchisee) =>
              masterFranchisee?.node?.id === confirmModal?.id
          )?.[0]?.node?.ownerEmail?.length || 0) > 0
        ) {
          resetPassword({
            variables: {
              email: data?.filterMasterFranchiseeInformation?.edges?.filter(
                (masterFranchisee) =>
                  masterFranchisee?.node?.id === confirmModal?.id
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
      }
    }
  };

  const updateStatus = (itemId: number, status: "Active" | "Inactive") => {
    updateMutation({
      variables: {
        id: itemId,
        status: status,
        isMasterFranchiseeInformationStatusNeed: true,
      },
    })
      .then((res) => {
        if (res?.data?.updateMasterFranchiseeInformation) {
          updateQuery(({ filterMasterFranchiseeInformation }) => {
            return {
              filterMasterFranchiseeInformation:
                filterMasterFranchiseeInformation
                  ? {
                      pageInfo: filterMasterFranchiseeInformation?.pageInfo
                        ? {
                            ...filterMasterFranchiseeInformation?.pageInfo,
                            totalNumberOfItems:
                              filterMasterFranchiseeInformation?.pageInfo
                                ?.totalNumberOfItems
                                ? filterMasterFranchiseeInformation?.pageInfo
                                    ?.totalNumberOfItems - 1
                                : 0,
                          }
                        : null,
                      edges:
                        filterMasterFranchiseeInformation?.edges &&
                        filterMasterFranchiseeInformation?.edges?.length > 0
                          ? filterMasterFranchiseeInformation?.edges?.map(
                              (edge) => {
                                if (edge?.node?.id === itemId) {
                                  return {
                                    node: {
                                      id: itemId,
                                      ...edge?.node,
                                      status:
                                        res?.data
                                          ?.updateMasterFranchiseeInformation
                                          ?.status,
                                    },
                                    cursor: edge?.cursor,
                                  };
                                }
                                return edge;
                              }
                            ) || []
                          : [],
                      __typename: filterMasterFranchiseeInformation?.__typename,
                    }
                  : null,
            };
          });
        } else {
          toastNotification(somethingWentWrongMessage);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resetField(`status.${itemId}` as any, {
          defaultValue:
            res?.data?.updateMasterFranchiseeInformation?.status === "Active",
        });
      })
      .catch((error) => {
        toastNotification(messageHelper(error));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resetField(`status.${itemId}` as any);
      });
  };

  const rows =
    data?.filterMasterFranchiseeInformation?.edges?.map((edge) => ({
      id: edge?.node?.id,
      ownerName: edge?.node?.ownerName,
      prefix: edge?.node?.prefix,
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
      after: data?.filterMasterFranchiseeInformation?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeInformation } }
      ) => {
        return { filterMasterFranchiseeInformation };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev =() => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterMasterFranchiseeInformation?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeInformation } }
      ) => {
        return { filterMasterFranchiseeInformation };
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
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeInformation } }
        ) => {
          return {
            filterMasterFranchiseeInformation,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    };

  const totalCount =
    data?.filterMasterFranchiseeInformation?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterMasterFranchiseeInformation?.pageInfo?.hasNextPage &&
    data?.filterMasterFranchiseeInformation?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterMasterFranchiseeInformation?.pageInfo?.hasPreviousPage &&
    data?.filterMasterFranchiseeInformation?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (
          _,
          { fetchMoreResult: { filterMasterFranchiseeInformation } }
        ) => {
          return {
            filterMasterFranchiseeInformation,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

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
            to: "/master-franchisee/$infoId",
            params: {
              infoId: item?.id,
            },
            search: true as any,
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
      .then((response) => {
        if (
          response?.data?.generateMasterFranchiseeCSV !== null &&
          response?.data?.generateMasterFranchiseeCSV !== undefined &&
          response?.data?.generateMasterFranchiseeCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateMasterFranchiseeCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Master Franchisee Account"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Master Franchisee Account",
              to: "/master-franchisee",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/master-franchisee/$infoId",
                params: {
                  infoId: "new",
                },
                search: true as any,
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD MASTER
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
              "min-w-[220px] md:min-w-min w-min h-min flex items-center justify-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
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
        name="Master Franchisee"
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
        <Head headers={tableHeaders} allowsSorting />
        <Body
          headers={tableHeaders}
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={tableHeaders}
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
                    ) : column?.id === "status" ? (
                      <Switch
                        key={item.id}
                        control={control}
                        name={`status.${item?.id}` as any}
                        onChange={(status) => {
                          if (item?.id) {
                            updateStatus(
                              item?.id,
                              status ? "Active" : "Inactive"
                            );
                          }
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
              : "Modal"
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

export default MasterFranchisee;
