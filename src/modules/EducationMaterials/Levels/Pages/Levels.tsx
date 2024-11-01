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

import { Country, CountryField } from "modules/Settings/Country";
import {
  EducationalLevelsFieldArgs,
  FILTER_EDUCATIONAL_LEVELS,
  FilterEducationalLevelsArgs,
  GENERATE_LEVELS_CSV,
  UPDATE_EDUCATIONAL_LEVEL,
  levelFilterSchema,
} from "modules/EducationMaterials/Levels";

const queryFieldArgs: EducationalLevelsFieldArgs = {
  isCountryDetailsNeed: true,
  isStatusNeed: true,
  isRemarksNeed: true,
  isEducationalTermsNeed: true,
};

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Country", id: "country" },
];

const Levels = () => {
  const { canCreate, canDelete, canUpdate } = useAllowedResource(
    "EducationalLevel",
    true
  );
  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveEducationalLevel"
  );
  const canDownloadCSV = useAllowedResource("DownloadEducationalLevel");
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: levelFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      filters: {
        status: "ACTIVE",
      },
      country: null,
      search: "",
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
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
        : [
            ...commonTableHeaders,
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
      : canArchiveAndUnarchive || canDelete
      ? canUpdate
        ? [
            ...commonTableHeaders,
            { name: "Remarks", id: "remarks" as const, hideSort: true },
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
        : [
            ...commonTableHeaders,
            { name: "Actions", id: "action" as const, hideSort: true },
          ]
      : canUpdate
      ? [
          ...commonTableHeaders,
          { name: "Remarks", id: "remarks" as const, hideSort: true },
        ]
      : commonTableHeaders;

  const status = watchStatus;

  const commonQueryArgs: FilterEducationalLevelsArgs = useMemo(
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
    [watchCountry?.id, watchSortBy?.column, watchSortBy?.direction, status]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_EDUCATIONAL_LEVELS,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_EDUCATIONAL_LEVEL
  );

  const [generateCSV, { loading: csvFileLoading }] =
    useMutation(GENERATE_LEVELS_CSV);

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
            if (res?.data?.updateEducationalLevel) {
              closeConfirmModal();

              if (data?.filterEducationalLevels?.edges?.length === 1) {
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
                    { fetchMoreResult: { filterEducationalLevels } }
                  ) => {
                    return {
                      filterEducationalLevels,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (data?.filterEducationalLevels?.pageInfo?.hasNextPage) {
                const deleteItemIndex =
                  data?.filterEducationalLevels?.edges?.findIndex(
                    (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                  );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterEducationalLevels &&
                      data.filterEducationalLevels?.edges &&
                      data.filterEducationalLevels?.edges[
                        (deleteItemIndex || 0) - 1
                      ]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterEducationalLevels?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (
                    refetchRes?.data?.filterEducationalLevels?.edges?.length ===
                    1
                  ) {
                    updateQuery(({ filterEducationalLevels }) => {
                      const olderRecord =
                        filterEducationalLevels?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterEducationalLevels: filterEducationalLevels
                          ? {
                              pageInfo: refetchRes?.data
                                ?.filterEducationalLevels?.pageInfo
                                ? {
                                    ...filterEducationalLevels?.pageInfo,
                                    endCursor:
                                      refetchRes?.data?.filterEducationalLevels
                                        ?.pageInfo?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data?.filterEducationalLevels
                                        ?.pageInfo?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data?.filterEducationalLevels
                                        ?.pageInfo?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterEducationalLevels
                                  ?.edges &&
                                refetchRes?.data?.filterEducationalLevels?.edges
                                  ?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data
                                        ?.filterEducationalLevels?.edges || []),
                                    ]
                                  : [],
                              __typename: filterEducationalLevels?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterEducationalLevels }) => {
                  return {
                    filterEducationalLevels: filterEducationalLevels
                      ? {
                          pageInfo: filterEducationalLevels?.pageInfo
                            ? {
                                ...filterEducationalLevels?.pageInfo,
                                totalNumberOfItems: filterEducationalLevels
                                  ?.pageInfo?.totalNumberOfItems
                                  ? filterEducationalLevels?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterEducationalLevels?.edges &&
                            filterEducationalLevels?.edges?.length > 0
                              ? filterEducationalLevels?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterEducationalLevels?.__typename,
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
    data?.filterEducationalLevels?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      country: edge?.node?.country?.name,
      remarks: edge?.node?.remarks,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterEducationalLevels?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterEducationalLevels } }) => {
        return { filterEducationalLevels };
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
      before: data?.filterEducationalLevels?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterEducationalLevels } }) => {
        return { filterEducationalLevels };
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
      updateQuery: (_, { fetchMoreResult: { filterEducationalLevels } }) => {
        return {
          filterEducationalLevels,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterEducationalLevels?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterEducationalLevels?.pageInfo?.hasNextPage &&
    data?.filterEducationalLevels?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterEducationalLevels?.pageInfo?.hasPreviousPage &&
    data?.filterEducationalLevels?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterEducationalLevels } }) => {
          return {
            filterEducationalLevels,
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
      updateQuery: (_, { fetchMoreResult: { filterEducationalLevels } }) => {
        return {
          filterEducationalLevels,
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
          if (res?.data?.updateEducationalLevel) {
            updateQuery(({ filterEducationalLevels }) => {
              return {
                filterEducationalLevels: filterEducationalLevels
                  ? {
                      pageInfo: filterEducationalLevels?.pageInfo
                        ? {
                            ...filterEducationalLevels?.pageInfo,
                            totalNumberOfItems: filterEducationalLevels
                              ?.pageInfo?.totalNumberOfItems
                              ? filterEducationalLevels?.pageInfo
                                  ?.totalNumberOfItems - 1
                              : 0,
                          }
                        : null,
                      edges:
                        filterEducationalLevels?.edges &&
                        filterEducationalLevels?.edges?.length > 0
                          ? filterEducationalLevels?.edges?.map((edge) => {
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
                      __typename: filterEducationalLevels?.__typename,
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
            to: "/education-materials/levels/$eductionLevelId",
            params: {
              eductionLevelId: item?.id?.toString(),
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
          response?.data?.generateLevelsCSV !== null &&
          response?.data?.generateLevelsCSV !== undefined &&
          response?.data?.generateLevelsCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateLevelsCSV);
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
          title="Levels"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Education Materials",
              to: "/education-materials/levels",
            },
            {
              name: "Levels",
              to: "/education-materials/levels",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/education-materials/levels/$eductionLevelId",
                params: {
                  eductionLevelId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD LEVEL
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 lg:gap-y-0 items-center justify-start gap-x-2 max-w-max">
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
        name="Levels"
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
    </div>
  );
};

export default Levels;