/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { z } from "zod";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { DateField, InputField } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import {
  dateFieldSchema,
  fileDownload,
  formatDate,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  CREATE_MASTER_FRANCHISEE_POINTS_TRANSACTION,
  FILTER_MASTER_FRANCHISEE_POINTS,
  FilterMasterFranchiseePointsArgs,
  GENERATE_MF_POINT_CSV,
  MasterFranchiseePointsFieldArgs,
  pointsSortBySchema,
} from "modules/PointsManagement";
import CreatePointsTransferModal from "modules/PointsManagement/Points/Pages/CreatePointsTransferModal";
import TransactionHistory from "modules/PointsManagement/TransactionHistory/Pages/TransactionHistory";

const queryFieldArgs: MasterFranchiseePointsFieldArgs = {
  isUpdateAtNeed: true,
  isMasterFranchiseeInformationNeed: true,
  isPointsAvailableNeed: true,
};

const tableHeaders = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Master Franchisee", id: "masterFranchiseeId" },
  { name: "Points Available", id: "pointsAvailable" },
  { name: "Last Updated", id: "lastUpdated" },
  { name: "Actions", id: "action", hideSort: true },
];

const Points = () => {
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const canDownloadCSV = useAllowedResource("DownloadMasterFranchiseePoint");
  const canTransferPoints = useAllowedResource("ManageMasterFranchiseePoint");

  const { authUserDetails } = useAuth();

  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isAdmin = authUserDetails?.type === "User";
  const { control } = useFormWithZod({
    schema: z.object({
      search: z.string().nullable(),
      pageSize: z.number(),
      date: z
        .object({
          start: dateFieldSchema.nullish(),
          end: dateFieldSchema.nullish(),
        })
        .nullish(),
      sortBy: pointsSortBySchema,
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      date: null,
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [watchSearch, watchPageSize, watchSortBy, watchDate] = useWatch({
    control,
    name: ["search", "pageSize", "sortBy", "date"],
  });

  const commonQueryArgs: FilterMasterFranchiseePointsArgs = useMemo(
    () => ({
      ...queryFieldArgs,
      pagination: { size: watchPageSize },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "masterFranchiseeId"
                ? "masterFranchiseeInformation"
                : watchSortBy?.column === "lastUpdated"
                ? "updatedAt"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField:
              watchSortBy?.column === "masterFranchiseeId"
                ? "masterFranchiseeName"
                : undefined,
          }
        : undefined,
      filter: {
        updatedAt: watchDate
          ? {
              between: {
                from: `${watchDate?.start?.year}-${watchDate?.start?.month}-${watchDate?.start?.day}`,
                to: `${watchDate?.end?.year}-${watchDate?.end?.month}-${watchDate?.end?.day}`,
              },
            }
          : undefined,
        masterFranchiseeId: isMasterFranchisee
          ? { number: authUserDetails?.id }
          : undefined,
      },
    }),
    [
      watchDate?.start?.year,
      watchDate?.start?.month,
      watchDate?.start?.day,
      watchSortBy?.column,
      watchSortBy?.direction,
    ]
  );

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_MASTER_FRANCHISEE_POINTS,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [createMutation, { loading: createPointsTransferLoading }] =
    useMutation(CREATE_MASTER_FRANCHISEE_POINTS_TRANSACTION);

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_MF_POINT_CSV
  );

  const rows =
    data?.filterMasterFranchiseePoints?.edges?.map((edge) => ({
      id: edge?.node?.id,
      masterFranchiseeId: {
        masterFranchiseeId: edge?.node?.masterFranchiseeInformation?.id,
        masterFranchiseeName:
          edge?.node?.masterFranchiseeInformation?.masterFranchiseeName,
      },
      pointsAvailable:
        (edge?.node?.pointsAvailable &&
        Number.isInteger(edge?.node?.pointsAvailable)
          ? edge?.node?.pointsAvailable
          : edge?.node?.pointsAvailable &&
            edge?.node?.pointsAvailable?.toFixed(2)) ?? 0,
      lastUpdated: formatDate(edge?.node?.updatedAt, "dd/MM/yyyy"),
      action: "action" as const,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterMasterFranchiseePoints?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseePoints } }
      ) => {
        return { filterMasterFranchiseePoints };
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
      before: data?.filterMasterFranchiseePoints?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseePoints } }
      ) => {
        return { filterMasterFranchiseePoints };
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
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseePoints } }
      ) => {
        return {
          filterMasterFranchiseePoints,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterMasterFranchiseePoints?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterMasterFranchiseePoints?.pageInfo?.hasNextPage &&
    data?.filterMasterFranchiseePoints?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterMasterFranchiseePoints?.pageInfo?.hasPreviousPage &&
    data?.filterMasterFranchiseePoints?.pageInfo?.startCursor
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
          { fetchMoreResult: { filterMasterFranchiseePoints } }
        ) => {
          return {
            filterMasterFranchiseePoints,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const [showPointsTransferModal, setShowPointsTransferModal] = useState<{
    open: boolean;
    masterFranchiseeId: number;
  } | null>(null);

  const closeConfirmModal = () => {
    setShowPointsTransferModal(null);
  };

  const onSubmit: (
    type: string,
    points: number,
    remarks: string | null | undefined,
    onClose: () => void
  ) => void = (type, points, remarks, onClose) => {
    showPointsTransferModal?.masterFranchiseeId &&
      createMutation({
        variables: {
          type:
            type === "Add Points"
              ? "Add points transfer"
              : "Deduct Points"
              ? "Deduct points transfer"
              : "",
          points,
          masterFranchiseeInformationId:
            showPointsTransferModal?.masterFranchiseeId,
          remarks: remarks?.trim() || undefined,
        },
      })
        .then(({ data }) => {
          if (data?.createMasterFranchiseePointsTransaction?.id) {
            onClose();
            toastNotification([
              {
                message: "Points transferred successfully.",
                messageType: "success",
              },
            ]);

            updateQuery(({ filterMasterFranchiseePoints }) => {
              return {
                filterMasterFranchiseePoints: {
                  pageInfo: filterMasterFranchiseePoints?.pageInfo,
                  edges: filterMasterFranchiseePoints?.edges?.map((edge) => {
                    if (
                      edge?.node &&
                      edge?.node?.id ===
                        data?.createMasterFranchiseePointsTransaction
                          ?.masterFranchiseePoint?.id
                    ) {
                      return {
                        node: {
                          ...edge?.node,
                          pointsAvailable:
                            data?.createMasterFranchiseePointsTransaction
                              ?.masterFranchiseePoint?.pointsAvailable,
                        },
                      };
                    } else {
                      return {
                        node: edge?.node,
                      };
                    }
                  }),
                },
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

  const kebabMenuList = canTransferPoints
    ? [{ id: "View" }, { id: "Create Points Transfer" }]
    : [{ id: "View" }];

  const kebabMenuAction = (value: any, item: any) => {
    if (item?.id) {
      switch (value?.id) {
        case "View": {
          item?.masterFranchiseeId?.masterFranchiseeId &&
            navigate({
              to: "/points-management/$masterFranchiseeId/history",
              params: {
                masterFranchiseeId: `${item?.masterFranchiseeId?.masterFranchiseeId}`,
              },
            });

          break;
        }

        case "Create Points Transfer": {
          item?.masterFranchiseeId?.masterFranchiseeId &&
            setShowPointsTransferModal({
              open: true,
              masterFranchiseeId: +item?.masterFranchiseeId?.masterFranchiseeId,
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
          response?.data?.generateMFPointCSV !== null &&
          response?.data?.generateMFPointCSV !== undefined &&
          response?.data?.generateMFPointCSV?.length > 5
        ) {
          fileDownload(response?.data?.generateMFPointCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  return (
    <Fragment>
      {isMasterFranchisee ? (
        <TransactionHistory isMasterFranchisee={isMasterFranchisee} />
      ) : (
        <div className="space-y-6 w-full sm:max-w-6xl">
          <div className="flex justify-between gap-2 py-2">
            <TitleAndBreadcrumb
              title="Points"
              breadcrumbs={[
                { name: "Home", to: "/dash-board" },
                {
                  name: "Points",
                  to: "/points-management",
                },
              ]}
            />
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 w-full">
            <div className="flex justify-center items-center md:justify-start flex-wrap gap-3 flex-1">
              <InputField
                control={control}
                name="search"
                type="search"
                debounceOnChange={onSearchChange}
                variant="small"
                className="min-w-[220px] max-w-[220px]"
              />
              <DateField
                control={control}
                name="date"
                label="Date Range"
                type="date-range"
                className="min-w-[330px] max-w-[330px]"
                classNameForDateRangePicker="min-h-[38px]"
              />
            </div>
            {canDownloadCSV && totalCount > 0 && (
              <Button
                variant="outlined"
                onPress={generateCSVHandler}
                className={
                  "min-w-[220px] md:min-w-min w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
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
            name="Points"
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
                    <Cell className={"px-4 last:px-0"}>
                      {item[column?.id] ? (
                        item[column?.id] === "action" ? (
                          <TableAction
                            type="kebab"
                            items={kebabMenuList}
                            onAction={(value) => {
                              kebabMenuAction(value, item);
                            }}
                          />
                        ) : column?.id === "masterFranchiseeId" ? (
                          <span>
                            {typeof item?.masterFranchiseeId === "string"
                              ? "-"
                              : item?.masterFranchiseeId?.masterFranchiseeName}
                          </span>
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
          {showPointsTransferModal?.open ? (
            <CreatePointsTransferModal
              isOpen={showPointsTransferModal?.open ? true : false}
              onClose={closeConfirmModal}
              loading={createPointsTransferLoading}
              onSubmit={onSubmit}
              isAdmin={isAdmin}
            />
          ) : null}
        </div>
      )}
    </Fragment>
  );
};

export default Points;
