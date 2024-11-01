import { FC, useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";

import { Button } from "components/Buttons";
import { Body, Head, Table, TableAction } from "components/Table";
import { InputField } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  fileDownload,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_MASTER_FRANCHISEE_WORK_BOOK_FEES,
  UPDATE_MASTER_FRANCHISEE_WORK_BOOK_FEE,
  FilterMasterFranchiseeWorkBookFeesArgs,
  MasterFranchiseeWorkBookFee,
  MasterFranchiseeWorkBookFeeFieldArgs,
  RemarksModal,
  masterFranchiseeWorkBookFeesSortBySchema,
  EditPriceOrPointModal,
  GENERATE_MASTER_FRANCHISEE_WORKBOOK_FEE_CSV,
  MasterFranchiseeInformation,
} from "modules/MasterFranchisee";
import { Page } from "modules/MasterFranchiseeMasterSetting";
import { Country, CountryField } from "modules/Settings/Country";

const fieldArgs: MasterFranchiseeWorkBookFeeFieldArgs = {
  isMasterFranchiseeWorkBookFeePriceNeed: true,
  isMasterFranchiseeWorkBookFeeWorkBookInformationNeed: true,
};

interface Props {
  navigateMasterFranchiseeTabHandler: (page: Page) => void;
  masterFranchiseeInformation: MasterFranchiseeInformation | null | undefined;
}

const WorkBookFees: FC<Props> = ({
  navigateMasterFranchiseeTabHandler,
  masterFranchiseeInformation,
}) => {
  const { canUpdate } = useAllowedResource("MasterFranchiseeWorkBook", true);
  const canDownloadCSV = useAllowedResource("DownloadMasterFranchiseeWorkBook");
  const { authUserDetails } = useAuth();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const infoId =
    authUserDetails?.type === "MF Owner" || authUserDetails?.type === "MF Staff"
      ? authUserDetails?.id
      : null;

  const tableHeaders = canUpdate
    ? [
        { name: "ID", id: "id" as const, isRowHeader: true },
        { name: "Name", id: "name" as const },
        { name: "Country", id: "country" as const, hideSort: true },
        {
          name: `Price ${
            masterFranchiseeInformation?.currencyCountry?.currency
              ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
              : ""
          }`,
          id: "price" as const,
        },
        { name: "Remarks", id: "remarks" as const, hideSort: true },
        { name: "Actions", id: "action" as const, hideSort: true },
      ]
    : [
        { name: "ID", id: "id" as const, isRowHeader: true },
        { name: "Name", id: "name" as const },
        { name: "Country", id: "country" as const, hideSort: true },
        {
          name: `Price ${
            masterFranchiseeInformation?.currencyCountry?.currency
              ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
              : ""
          }`,
          id: "price" as const,
        },
        { name: "Remarks", id: "remarks" as const, hideSort: true },
      ];

  const { control } = useFormWithZod({
    schema: z.object({
      pageSize: z.number(),
      sortBy: masterFranchiseeWorkBookFeesSortBySchema,
      country: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .nullish(),
      search: z.string().nullable(),
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
      country: null,
      search: "",
    },
  });

  const [watchPageSize, watchSortBy, watchCountry, watchSearch] = useWatch({
    control,
    name: ["pageSize", "sortBy", "country", "search"],
  });

  const commonQueryArgs: FilterMasterFranchiseeWorkBookFeesArgs = useMemo(
    () => ({
      ...fieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        masterFranchiseeId: {
          number: infoId ? +infoId : undefined,
        },
        workbookInformationStatus: {
          inArray: ["Active"],
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
            column:
              watchSortBy?.column === "name"
                ? ("workbookInformation" as unknown as "name")
                : watchSortBy?.column,
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField: watchSortBy?.column === "name" ? "name" : undefined,
          }
        : undefined,
    }),
    [watchCountry?.id, watchSortBy?.column, watchSortBy?.direction]
  );

  const { data, loading, fetchMore } = useQuery(
    FILTER_MASTER_FRANCHISEE_WORK_BOOK_FEES,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: watchSearch
        ? true
        : infoId && !Number.isNaN(+infoId)
        ? false
        : true,
    }
  );

  const [confirmModal, setConfirmModal] = useState<
    | { type: "editModal"; workBookFee: MasterFranchiseeWorkBookFee }
    | { type: "remarks"; remarks: string | undefined | null }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_FRANCHISEE_WORK_BOOK_FEE
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_MASTER_FRANCHISEE_WORKBOOK_FEE_CSV
  );

  const onSubmit: (value: number, onClose: () => void) => void = (
    value,
    onClose
  ) => {
    if (confirmModal?.type === "editModal" && confirmModal?.workBookFee?.id) {
      updateMutation({
        variables: {
          id: confirmModal?.workBookFee?.id,
          price: value,
        },
      })
        .then(({ data }) => {
          if (data?.updateMasterFranchiseeWorkBookFee?.id) {
            onClose();
          } else {
            toastNotification([
              {
                message: "Something went wrong.",
                messageType: "error",
              },
            ]);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }
  };

  const rows =
    data?.filterMasterFranchiseeWorkBookFees?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.workBookInformation
        ? edge?.node?.workBookInformation?.name
        : edge?.node?.termInformation?.name,
      country: edge?.node?.workBookInformation
        ? edge?.node?.workBookInformation?.country?.name
        : edge?.node?.termInformation?.country?.name,
      price:
        edge?.node?.price && Number.isInteger(edge?.node?.price)
          ? edge?.node?.price
          : edge?.node?.price && edge?.node?.price?.toFixed(2),
      remarks: edge?.node?.workBookInformation
        ? edge?.node?.workBookInformation?.remarks
        : edge?.node?.termInformation?.remarks,
      action: "action" as const,
      workBookFee: edge?.node,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.endCursor,
    };
    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeWorkBookFees } }
      ) => {
        return { filterMasterFranchiseeWorkBookFees };
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
      before: data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeWorkBookFees } }
      ) => {
        return { filterMasterFranchiseeWorkBookFees };
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
        { fetchMoreResult: { filterMasterFranchiseeWorkBookFees } }
      ) => {
        return {
          filterMasterFranchiseeWorkBookFees,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.hasNextPage &&
    data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.hasPreviousPage &&
    data?.filterMasterFranchiseeWorkBookFees?.pageInfo?.startCursor
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
          { fetchMoreResult: { filterMasterFranchiseeWorkBookFees } }
        ) => {
          return {
            filterMasterFranchiseeWorkBookFees,
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
        { fetchMoreResult: { filterMasterFranchiseeWorkBookFees } }
      ) => {
        return {
          filterMasterFranchiseeWorkBookFees,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const generateCSVHandler = () => {
    if (infoId) {
      generateCSV({
        variables: {
          masterFranchiseeId: infoId,
        },
      })
        .then((response) => {
          if (
            response?.data?.generateMFWorkbookCSV !== null &&
            response?.data?.generateMFWorkbookCSV !== undefined &&
            response?.data?.generateMFWorkbookCSV !== "No data found" &&
            response?.data?.generateMFWorkbookCSV?.length > 5
          ) {
            fileDownload(response?.data?.generateMFWorkbookCSV);
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

  return (
    <div className="mt-6">
      <div className="flex justify-between gap-2 flex-col sm:flex-row items-center mb-8 pt-2">
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
              "min-w-[220px] w-min h-min flex items-center justify-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px] shadow-none"
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
        name="Work book fees"
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
          className={"text-[14px] leading-5 tracking-[.17px]"}
        >
          {(item) => (
            <Row
              columns={tableHeaders}
              className={
                "hover:bg-action-hover focus:outline-none border-y last:border-b-transparent"
              }
            >
              {(column) => (
                <Cell className={"px-4 last:px-1 py-1"}>
                  {column?.id === "remarks" ? (
                    <button
                      key={item?.id}
                      type="button"
                      className="text-primary-main font-normal text-base underline"
                      onClick={() => {
                        setConfirmModal({
                          type: "remarks",
                          remarks: item[column?.id],
                        });
                      }}
                    >
                      View
                    </button>
                  ) : item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="pencil"
                        onAction={() => {
                          setConfirmModal({
                            type: "editModal",
                            workBookFee: item["workBookFee"]!,
                          });
                        }}
                      />
                    ) : item[column?.id] ? (
                      item[column?.id]
                    ) : (
                      "-"
                    )
                  ) : (
                    "-"
                  )}
                </Cell>
              )}
            </Row>
          )}
        </Body>
      </Table>
      <div className="flex justify-end gap-2.5 mt-16">
        <Button
          className={"w-min"}
          onPress={() => {
            navigateMasterFranchiseeTabHandler("PRODUCT FEES");
          }}
        >
          NEXT
        </Button>
      </div>
      {confirmModal?.type === "remarks" ? (
        <RemarksModal
          isOpen={confirmModal?.type === "remarks"}
          onClose={closeConfirmModal}
          remark={confirmModal?.remarks}
        />
      ) : null}
      {confirmModal?.type === "editModal" ? (
        <EditPriceOrPointModal
          isOpen={confirmModal?.type === "editModal"}
          onClose={closeConfirmModal}
          loading={updateLoading}
          onSubmit={onSubmit}
          value={{
            page: "work-book-fee",
            workBookFee: confirmModal?.workBookFee,
          }}
          masterFranchiseeInformation={masterFranchiseeInformation}
        />
      ) : null}
    </div>
  );
};

export default WorkBookFees;
