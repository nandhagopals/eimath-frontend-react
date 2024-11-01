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
import EditModal from "components/Modal/EditModal";
import { InputField, RadioGroup } from "components/Form";

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
  EducationalCategoryFieldArgs,
  FILTER_EDUCATIONAL_CATEGORIES,
  FilterEducationalCategoriesArgs,
  GENERATE_EDUCATIONAL_CATEGORY_CSV,
  UPDATE_EDUCATIONAL_CATEGORY,
  educationCategoryFilterSchema,
} from "modules/EducationMaterials/EducationalCategory";

const queryFieldArgs: EducationalCategoryFieldArgs = {
  isEducationalCategoryCountryNeed: true,
  isEducationalCategoryEducationalLevelsNeed: true,
  isEducationalCategoryStatusNeed: true,
  isEducationalCategoryRemarksNeed: true,
};

const commonTableHeaders = [
  { name: "ID", id: "id" as const, isRowHeader: true },
  { name: "Name", id: "name" as const },
  { name: "Levels", id: "levels" as const, hideSort: true },
];

const EducationalCategory = () => {
  const { canCreate, canDelete, canUpdate } = useAllowedResource(
    "EducationalCategory",
    true
  );
  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveEducationalCategory"
  );
  const canDownloadCSV = useAllowedResource("DownloadEducationalCategory");
  const navigate = useNavigate();

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: educationCategoryFilterSchema,
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

  const commonQueryArgs: FilterEducationalCategoriesArgs = useMemo(
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
          }
        : undefined,
    }),
    [status, watchSortBy?.column, watchSortBy?.direction, watchCountry?.id]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_EDUCATIONAL_CATEGORIES,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_EDUCATIONAL_CATEGORY
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_EDUCATIONAL_CATEGORY_CSV
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
            isEducationalCategoryStatusNeed: true,
          },
        })
          .then((res) => {
            if (res?.data?.updateEducationalCategory) {
              closeConfirmModal();

              if (data?.filterEducationalCategories?.edges?.length === 1) {
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
                    { fetchMoreResult: { filterEducationalCategories } }
                  ) => {
                    return {
                      filterEducationalCategories,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (
                data?.filterEducationalCategories?.pageInfo?.hasNextPage
              ) {
                const deleteItemIndex =
                  data?.filterEducationalCategories?.edges?.findIndex(
                    (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                  );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterEducationalCategories &&
                      data.filterEducationalCategories?.edges &&
                      data.filterEducationalCategories?.edges[
                        (deleteItemIndex || 0) - 1
                      ]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterEducationalCategories?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (
                    refetchRes?.data?.filterEducationalCategories?.edges
                      ?.length === 1
                  ) {
                    updateQuery(({ filterEducationalCategories }) => {
                      const olderRecord =
                        filterEducationalCategories?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterEducationalCategories: filterEducationalCategories
                          ? {
                              pageInfo: refetchRes?.data
                                ?.filterEducationalCategories?.pageInfo
                                ? {
                                    ...filterEducationalCategories?.pageInfo,
                                    endCursor:
                                      refetchRes?.data
                                        ?.filterEducationalCategories?.pageInfo
                                        ?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data
                                        ?.filterEducationalCategories?.pageInfo
                                        ?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data
                                        ?.filterEducationalCategories?.pageInfo
                                        ?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterEducationalCategories
                                  ?.edges &&
                                refetchRes?.data?.filterEducationalCategories
                                  ?.edges?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data
                                        ?.filterEducationalCategories?.edges ||
                                        []),
                                    ]
                                  : [],
                              __typename:
                                filterEducationalCategories?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterEducationalCategories }) => {
                  return {
                    filterEducationalCategories: filterEducationalCategories
                      ? {
                          pageInfo: filterEducationalCategories?.pageInfo
                            ? {
                                ...filterEducationalCategories?.pageInfo,
                                totalNumberOfItems: filterEducationalCategories
                                  ?.pageInfo?.totalNumberOfItems
                                  ? filterEducationalCategories?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterEducationalCategories?.edges &&
                            filterEducationalCategories?.edges?.length > 0
                              ? filterEducationalCategories?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterEducationalCategories?.__typename,
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
    data?.filterEducationalCategories?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      levels: edge?.node?.educationalCategoryLevels,
      remarks: edge?.node?.remarks,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterEducationalCategories?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterEducationalCategories } }
      ) => {
        return { filterEducationalCategories };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  }

  const onPrev =() => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterEducationalCategories?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterEducationalCategories } }
      ) => {
        return { filterEducationalCategories };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  }

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
          { fetchMoreResult: { filterEducationalCategories } }
        ) => {
          return {
            filterEducationalCategories,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }
   

  const totalCount =
    data?.filterEducationalCategories?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterEducationalCategories?.pageInfo?.hasNextPage &&
    data?.filterEducationalCategories?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterEducationalCategories?.pageInfo?.hasPreviousPage &&
    data?.filterEducationalCategories?.pageInfo?.startCursor
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
          { fetchMoreResult: { filterEducationalCategories } }
        ) => {
          return {
            filterEducationalCategories,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const onCountryFilter: (country: Country | null | undefined) => void =
   
      (country) => {
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
          updateQuery: (
            _,
            { fetchMoreResult: { filterEducationalCategories } }
          ) => {
            return {
              filterEducationalCategories,
            };
          },
        }).catch((error) => {
          toastNotification(messageHelper(error));
        });
      }
      

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
          isEducationalCategoryStatusNeed: false,
        },
      })
        .then((res) => {
          if (res?.data?.updateEducationalCategory) {
            updateQuery(({ filterEducationalCategories }) => {
              return {
                filterEducationalCategories: filterEducationalCategories
                  ? {
                      pageInfo: filterEducationalCategories?.pageInfo
                        ? {
                            ...filterEducationalCategories?.pageInfo,
                            totalNumberOfItems: filterEducationalCategories
                              ?.pageInfo?.totalNumberOfItems
                              ? filterEducationalCategories?.pageInfo
                                  ?.totalNumberOfItems - 1
                              : 0,
                          }
                        : null,
                      edges:
                        filterEducationalCategories?.edges &&
                        filterEducationalCategories?.edges?.length > 0
                          ? filterEducationalCategories?.edges?.map((edge) => {
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
                      __typename: filterEducationalCategories?.__typename,
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
            to: "/education-materials/educational-categories/$eductionCategoryId",
            params: {
              eductionCategoryId: item?.id?.toString(),
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
          response?.data?.generateEducationalCategoryCSV !== null &&
          response?.data?.generateEducationalCategoryCSV !== undefined &&
          response?.data?.generateEducationalCategoryCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateEducationalCategoryCSV);
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
          title="Educational Category"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Education Materials",
              to: "/education-materials/workbook-management",
            },
            {
              name: "Educational Category",
              to: "/education-materials/educational-categories",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/education-materials/educational-categories/$eductionCategoryId",
                params: {
                  eductionCategoryId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD EDUCATIONAL CATEGORY
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
              "min-w-[220px] md:min-w-min w-min h-min flex items-center justify-center transition-all duration-300 whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
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
        name="Educational category"
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
                  ) : item?.[column?.id] ? (
                    item?.[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={kebabMenuList}
                        onAction={(value) => {
                          kebabMenuAction(value, item);
                        }}
                      />
                    ) : column?.id === "levels" ? (
                      item &&
                      item?.[column?.id] &&
                      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
                      item?.[column?.id]!?.length > 0 ? (
                        <div className="flex gap-2.5 flex-wrap">
                          {item?.[column?.id]?.map((educationLevel, index) => (
                            <p
                              className="px-2.5 py-2 rounded-full text-primary-text font-normal text-[13px] bg-action-selected"
                              key={index}
                            >
                              {educationLevel?.educationalLevel?.name || "N/A"}
                            </p>
                          ))}
                        </div>
                      ) : (
                        "N/A"
                      )
                    ) : (
                      item?.[column?.id]
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
              : ""
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

export default EducationalCategory;
