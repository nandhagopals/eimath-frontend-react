import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { useNavigate } from "@tanstack/react-router";
import { paginationDefaultCount, toastNotification } from "global/cache";
import { useFormWithZod, usePreLoading } from "global/hook";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { DELETE_ROLE, FILTER_ROLES } from "../services";
import { messageHelper } from "global/helpers";
import { useState } from "react";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Button } from "components/Buttons";
import AddIcon from "global/assets/images/add-filled.svg?react";
import { InputField } from "components/Form";
import { Body, Head, Table, TableAction } from "components/Table";
import { Cell, Row } from "react-aria-components";
import { ConfirmModal } from "components/Modal";

const fieldArgs = {
  isRoleDescriptionNeed: true,
  isRoleHasFullPrivilegeNeed: true,
  isRoleResourceIdsNeed: true,
};

const headers = [
  { name: "ID", id: "id", isRowHeader: true },
  { name: "Name", id: "name" },
  { name: "Has Full Privilege", id: "hasFullPrivilege" },
  { name: "Description", id: "description" },
  { name: "Actions", id: "action" },
];

const RoleAccess = () => {
  const navigate = useNavigate();
  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, reset } = useFormWithZod({
    schema: z.object({
      search: z.string().nullable(),
      pageSize: z.number(),
    }),
    defaultValues: {
      pageSize: defaultPageSize,
    },
  });

  const [watchSearch, watchPageSize] = useWatch({
    control,
    name: ["search", "pageSize"],
  });

  const { data, loading, fetchMore, updateQuery } = useQuery(FILTER_ROLES, {
    variables: { ...fieldArgs, pagination: { size: watchPageSize } },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const [deleteRole, { loading: deleteRoleLoading }] = useMutation(DELETE_ROLE);

  const closeConfirmDelete = () => {
    setDeleteRoleID(null);
  };

  const rows =
    data?.filterRoles?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      hasFullPrivilege: edge?.node?.hasFullPrivilege ? "Yes" : "No",
      description: edge?.node?.description,
      action: "action" as const,
    })) || [];

  const onNext = () => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          after: data?.filterRoles?.pageInfo?.endCursor,
        },
        globalSearch: watchSearch || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterRoles } }) => {
        return { filterRoles };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
          before: data?.filterRoles?.pageInfo?.startCursor,
        },
        globalSearch: watchSearch || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterRoles } }) => {
        return { filterRoles };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPageSizeChange: (page: number) => void = (page) => {
    fetchMore({
      variables: {
        pagination: {
          size: page,
        },
        globalSearch: watchSearch || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterRoles } }) => {
        return {
          filterRoles,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount = data?.filterRoles?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterRoles?.pageInfo?.hasNextPage &&
    data?.filterRoles?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterRoles?.pageInfo?.hasPreviousPage &&
    data?.filterRoles?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void = (
    search
  ) => {
    fetchMore({
      variables: {
        pagination: {
          size: watchPageSize,
        },
        globalSearch: search || undefined,
        ...fieldArgs,
      },
      updateQuery: (_, { fetchMoreResult: { filterRoles } }) => {
        return {
          filterRoles,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const deleteHandler = () => {
    if (deleteRoleID) {
      deleteRole({
        variables: {
          id: deleteRoleID,
        },
      })
        .then((res) => {
          if (res?.data?.deleteRole) {
            closeConfirmDelete();

            if (data?.filterRoles?.edges?.length === 1) {
              reset({
                search: "",
                pageSize: defaultPageSize,
              });
              fetchMore({
                variables: {
                  pagination: {
                    size: defaultPageSize,
                  },
                },
                updateQuery: (_, { fetchMoreResult: { filterRoles } }) => {
                  return {
                    filterRoles,
                  };
                },
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });
            } else if (data?.filterRoles?.pageInfo?.hasNextPage) {
              const deleteItemIndex = data?.filterRoles?.edges?.findIndex(
                (edgeDetails) => edgeDetails?.node?.id === +deleteRoleID
              );

              const nextPointCursorData =
                (deleteItemIndex || 0) + 1 === watchPageSize
                  ? data &&
                    data?.filterRoles &&
                    data.filterRoles?.edges &&
                    data.filterRoles?.edges[(deleteItemIndex || 0) - 1]
                  : null;

              fetchMore({
                variables: {
                  ...fieldArgs,
                  pagination: {
                    size: watchPageSize,
                    after:
                      nextPointCursorData?.cursor ||
                      data?.filterRoles?.pageInfo?.endCursor,
                  },
                },
              }).then((refetchRes) => {
                if (refetchRes?.data?.filterRoles?.edges?.length === 1) {
                  updateQuery(({ filterRoles }) => {
                    const olderRecord =
                      filterRoles?.edges?.filter(
                        (edgeDetails) => edgeDetails?.node?.id !== deleteRoleID
                      ) || [];
                    return {
                      filterRoles: filterRoles
                        ? {
                            pageInfo: refetchRes?.data?.filterRoles?.pageInfo
                              ? {
                                  ...filterRoles?.pageInfo,
                                  endCursor:
                                    refetchRes?.data?.filterRoles?.pageInfo
                                      ?.endCursor,
                                  hasNextPage:
                                    refetchRes?.data?.filterRoles?.pageInfo
                                      ?.hasNextPage,
                                  totalNumberOfItems:
                                    refetchRes?.data?.filterRoles?.pageInfo
                                      ?.totalNumberOfItems,
                                }
                              : null,
                            edges:
                              refetchRes?.data?.filterRoles?.edges &&
                              refetchRes?.data?.filterRoles?.edges?.length > 0
                                ? [
                                    ...olderRecord,
                                    ...(refetchRes?.data?.filterRoles?.edges ||
                                      []),
                                  ]
                                : [],
                            __typename: filterRoles?.__typename,
                          }
                        : null,
                    };
                  });
                }
              });
            } else {
              updateQuery(({ filterRoles }) => {
                return {
                  filterRoles: filterRoles
                    ? {
                        pageInfo: filterRoles?.pageInfo
                          ? {
                              ...filterRoles?.pageInfo,
                              totalNumberOfItems: filterRoles?.pageInfo
                                ?.totalNumberOfItems
                                ? filterRoles?.pageInfo?.totalNumberOfItems - 1
                                : 0,
                            }
                          : null,
                        edges:
                          filterRoles?.edges && filterRoles?.edges?.length > 0
                            ? filterRoles?.edges?.filter(
                                (edge) => edge?.node?.id !== deleteRoleID
                              ) || []
                            : [],
                        __typename: filterRoles?.__typename,
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
  };

  const [deleteRoleID, setDeleteRoleID] = useState<number | null>(null);

  return (
    <div className="space-y-6 w-full sm:max-w-5xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Role & Access"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Accounts",
              to: "/accounts/role-access",
            },
            {
              name: "Role & Access",
              to: "/accounts/role-access",
            },
          ]}
        />
        <Button
          onPress={() => {
            navigate({
              to: "/accounts/role-access/$roleAccessId",
              params: {
                roleAccessId: "new",
              },
            });
          }}
          className={"w-min h-min flex items-center gap-2 px-4"}
        >
          <AddIcon />
          Add
        </Button>
      </div>
      <InputField
        type="search"
        control={control}
        debounceOnChange={onSearchChange}
        name="search"
        variant="small"
      />
      <Table
        name="Role & Access"
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
                              to: "/accounts/role-access/$roleAccessId",
                              params: {
                                roleAccessId: item?.id?.toString(),
                              },
                            });
                          } else if (value?.id === "Delete" && item?.id) {
                            setDeleteRoleID(item?.id);
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

      <ConfirmModal
        message="Confirm Delete?"
        onClose={closeConfirmDelete}
        button={{
          primary: { loading: deleteRoleLoading, onPress: deleteHandler },
          secondary: {
            isDisabled: deleteRoleLoading,
          },
        }}
        isOpen={!!deleteRoleID}
        loading={deleteRoleLoading}
      />
    </div>
  );
};

export default RoleAccess;
