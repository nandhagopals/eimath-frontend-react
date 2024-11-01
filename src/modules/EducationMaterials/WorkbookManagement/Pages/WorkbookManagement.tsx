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
import { InputField, RadioGroup } from "components/Form";
import EditModal from "components/Modal/EditModal";

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
import DocumentsIcon from "global/assets/images/picture-as-pdf-filled.svg?react";

import {
  FILTER_WORKBOOK_INFORMATION,
  FilterWorkbookInformationArgs,
  GENERATE_WORKBOOK_INFORMATION_CSV,
  UPDATE_WORKBOOK_INFORMATION,
  WorkbookManagementViewFileModal,
  workbookFilterSchema,
} from "modules/EducationMaterials/WorkbookManagement";
import { Country, CountryField } from "modules/Settings/Country";

const queryFieldArgs = {
  isPriceNeed: true,
  isCountryDetailsNeed: true,
  isStatusNeed: true,
  isRemarksNeed: true,
};

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Country", id: "country" },
  { name: "Price (Points)", id: "price" },
];

const WorkbookManagement = () => {
  const { canCreate, canDelete, canUpdate } = useAllowedResource(
    "WorkbookInformation",
    true
  );
  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveWorkbookInformation"
  );
  const canDownloadCSV = useAllowedResource("DownloadWorkbookInformation");
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: workbookFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      filters: {
        status: "ACTIVE",
      },
      country: null,
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [watchSearch, watchPageSize, watchStatus, watchCountry, watchSortBy] =
    useWatch({
      control,
      name: ["search", "pageSize", "filters.status", "country", "sortBy"],
    });

  const tableHeaders =
    watchStatus === "ACTIVE"
      ? canUpdate
        ? [
            ...commonTableHeaders,
            { name: "Remarks", id: "remarks" as const, hideSort: true },
            { name: "Documents", id: "documents", hideSort: true },
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
        : [
            ...commonTableHeaders,
            { name: "Documents", id: "documents", hideSort: true },
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
      : canArchiveAndUnarchive || canDelete
      ? canUpdate
        ? [
            ...commonTableHeaders,
            { name: "Remarks", id: "remarks" as const, hideSort: true },
            { name: "Documents", id: "documents", hideSort: true },
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
        : [
            ...commonTableHeaders,
            { name: "Documents", id: "documents", hideSort: true },
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
      : canUpdate
      ? [
          ...commonTableHeaders,
          { name: "Remarks", id: "remarks" as const, hideSort: true },
          { name: "Documents", id: "documents", hideSort: true },
        ]
      : [
          ...commonTableHeaders,
          { name: "Documents", id: "documents", hideSort: true },
        ];

  const status = watchStatus;

  const commonQueryArgs: FilterWorkbookInformationArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        status: {
          inArray: status === "ACTIVE" ? ["Active", "Inactive"] : ["Archived"],
        },
        countryId: watchCountry?.id
          ? {
              number: watchCountry?.id || undefined,
            }
          : undefined,
      },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column: watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField:
              watchSortBy?.column === "country" ? "name" : undefined,
          }
        : undefined,
    }),
    [status, watchSortBy?.column, watchSortBy?.direction, watchCountry?.id]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_WORKBOOK_INFORMATION,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_WORKBOOK_INFORMATION
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_WORKBOOK_INFORMATION_CSV
  );

  const [confirmModal, setConfirmModal] = useState<
    | { type: "Archive"; id: number }
    | { type: "Unarchive"; id: number }
    | { type: "Delete"; id: number }
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
            isStatusNeed: true,
          },
        })
          .then((res) => {
            if (res?.data?.updateWorkbookInformation) {
              closeConfirmModal();

              if (data?.filterWorkbookInformation?.edges?.length === 1) {
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
                    { fetchMoreResult: { filterWorkbookInformation } }
                  ) => {
                    return {
                      filterWorkbookInformation,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (
                data?.filterWorkbookInformation?.pageInfo?.hasNextPage
              ) {
                const deleteItemIndex =
                  data?.filterWorkbookInformation?.edges?.findIndex(
                    (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                  );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterWorkbookInformation &&
                      data.filterWorkbookInformation?.edges &&
                      data.filterWorkbookInformation?.edges[
                        (deleteItemIndex || 0) - 1
                      ]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterWorkbookInformation?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (
                    refetchRes?.data?.filterWorkbookInformation?.edges
                      ?.length === 1
                  ) {
                    updateQuery(({ filterWorkbookInformation }) => {
                      const olderRecord =
                        filterWorkbookInformation?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterWorkbookInformation: filterWorkbookInformation
                          ? {
                              pageInfo: refetchRes?.data
                                ?.filterWorkbookInformation?.pageInfo
                                ? {
                                    ...filterWorkbookInformation?.pageInfo,
                                    endCursor:
                                      refetchRes?.data
                                        ?.filterWorkbookInformation?.pageInfo
                                        ?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data
                                        ?.filterWorkbookInformation?.pageInfo
                                        ?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data
                                        ?.filterWorkbookInformation?.pageInfo
                                        ?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterWorkbookInformation
                                  ?.edges &&
                                refetchRes?.data?.filterWorkbookInformation
                                  ?.edges?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data
                                        ?.filterWorkbookInformation?.edges ||
                                        []),
                                    ]
                                  : [],
                              __typename: filterWorkbookInformation?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterWorkbookInformation }) => {
                  return {
                    filterWorkbookInformation: filterWorkbookInformation
                      ? {
                          pageInfo: filterWorkbookInformation?.pageInfo
                            ? {
                                ...filterWorkbookInformation?.pageInfo,
                                totalNumberOfItems: filterWorkbookInformation
                                  ?.pageInfo?.totalNumberOfItems
                                  ? filterWorkbookInformation?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterWorkbookInformation?.edges &&
                            filterWorkbookInformation?.edges?.length > 0
                              ? filterWorkbookInformation?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterWorkbookInformation?.__typename,
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
    data?.filterWorkbookInformation?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      country: edge?.node?.country?.name,
      price:
        edge?.node?.price && Number.isInteger(edge?.node?.price)
          ? edge?.node?.price
          : edge?.node?.price && edge?.node?.price?.toFixed(2),
      remarks: edge?.node?.remarks,
      documents: "documents" as const,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterWorkbookInformation?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterWorkbookInformation } }) => {
        return { filterWorkbookInformation };
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
      before: data?.filterWorkbookInformation?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterWorkbookInformation } }) => {
        return { filterWorkbookInformation };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: page,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterWorkbookInformation } }) => {
        return {
          filterWorkbookInformation,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterWorkbookInformation?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterWorkbookInformation?.pageInfo?.hasNextPage &&
    data?.filterWorkbookInformation?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterWorkbookInformation?.pageInfo?.hasPreviousPage &&
    data?.filterWorkbookInformation?.pageInfo?.startCursor
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
          { fetchMoreResult: { filterWorkbookInformation } }
        ) => {
          return {
            filterWorkbookInformation,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const onCountryFilter: (country: Country | null | undefined) => void = (
    country
  ) => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.filter = {
      status: commonQueryArgs.filter?.status,
      countryId: country?.id
        ? {
            number: country?.id,
          }
        : undefined,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterWorkbookInformation } }) => {
        return {
          filterWorkbookInformation,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const [viewRemarks, setViewRemarks] = useState<{
    id?: number | null;
    value?: string | null;
  } | null>(null);

  const editModalSubmitHandler = (value?: string | null) => {
    if (viewRemarks?.id) {
      updateMutation({
        variables: {
          id: viewRemarks?.id,
          remarks: value,
        },
      })
        .then((res) => {
          if (res?.data?.updateWorkbookInformation) {
            updateQuery(({ filterWorkbookInformation }) => {
              return {
                filterWorkbookInformation: filterWorkbookInformation
                  ? {
                      pageInfo: filterWorkbookInformation?.pageInfo
                        ? {
                            ...filterWorkbookInformation?.pageInfo,
                            totalNumberOfItems: filterWorkbookInformation
                              ?.pageInfo?.totalNumberOfItems
                              ? filterWorkbookInformation?.pageInfo
                                  ?.totalNumberOfItems - 1
                              : 0,
                          }
                        : null,
                      edges:
                        filterWorkbookInformation?.edges &&
                        filterWorkbookInformation?.edges?.length > 0
                          ? filterWorkbookInformation?.edges?.map((edge) => {
                              if (edge?.node?.id === viewRemarks?.id) {
                                return {
                                  node: {
                                    id: viewRemarks?.id,
                                    ...edge?.node,
                                    remarks: value,
                                  },
                                  cursor: edge?.cursor,
                                };
                              }
                              return edge;
                            }) || []
                          : [],
                      __typename: filterWorkbookInformation?.__typename,
                    }
                  : null,
              };
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }

          setViewRemarks(null);
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
    }
  };

  const [showWorkbookManagementFiles, setShowWorkbookManagementFiles] =
    useState<{
      type: "workbook" | "answer";
      id: number;
    } | null>(null);

  const workbookManagementFilesCloseHandler = () => {
    setShowWorkbookManagementFiles(null);
  };

  const kebabMenuList =
    status === "ACTIVE"
      ? canArchiveAndUnarchive
        ? ([{ id: "View/Edit" }, { id: "Archive" }] as any)
        : ([{ id: "View/Edit" }] as any)
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
            to: "/education-materials/workbook-management/$workbookId",
            params: {
              workbookId: item?.id?.toString(),
            },
          });

          break;
        }

        case "Archive": {
          setConfirmModal({
            type: "Archive",
            id: item?.id,
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
          response?.data?.generateWorkbookInformationCSV !== null &&
          response?.data?.generateWorkbookInformationCSV !== undefined &&
          response?.data?.generateWorkbookInformationCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateWorkbookInformationCSV);
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
          title="Workbook Management"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Education Materials",
              to: "/education-materials/workbook-management",
            },
            {
              name: "Workbook Management",
              to: "/education-materials/workbook-management",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/education-materials/workbook-management/$workbookId",
                params: {
                  workbookId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD WORKBOOK
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
          resetField("country", { defaultValue: undefined });
        }}
      />
      <div className="flex justify-between gap-2 flex-col sm:flex-row items-center">
        <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start max-w-max">
          <InputField
            control={control}
            name="search"
            type="search"
            debounceOnChange={onSearchChange}
            variant="small"
            placeholder=""
          />
          <CountryField
            control={control}
            name={"country"}
            onChange={onCountryFilter}
            variant="small"
            className="min-w-[220px] w-min"
            label="Country"
            canClear
          />
        </div>

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
        name="Workbook Management"
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
          loading={!!preLoading}
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
                    item[column?.id] === "action" ? "" : "py-[15px]"
                  )}
                >
                  {column?.id === "remarks" ? (
                    <button
                      key={item?.id}
                      type="button"
                      className="text-primary-main font-normal text-base underline"
                      onClick={() => {
                        setViewRemarks({
                          id: item.id,
                          value: item.remarks,
                        });
                      }}
                    >
                      View
                    </button>
                  ) : item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : column?.id === "documents" ? (
                      <TableAction
                        type="kebab"
                        Icon={DocumentsIcon}
                        items={
                          [
                            { id: "View/Download Workbook" },
                            { id: "View/Download Answer" },
                          ] as const
                        }
                        onAction={(action) => {
                          if (
                            item?.id &&
                            (action?.id === "View/Download Answer" ||
                              action?.id === "View/Download Workbook")
                          ) {
                            setShowWorkbookManagementFiles({
                              id: item.id,
                              type:
                                action?.id === "View/Download Answer"
                                  ? "answer"
                                  : "workbook",
                            });
                          }
                        }}
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
              : "Action"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: updateLoading,
              onPress: confirmHandler,
            },
            secondary: {
              isDisabled: updateLoading,
            },
          }}
          isOpen={!!confirmModal?.id}
          loading={updateLoading}
        />
      )}

      {viewRemarks?.id && (
        <EditModal
          onClose={() => setViewRemarks(null)}
          onSubmitHandler={({ data: { fieldValue } }) => {
            editModalSubmitHandler(fieldValue);
          }}
          isOpen={!!viewRemarks?.id}
          inputFieldValue={viewRemarks?.value}
          button={{
            primary: {
              loading: updateLoading,
              isDisabled: !canUpdate,
            },
            secondary: {
              isDisabled: updateLoading,
            },
          }}
          title="Remarks"
          inputFieldLabel="Remarks"
          inputFieldClassName="min-h-[140px] h-min min-w-64 w-min md:min-w-96 lg:min-w-lg"
        />
      )}

      {showWorkbookManagementFiles?.id && showWorkbookManagementFiles?.type ? (
        <WorkbookManagementViewFileModal
          id={showWorkbookManagementFiles?.id}
          isOpen={!!showWorkbookManagementFiles?.id}
          modalType={showWorkbookManagementFiles?.type}
          onClose={workbookManagementFilesCloseHandler}
        />
      ) : null}
    </div>
  );
};

export default WorkbookManagement;
