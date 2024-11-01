import { FC, useCallback, useMemo, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useWatch } from "react-hook-form";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { z } from "zod";

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
  FILTER_MASTER_FRANCHISEE_TERM_FEES,
  UPDATE_MASTER_FRANCHISEE_TERM_FEE,
  FilterMasterFranchiseeTermFeesArgs,
  MasterFranchiseeTermFee,
  MasterFranchiseeTermFeeFieldArgs,
  RemarksModal,
  EditPriceOrPointModal,
  masterFranchiseeTermFeesSortBySchema,
  GENERATE_MASTER_FRANCHISEE_TERMS_FEE_CSV,
  MasterFranchiseeInformation,
} from "modules/MasterFranchisee";
import { Page } from "modules/MasterFranchiseeMasterSetting";
import { Country, CountryField } from "modules/Settings/Country";

const fieldArgs: MasterFranchiseeTermFeeFieldArgs = {
  isMasterFranchiseeTermFeeEducationalTermNeed: true,
  isMasterFranchiseeTermFeePriceNeed: true,
  isMasterFranchiseeTermFeeEducationalTermWorkbookNeed: true,
};

interface Props {
  navigateMasterFranchiseeTabHandler: (page: Page) => void;
  masterFranchiseeInformation: MasterFranchiseeInformation | null | undefined;
}

const TermFees: FC<Props> = ({
  navigateMasterFranchiseeTabHandler,
  masterFranchiseeInformation,
}) => {
  const { canUpdate } = useAllowedResource(
    "MasterFranchiseeEducationalTerm",
    true
  );
  const canDownloadCSV = useAllowedResource(
    "DownloadMasterFranchiseeEducationalTerm"
  );
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
        { name: "Workbooks", id: "workbooks" as const, hideSort: true },
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
        { name: "Workbooks", id: "workbooks" as const, hideSort: true },
      ];

  const { control } = useFormWithZod({
    schema: z.object({
      pageSize: z.number(),
      sortBy: masterFranchiseeTermFeesSortBySchema,
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

  const commonQueryArgs: FilterMasterFranchiseeTermFeesArgs = useMemo(
    () => ({
      ...fieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        masterFranchiseeId: {
          number: infoId ? +infoId : undefined,
        },
        educationalTermStatus: {
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
                ? ("educationalTerm" as unknown as "name")
                : watchSortBy?.column,
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField: watchSortBy?.column === "name" ? "name" : undefined,
          }
        : undefined,
    }),
    [watchSortBy?.column, watchSortBy?.direction, watchCountry?.id]
  );

  const { data, loading, fetchMore } = useQuery(
    FILTER_MASTER_FRANCHISEE_TERM_FEES,
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
    | { type: "editModal"; termFee: MasterFranchiseeTermFee }
    | { type: "remarks"; remarks: string | undefined | null }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_FRANCHISEE_TERM_FEE
  );

  const [generateCSV, { loading: csvFileLoading }] = useMutation(
    GENERATE_MASTER_FRANCHISEE_TERMS_FEE_CSV
  );

  const onSubmit: (value: number, onClose: () => void) => void = (
    value,
    onClose
  ) => {
    if (confirmModal?.type === "editModal" && confirmModal?.termFee?.id) {
      updateMutation({
        variables: {
          id: confirmModal?.termFee?.id,
          price: value,
        },
      })
        .then(({ data }) => {
          if (data?.updateMasterFranchiseeTermFee?.id) {
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
    data?.filterMasterFranchiseeTermFees?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.educationalTerm?.name,
      country: edge?.node?.educationalTerm?.country?.name,
      price:
        edge?.node?.price && Number.isInteger(edge?.node?.price)
          ? edge?.node?.price
          : edge?.node?.price && edge?.node?.price?.toFixed(2),
      remarks: edge?.node?.educationalTerm?.remarks,
      action: "action" as const,
      termFee: edge?.node,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterMasterFranchiseeTermFees?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeTermFees } }
      ) => {
        return { filterMasterFranchiseeTermFees };
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
      before: data?.filterMasterFranchiseeTermFees?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (
        _,
        { fetchMoreResult: { filterMasterFranchiseeTermFees } }
      ) => {
        return { filterMasterFranchiseeTermFees };
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
        { fetchMoreResult: { filterMasterFranchiseeTermFees } }
      ) => {
        return {
          filterMasterFranchiseeTermFees,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterMasterFranchiseeTermFees?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterMasterFranchiseeTermFees?.pageInfo?.hasNextPage &&
    data?.filterMasterFranchiseeTermFees?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterMasterFranchiseeTermFees?.pageInfo?.hasPreviousPage &&
    data?.filterMasterFranchiseeTermFees?.pageInfo?.startCursor
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
          { fetchMoreResult: { filterMasterFranchiseeTermFees } }
        ) => {
          return {
            filterMasterFranchiseeTermFees,
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
        { fetchMoreResult: { filterMasterFranchiseeTermFees } }
      ) => {
        return {
          filterMasterFranchiseeTermFees,
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
            response?.data?.generateMFEducationalTermCSV !== null &&
            response?.data?.generateMFEducationalTermCSV !== undefined &&
            response?.data?.generateMFEducationalTermCSV !== "No data found" &&
            response?.data?.generateMFEducationalTermCSV?.length > 5
          ) {
            fileDownload(response?.data?.generateMFEducationalTermCSV);
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
        name="Term Fees"
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
                            termFee: item["termFee"]!,
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
            navigateMasterFranchiseeTabHandler("WORKBOOK FEES");
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
          value={{ page: "term-fee", termFee: confirmModal?.termFee }}
          masterFranchiseeInformation={masterFranchiseeInformation}
        />
      ) : null}
    </div>
  );
};

export default TermFees;
