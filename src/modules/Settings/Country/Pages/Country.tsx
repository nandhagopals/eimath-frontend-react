import { useCallback, useState } from "react";
import { Cell, Row } from "react-aria-components";
import {
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from "@apollo/client";
import { z } from "zod";
import { useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { InputField, Switch } from "components/Form";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useFormWithZod, usePreLoading } from "global/hook";
import { messageHelper, somethingWentWrongMessage } from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";

import {
  DELETE_COUNTRY,
  FILTER_COUNTRIES,
  UPDATE_COUNTRY,
} from "modules/Settings/Country";

const fieldArgs = {
  isCountryCodeNeed: true,
  isCountryCurrencyNeed: true,
  isCountryIsdCodeNeed: true,
  isCountryStatusNeed: true,
};

const headers = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Code", id: "code" },
  { name: "ISD code", id: "isdCode" },
  { name: "Currency", id: "currency" },
  { name: "Status", id: "status" },
  { name: "Actions", id: "action" },
];

const Country = () => {
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: z.object({
      search: z.string().nullable(),
      pageSize: z.number(),
      status: z.record(z.number(), z.boolean()),
    }),
    defaultValues: {
      pageSize: defaultPageSize,
      search: "",
      status: {},
    },
  });

  const [watchSearch, watchPageSize] = useWatch({
    control,
    name: ["search", "pageSize"],
  });

  const [showUpdateStatus, setShowUpdateStatus] = useState<{
    id: number;
    status: string;
  } | null>(null);

  const { data, loading, fetchMore, updateQuery } = useQuery(FILTER_COUNTRIES, {
    variables: { ...fieldArgs, pagination: { size: watchPageSize } },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [fetchCountries, { loading: countriesLoading }] = useLazyQuery(
    FILTER_COUNTRIES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
    }
  );

  const [deleteCountry, { loading: deleteCountryLoading }] =
    useMutation(DELETE_COUNTRY);

  const closeConfirmDelete = () => {
    setShowUpdateStatus(null);
    setDeleteCountryID(null);
  };

  const [updateCountry, { loading: updateStatusLoading }] =
    useMutation(UPDATE_COUNTRY);

  const rows =
    data?.filterCountries?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      code: edge?.node?.code,
      isdCode: edge?.node?.isdCode,
      currency: edge?.node?.currency,
      status: edge?.node?.status,
      action: "action" as const,
    })) || [];

  const onNext =() => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          after: data?.filterCountries?.pageInfo?.endCursor,
        },
        globalSearch: watchSearch || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterCountries } }) => {
        return { filterCountries };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev =() => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          before: data?.filterCountries?.pageInfo?.startCursor,
        },
        globalSearch: watchSearch || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterCountries } }) => {
        return { filterCountries };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void =(page) => {
    fetchMore({
      variables: {
        pagination: {
          size: page,
        },
        globalSearch: watchSearch || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterCountries } }) => {
        return {
          filterCountries,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount = data?.filterCountries?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterCountries?.pageInfo?.hasNextPage &&
    data?.filterCountries?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterCountries?.pageInfo?.hasPreviousPage &&
    data?.filterCountries?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading || countriesLoading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      fetchMore({
        variables: {
          pagination: {
            size: watchPageSize,
          },
          globalSearch: search || undefined,
          ...fieldArgs,
        },
        updateQuery: (_, { fetchMoreResult: { filterCountries } }) => {
          return {
            filterCountries,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, [watchPageSize]);

  const deleteHandler = () => {
    if (deleteCountryID) {
      deleteCountry({
        variables: {
          id: deleteCountryID,
        },
      })
        .then((res) => {
          if (res?.data?.deleteCountry) {
            closeConfirmDelete();

            if (data?.filterCountries?.edges?.length === 1) {
              resetField("search", {
                defaultValue: "",
              });
              resetField("pageSize", {
                defaultValue: defaultPageSize,
              });

              fetchMore({
                variables: {
                  pagination: {
                    size: defaultPageSize,
                  },
                },
                updateQuery: (_, { fetchMoreResult: { filterCountries } }) => {
                  return {
                    filterCountries,
                  };
                },
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });
            } else if (data?.filterCountries?.pageInfo?.hasNextPage) {
              const deleteItemIndex = data?.filterCountries?.edges?.findIndex(
                (edgeDetails) => edgeDetails?.node?.id === +deleteCountryID
              );

              const nextPointCursorData =
                (deleteItemIndex || 0) + 1 === watchPageSize
                  ? data &&
                    data?.filterCountries &&
                    data.filterCountries?.edges &&
                    data.filterCountries?.edges[(deleteItemIndex || 0) - 1]
                  : null;

              fetchCountries({
                variables: {
                  ...fieldArgs,
                  pagination: {
                    size: 1,
                    after:
                      nextPointCursorData?.cursor ||
                      data?.filterCountries?.pageInfo?.endCursor,
                  },
                },
              }).then((refetchRes) => {
                if (refetchRes?.data?.filterCountries?.edges?.length === 1) {
                  updateQuery(({ filterCountries }) => {
                    const olderRecord =
                      filterCountries?.edges?.filter(
                        (edgeDetails) =>
                          edgeDetails?.node?.id !== deleteCountryID
                      ) || [];
                    return {
                      filterCountries: filterCountries
                        ? {
                            pageInfo: refetchRes?.data?.filterCountries
                              ?.pageInfo
                              ? {
                                  ...filterCountries?.pageInfo,
                                  endCursor:
                                    refetchRes?.data?.filterCountries?.pageInfo
                                      ?.endCursor,
                                  hasNextPage:
                                    refetchRes?.data?.filterCountries?.pageInfo
                                      ?.hasNextPage,
                                  totalNumberOfItems:
                                    refetchRes?.data?.filterCountries?.pageInfo
                                      ?.totalNumberOfItems,
                                }
                              : null,
                            edges:
                              refetchRes?.data?.filterCountries?.edges &&
                              refetchRes?.data?.filterCountries?.edges?.length >
                                0
                                ? [
                                    ...olderRecord,
                                    ...(refetchRes?.data?.filterCountries
                                      ?.edges || []),
                                  ]
                                : [],
                            __typename: filterCountries?.__typename,
                          }
                        : null,
                    };
                  });
                }
              });
            } else {
              updateQuery(({ filterCountries }) => {
                return {
                  filterCountries: filterCountries
                    ? {
                        pageInfo: filterCountries?.pageInfo
                          ? {
                              ...filterCountries?.pageInfo,
                              totalNumberOfItems: filterCountries?.pageInfo
                                ?.totalNumberOfItems
                                ? filterCountries?.pageInfo
                                    ?.totalNumberOfItems - 1
                                : 0,
                            }
                          : null,
                        edges:
                          filterCountries?.edges &&
                          filterCountries?.edges?.length > 0
                            ? filterCountries?.edges?.filter(
                                (edge) => edge?.node?.id !== deleteCountryID
                              ) || []
                            : [],
                        __typename: filterCountries?.__typename,
                      }
                    : null,
                };
              });
            }
          }
        })
        .catch((error) => {
          if (error?.message === "Deletion fails, It was already in use.") {
            setShowUpdateStatus({
              id: deleteCountryID,
              status:
                data?.filterCountries?.edges?.filter(
                  (edgeDetails) => edgeDetails?.node?.id === deleteCountryID
                )?.[0]?.node?.status || "",
            });
            setDeleteCountryID(null);
          } else {
            toastNotification(messageHelper(error));
          }
        });
    }
  };

  const [deleteCountryID, setDeleteCountryID] = useState<number | null>(null);

  const updateStatus = (itemId: number, status: "Active" | "Inactive") => {
    updateCountry({
      variables: {
        id: itemId,
        status: status,
        isCountryStatusNeed: true,
      },
    })
      .then((res) => {
        if (res?.data?.updateCountry) {
          updateQuery(({ filterCountries }) => {
            return {
              filterCountries: filterCountries
                ? {
                    pageInfo: filterCountries?.pageInfo
                      ? {
                          ...filterCountries?.pageInfo,
                          totalNumberOfItems: filterCountries?.pageInfo
                            ?.totalNumberOfItems
                            ? filterCountries?.pageInfo?.totalNumberOfItems - 1
                            : 0,
                        }
                      : null,
                    edges:
                      filterCountries?.edges &&
                      filterCountries?.edges?.length > 0
                        ? filterCountries?.edges?.map((edge) => {
                            if (edge?.node?.id === itemId) {
                              return {
                                node: {
                                  id: itemId,
                                  ...edge?.node,
                                  status: res?.data?.updateCountry?.status,
                                },
                                cursor: edge?.cursor,
                              };
                            }
                            return edge;
                          }) || []
                        : [],
                    __typename: filterCountries?.__typename,
                  }
                : null,
            };
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resetField(`status.${itemId}` as any, {
            defaultValue: res?.data?.updateCountry?.status === "Active",
          });

          if (showUpdateStatus?.id) {
            setShowUpdateStatus(null);
          }
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resetField(`status.${itemId}` as any);
      });
  };

  return (
    <div className="space-y-6 w-full sm:max-w-5xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Countries"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Master Setting",
              to: "/settings/countries",
            },
            {
              name: "Countries",
              to: "/settings/countries",
            },
          ]}
        />
        <Button
          onPress={() => {
            navigate({
              to: "/settings/countries/$countryId",
              params: {
                countryId: "new",
              },
            });
          }}
          className={"w-max h-min flex items-center gap-2 px-4 uppercase"}
        >
          <AddIcon />
          Add Country
        </Button>
      </div>

      <InputField
        name={"search"}
        control={control}
        debounceOnChange={onSearchChange}
        variant="small"
        type="search"
      />
      <Table
        name="Countries"
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
        <Head headers={headers} />
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
                <Cell className={"px-4 last:px-0"}>
                  {item[column?.id] ? (
                    item[column?.id] === "action" ? (
                      <TableAction
                        type="kebab"
                        items={[{ id: "View/Edit" }, { id: "Delete" }] as const}
                        onAction={(value) => {
                          if (value?.id === "View/Edit" && item?.id) {
                            navigate({
                              to: "/settings/countries/$countryId",
                              params: {
                                countryId: item?.id?.toString(),
                              },
                            });
                          } else if (value?.id === "Delete" && item?.id) {
                            setDeleteCountryID(item?.id);
                          }
                        }}
                      />
                    ) : column?.id === "status" ? (
                      <Switch
                        key={item.id}
                        control={control}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        name={`status.${item?.id}` as any}
                        onChange={(status) => {
                          if (item?.id) {
                            updateStatus(
                              item?.id,
                              status ? "Active" : "Inactive"
                            );
                          }
                        }}
                        defaultValue={item[column?.id] === "Active"}
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

      <ConfirmModal
        message={"Confirm delete?"}
        onClose={closeConfirmDelete}
        button={{
          primary: {
            loading: deleteCountryLoading,
            onPress: deleteHandler,
          },
          secondary: {
            isDisabled: deleteCountryLoading,
          },
        }}
        isOpen={!!deleteCountryID}
        loading={deleteCountryLoading}
      />

      <ConfirmModal
        message={`The selected country can't be deleted because it is currently in use else where in the application. ${
          showUpdateStatus?.status === "Inactive"
            ? ""
            : "Would you link to disable the country instead of deleting it?"
        }`}
        onClose={closeConfirmDelete}
        button={{
          primary:
            showUpdateStatus?.status === "Inactive"
              ? undefined
              : {
                  loading: updateStatusLoading,
                  onPress: () => {
                    if (showUpdateStatus?.id) {
                      updateStatus(showUpdateStatus?.id, "Inactive");
                    }
                  },
                  children: "DISABLE COUNTRY",
                },
          secondary: {
            isDisabled: updateStatusLoading,
            children:
              showUpdateStatus?.status === "Inactive" ? "CLOSE" : "CANCEL",
            className: showUpdateStatus?.status === "Inactive" ? "w-min" : "",
          },
        }}
        isOpen={!!showUpdateStatus?.id}
        loading={updateStatusLoading}
        className={"w-auto"}
        modalClassName={"md:w-2/4 px-4 xl:px-20"}
      />
    </div>
  );
};

export default Country;
