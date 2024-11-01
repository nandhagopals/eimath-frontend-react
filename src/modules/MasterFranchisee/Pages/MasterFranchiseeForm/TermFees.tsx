import { FC, useState } from "react";
import { Cell, Row } from "react-aria-components";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { Button } from "components/Buttons";
import { Body, Head, Table, TableAction } from "components/Table";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";
import { useAllowedResource, useFormWithZod, usePreLoading } from "global/hook";

import {
  FILTER_MASTER_FRANCHISEE_TERM_FEES,
  UPDATE_MASTER_FRANCHISEE_TERM_FEE,
  FilterMasterFranchiseeTermFeesArgs,
  MasterFranchiseeTermFee,
  MasterFranchiseeTermFeeFieldArgs,
  Page,
  RemarksModal,
  masterFranchiseeTermFeesSortBySchema,
  EditPriceOrPointModal,
  MasterFranchiseeInformation,
} from "modules/MasterFranchisee";

const fieldArgs: MasterFranchiseeTermFeeFieldArgs = {
  isMasterFranchiseeTermFeeEducationalTermNeed: true,
  isMasterFranchiseeTermFeePriceNeed: true,
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
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

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

  const { infoId } = useParams({
    from: "/private-layout/master-franchisee/$infoId",
  });

  const { control } = useFormWithZod({
    schema: z.object({
      pageSize: z.number(),
      sortBy: masterFranchiseeTermFeesSortBySchema,
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [watchPageSize, watchSortBy] = useWatch({
    control,
    name: ["pageSize", "sortBy"],
  });

  const commonQueryArgs: FilterMasterFranchiseeTermFeesArgs = {
    ...fieldArgs,
    pagination: { size: watchPageSize },
    filter: {
      masterFranchiseeId: {
        number: +infoId,
      },
      educationalTermStatus: {
        inArray: ["Active"],
      },
    },
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
  };

  const { data, loading, fetchMore } = useQuery(
    FILTER_MASTER_FRANCHISEE_TERM_FEES,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: infoId && !Number.isNaN(+infoId) ? false : true,
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

  return (
    <div className="mt-6">
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
          variant="outlined"
          className={"w-min shadow-none"}
          onPress={() => {
            navigate({
              to: "/master-franchisee",
            });
          }}
        >
          CANCEL
        </Button>
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
