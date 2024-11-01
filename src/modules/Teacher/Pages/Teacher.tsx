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
  FILTER_TEACHERS,
  FilterTeacherArgs,
  GENERATE_TEACHER_CSV,
  TeacherFieldArgs,
  UPDATE_TEACHER,
  teacherFilterSchema,
} from "modules/Teacher";

const queryFieldArgs: TeacherFieldArgs = {
  isEmailNeed: true,
  isFranchiseInformationNeed: true,
  isISDCodeNeed: true,
  isMobileNumberNeed: true,
  isJoinDateNeed: true,
  isMasterFranchiseeInformationNeed: true,
};

const commonTableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Mobile Number", id: "mobileNumber", hideSort: true },
  { name: "Email", id: "email", hideSort: true },
  { name: "Master Franchise", id: "masterFranchisee" },
  { name: "Franchise Name", id: "shortName" },
];

const Teacher = () => {
  const { canCreate, canDelete } = useAllowedResource("Teacher", true);
  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveTeacher"
  );
  const canDownloadCSV = useAllowedResource("DownloadTeacher");
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: teacherFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      filters: {
        status: "ACTIVE",
      },
      sortBy: { column: "id", direction: "descending" },
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
          { name: "Actions", id: "action", hideSort: true },
        ]
      : canArchiveAndUnarchive || canDelete
      ? [
          ...commonTableHeaders,
          { name: "Actions", id: "action", hideSort: true },
        ]
      : commonTableHeaders;

  const status = watchStatus;

  const commonQueryArgs: FilterTeacherArgs = useMemo(
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
              watchSortBy?.column === "shortName"
                ? "franchiseeInformation"
                : watchSortBy?.column === "masterFranchisee"
                ? "masterFranchiseeInformation"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField:
              watchSortBy?.column === "shortName"
                ? "companyName"
                : watchSortBy?.column === "masterFranchisee"
                ? "masterFranchiseeName"
                : undefined,
          }
        : undefined,
    }),
    [status, watchSortBy?.column, watchSortBy?.direction]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(FILTER_TEACHERS, {
    variables: commonQueryArgs,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_TEACHER);

  const [generateCSV, { loading: csvFileLoading }] =
    useMutation(GENERATE_TEACHER_CSV);

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
            if (res?.data?.updateTeacher) {
              closeConfirmModal();

              if (data?.filterTeachers?.edges?.length === 1) {
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
                  updateQuery: (_, { fetchMoreResult: { filterTeachers } }) => {
                    return {
                      filterTeachers,
                    };
                  },
                }).catch((error) => {
                  toastNotification(messageHelper(error));
                });
              } else if (data?.filterTeachers?.pageInfo?.hasNextPage) {
                const deleteItemIndex = data?.filterTeachers?.edges?.findIndex(
                  (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                );

                const nextPointCursorData =
                  (deleteItemIndex || 0) + 1 === watchPageSize
                    ? data &&
                      data?.filterTeachers &&
                      data.filterTeachers?.edges &&
                      data.filterTeachers?.edges[(deleteItemIndex || 0) - 1]
                    : null;

                const queryArgs = commonQueryArgs;

                queryArgs.pagination = {
                  size: 1,
                  after:
                    nextPointCursorData?.cursor ||
                    data?.filterTeachers?.pageInfo?.endCursor,
                };

                fetchMore({
                  variables: queryArgs,
                }).then((refetchRes) => {
                  if (refetchRes?.data?.filterTeachers?.edges?.length === 1) {
                    updateQuery(({ filterTeachers }) => {
                      const olderRecord =
                        filterTeachers?.edges?.filter(
                          (edgeDetails) =>
                            edgeDetails?.node?.id !== confirmModal?.id
                        ) || [];
                      return {
                        filterTeachers: filterTeachers
                          ? {
                              pageInfo: refetchRes?.data?.filterTeachers
                                ?.pageInfo
                                ? {
                                    ...filterTeachers?.pageInfo,
                                    endCursor:
                                      refetchRes?.data?.filterTeachers?.pageInfo
                                        ?.endCursor,
                                    hasNextPage:
                                      refetchRes?.data?.filterTeachers?.pageInfo
                                        ?.hasNextPage,
                                    totalNumberOfItems:
                                      refetchRes?.data?.filterTeachers?.pageInfo
                                        ?.totalNumberOfItems,
                                  }
                                : null,
                              edges:
                                refetchRes?.data?.filterTeachers?.edges &&
                                refetchRes?.data?.filterTeachers?.edges
                                  ?.length > 0
                                  ? [
                                      ...olderRecord,
                                      ...(refetchRes?.data?.filterTeachers
                                        ?.edges || []),
                                    ]
                                  : [],
                              __typename: filterTeachers?.__typename,
                            }
                          : null,
                      };
                    });
                  }
                });
              } else {
                updateQuery(({ filterTeachers }) => {
                  return {
                    filterTeachers: filterTeachers
                      ? {
                          pageInfo: filterTeachers?.pageInfo
                            ? {
                                ...filterTeachers?.pageInfo,
                                totalNumberOfItems: filterTeachers?.pageInfo
                                  ?.totalNumberOfItems
                                  ? filterTeachers?.pageInfo
                                      ?.totalNumberOfItems - 1
                                  : 0,
                              }
                            : null,
                          edges:
                            filterTeachers?.edges &&
                            filterTeachers?.edges?.length > 0
                              ? filterTeachers?.edges?.filter(
                                  (edge) => edge?.node?.id !== confirmModal?.id
                                ) || []
                              : [],
                          __typename: filterTeachers?.__typename,
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
    data?.filterTeachers?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      mobileNumber: edge?.node?.mobileNumber
        ? `${edge?.node?.isdCode ? edge?.node?.isdCode : ""} ${
            edge?.node?.mobileNumber
          }`
        : "N/A",
      email: edge?.node?.email,
      masterFranchisee:
        edge?.node?.masterFranchiseeInformation?.masterFranchiseeName,
      shortName: edge?.node?.franchiseeInformation?.franchiseeName,
      action: "action" as const,
    })) || [];

  const onNext =() => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterTeachers?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterTeachers } }) => {
        return { filterTeachers };
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
      before: data?.filterTeachers?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterTeachers } }) => {
        return { filterTeachers };
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
        updateQuery: (_, { fetchMoreResult: { filterTeachers } }) => {
          return {
            filterTeachers,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }

  const totalCount = data?.filterTeachers?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterTeachers?.pageInfo?.hasNextPage &&
    data?.filterTeachers?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterTeachers?.pageInfo?.hasPreviousPage &&
    data?.filterTeachers?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterTeachers } }) => {
          return {
            filterTeachers,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const kebabMenuList =
    status === "ACTIVE"
      ? canArchiveAndUnarchive
        ? ([{ id: "View/Edit" }, { id: "Archive" }] as any)
        : ([{ id: "View/Edit" }] as any)
      : canArchiveAndUnarchive && canDelete
      ? ([{ id: "Unarchive" }, { id: "Delete" }] as any)
      : canDelete
      ? ([{ id: "Delete" }] as any)
      : canArchiveAndUnarchive
      ? ([{ id: "Unarchive" }] as any)
      : [];

  const kebabMenuAction = (value, item) => {
    if (watchStatus === "ACTIVE" && item?.id) {
      switch (value?.id) {
        case "View/Edit": {
          navigate({
            to: "/teacher/$teacherId",
            params: {
              teacherId: item?.id?.toString(),
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
          response?.data?.generateTeacherCSV !== null &&
          response?.data?.generateTeacherCSV !== undefined &&
          response?.data?.generateTeacherCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateTeacherCSV);
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
          title="Teacher Account"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Teacher Account",
              to: "/teacher",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/teacher/$teacherId",
                params: {
                  teacherId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD TEACHER
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
      <div className="flex justify-between gap-2 flex-col sm:flex-row items-center">
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
        name="Teacher"
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
                    ) : column?.id === "shortName" ? (
                      item?.shortName === null ||
                      item?.shortName === undefined ? (
                        <Button
                          className={
                            "w-min whitespace-nowrap rounded-full px-2.5 py-2 text-[13px]  bg-none bg-error-main text-white border-none"
                          }
                        >
                          Untagged
                        </Button>
                      ) : (
                        item?.shortName
                      )
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
    </div>
  );
};

export default Teacher;
