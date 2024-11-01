import { FC, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Cell, Row } from "react-aria-components";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";

import { ConfirmModal, Modal } from "components/Modal";
import { Body, Head, Table } from "components/Table";
import { TextArea } from "components/Form";
import { Button } from "components/Buttons";

import { useFormWithZod, usePreLoading } from "global/hook";
import { toastNotification } from "global/cache";
import {
  formatDate,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";
import PencilIcon from "global/assets/images/pencil-filled.svg?react";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";
import AddIcon from "global/assets/images/add-filled.svg?react";
import CancelIcon from "global/assets/images/close-filled.svg?react";

import {
  DELETE_STUDENT_REMARK,
  FILTER_STUDENT_REMARKS,
  UPDATE_STUDENT_REMARK,
  FilterStudentRemarksArgs,
  RemarksFilterAndFormSchema,
  remarksFilterAndFormSchema,
  CREATE_STUDENT_REMARK,
} from "modules/Students";

const tableHeaders = [
  {
    name: "ID",
    id: "id" as const,
    isRowHeader: true,
  },
  { name: "Remarks", id: "remarks" as const },
  { name: "Date", id: "date" as const },
  { name: "Actions", id: "action" as const, hideSort: true },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  defaultPageSize: number;
  canCreateRemark: boolean;
  canUpdateRemark: boolean;
  canDeleteRemark: boolean;
}

const Remarks: FC<Props> = ({
  isOpen,
  onClose,
  studentId,
  defaultPageSize,
  canCreateRemark,
  canUpdateRemark,
  canDeleteRemark,
}) => {
  const [deleteMutation, { loading: deleteLoading }] = useMutation(
    DELETE_STUDENT_REMARK
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_STUDENT_REMARK
  );
  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_STUDENT_REMARK
  );

  const { control, resetField, setValue } = useFormWithZod({
    schema: remarksFilterAndFormSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      remarks: null as unknown as string,
    },
  });
  
  const [watchPageSize] = useWatch({
    control,
    name: ["pageSize"],
  });

  const { data, loading, fetchMore, updateQuery } = useQuery(
    FILTER_STUDENT_REMARKS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        filter: {
          studentId: {
            number: studentId,
          },
        },
        pagination: {
          size: watchPageSize,
        },
      },
    }
  );

  const commonQueryArgs: FilterStudentRemarksArgs = {
    pagination: { size: watchPageSize },
    filter: {
      studentId: {
        number: studentId,
      },
    },
  };

  const rows =
    data?.filterStudentRemarks?.edges?.map((edge) => ({
      id: edge?.node?.id,
      remarks: edge?.node?.remarks,
      date:
        edge?.node?.updatedAt && formatDate(edge?.node?.updatedAt, "dd/MM/yyyy")
          ? formatDate(edge?.node?.updatedAt, "dd/MM/yyyy")
          : null,
      action: "action" as const,
    })) || [];

  const preLoading = usePreLoading(loading);
  const onNext = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterStudentRemarks?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterStudentRemarks } }) => {
        return { filterStudentRemarks };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const onPrev = () => {
    const queryArgs = commonQueryArgs;

    queryArgs.pagination = {
      size: watchPageSize,
      before: data?.filterStudentRemarks?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterStudentRemarks } }) => {
        return { filterStudentRemarks };
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
      updateQuery: (_, { fetchMoreResult: { filterStudentRemarks } }) => {
        return {
          filterStudentRemarks,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount =
    data?.filterStudentRemarks?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterStudentRemarks?.pageInfo?.hasNextPage &&
    data?.filterStudentRemarks?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterStudentRemarks?.pageInfo?.hasPreviousPage &&
    data?.filterStudentRemarks?.pageInfo?.startCursor
      ? true
      : false;

  const [confirmModal, setConfirmModal] = useState<
    | {
        type: "Delete";
        id: number;
      }
    | { type: "update"; id: number }
    | { type: "create" }
    | null
  >(null);

  const closeConfirmModal = () => {
    setConfirmModal(null);
  };

  const confirmHandler = () => {
    if (confirmModal?.type === "Delete") {
      deleteMutation({
        variables: {
          id: confirmModal?.id,
        },
      })
        .then((res) => {
          if (res?.data?.deleteStudentRemark) {
            closeConfirmModal();

            if (data?.filterStudentRemarks?.edges?.length === 1) {
              const queryArgs = commonQueryArgs;

              queryArgs.globalSearch = undefined;

              fetchMore({
                variables: queryArgs,
                updateQuery: (
                  _,
                  { fetchMoreResult: { filterStudentRemarks } }
                ) => {
                  return {
                    filterStudentRemarks,
                  };
                },
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });
            } else if (data?.filterStudentRemarks?.pageInfo?.hasNextPage) {
              const deleteItemIndex =
                data?.filterStudentRemarks?.edges?.findIndex(
                  (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
                );

              const nextPointCursorData =
                (deleteItemIndex || 0) + 1 === watchPageSize
                  ? data &&
                    data?.filterStudentRemarks &&
                    data.filterStudentRemarks?.edges &&
                    data.filterStudentRemarks?.edges[(deleteItemIndex || 0) - 1]
                  : null;

              const queryArgs = commonQueryArgs;

              queryArgs.pagination = {
                size: 1,
                after:
                  nextPointCursorData?.cursor ||
                  data?.filterStudentRemarks?.pageInfo?.endCursor,
              };

              fetchMore({
                variables: queryArgs,
              }).then((refetchRes) => {
                if (
                  refetchRes?.data?.filterStudentRemarks?.edges?.length === 1
                ) {
                  updateQuery(({ filterStudentRemarks }) => {
                    const olderRecord =
                      filterStudentRemarks?.edges?.filter(
                        (edgeDetails) =>
                          edgeDetails?.node?.id !== confirmModal?.id
                      ) || [];
                    return {
                      filterStudentRemarks: filterStudentRemarks
                        ? {
                            pageInfo: refetchRes?.data?.filterStudentRemarks
                              ?.pageInfo
                              ? {
                                  ...filterStudentRemarks?.pageInfo,
                                  endCursor:
                                    refetchRes?.data?.filterStudentRemarks
                                      ?.pageInfo?.endCursor,
                                  hasNextPage:
                                    refetchRes?.data?.filterStudentRemarks
                                      ?.pageInfo?.hasNextPage,
                                  totalNumberOfItems:
                                    refetchRes?.data?.filterStudentRemarks
                                      ?.pageInfo?.totalNumberOfItems,
                                }
                              : null,
                            edges:
                              refetchRes?.data?.filterStudentRemarks?.edges &&
                              refetchRes?.data?.filterStudentRemarks?.edges
                                ?.length > 0
                                ? [
                                    ...olderRecord,
                                    ...(refetchRes?.data?.filterStudentRemarks
                                      ?.edges || []),
                                  ]
                                : [],
                            __typename: filterStudentRemarks?.__typename,
                          }
                        : null,
                    };
                  });
                }
              });
            } else {
              updateQuery(({ filterStudentRemarks }) => {
                return {
                  filterStudentRemarks: filterStudentRemarks
                    ? {
                        pageInfo: filterStudentRemarks?.pageInfo
                          ? {
                              ...filterStudentRemarks?.pageInfo,
                              totalNumberOfItems: filterStudentRemarks?.pageInfo
                                ?.totalNumberOfItems
                                ? filterStudentRemarks?.pageInfo
                                    ?.totalNumberOfItems - 1
                                : 0,
                            }
                          : null,
                        edges:
                          filterStudentRemarks?.edges &&
                          filterStudentRemarks?.edges?.length > 0
                            ? filterStudentRemarks?.edges?.filter(
                                (edge) => edge?.node?.id !== confirmModal?.id
                              ) || []
                            : [],
                        __typename: filterStudentRemarks?.__typename,
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

  const [editModalForm, setEditModalForm] = useState<
    | {
        type: "update";
        remark: string | null | undefined;
        id: number;
      }
    | { type: "create" }
    | null
  >(null);

  const [showEditForm, setShowEditForm] = useState(false);

  const submitHandler: FormSubmitHandler<RemarksFilterAndFormSchema> = ({
    data: { remarks },
  }) => {
    if (editModalForm?.type === "update") {
      updateMutation({
        variables: {
          id: editModalForm?.id,
          remarks,
        },
      })
        .then(({ data }) => {
          if (data?.updateStudentRemark?.id) {
            setEditModalForm(null);
            setConfirmModal(null);
            resetField("remarks");
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else {
      createMutation({
        variables: {
          studentId,
          remarks,
        },
      })
        .then(({ data }) => {
          if (data?.createStudentRemark?.id) {
            updateQuery(({ filterStudentRemarks }) => {
              return {
                filterStudentRemarks: filterStudentRemarks
                  ? {
                      pageInfo: filterStudentRemarks?.pageInfo
                        ? {
                            ...filterStudentRemarks?.pageInfo,
                            totalNumberOfItems: filterStudentRemarks?.pageInfo
                              ?.totalNumberOfItems
                              ? filterStudentRemarks?.pageInfo
                                  ?.totalNumberOfItems + 1
                              : 1,
                          }
                        : null,
                      edges:
                        filterStudentRemarks &&
                        filterStudentRemarks?.edges &&
                        filterStudentRemarks?.edges?.length > 0
                          ? [
                              { node: data?.createStudentRemark },
                              ...filterStudentRemarks.edges,
                            ]
                          : [{ node: data?.createStudentRemark }],
                      __typename: filterStudentRemarks?.__typename,
                    }
                  : null,
              };
            });
            setEditModalForm(null);
            setConfirmModal(null);
            resetField("remarks");
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Remarks"
      modalClassName="p-10 md:p-20 md:py-10 lg:min-w-[959px] max-w-[959px] overflow-x-auto"
    >
      <CancelIcon
        className="cursor-pointer text-secondary-text ml-auto"
        onClick={onClose}
      />
      <div className="flex justify-between items-center my-4">
        <p className="text-xl font-sunbird font-normal text-primary-text">
          Remarks
        </p>
        {canCreateRemark && (
          <Button
            onPress={() => {
              setEditModalForm({
                type: "create",
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            NEW REMARK
          </Button>
        )}
      </div>
      <Table
        name="Student Account"
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
        <Head headers={tableHeaders} />
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
                  {column?.id === "action" ? (
                    canUpdateRemark || canDeleteRemark ? (
                      <div className="flex p-3">
                        {canUpdateRemark && (
                          <PencilIcon
                            onClick={() => {
                              if (item?.id) {
                                setValue(
                                  "remarks",
                                  item?.remarks ?? (null as unknown as string)
                                );
                                setEditModalForm({
                                  type: "update",
                                  id: item?.id,
                                  remark: item?.remarks,
                                });
                                setShowEditForm(false);
                              }
                            }}
                            className="w-5 h-5 text-action-active cursor-pointer"
                          />
                        )}
                        {canDeleteRemark && (
                          <DeleteIcon
                            onClick={() => {
                              if (item?.id) {
                                setConfirmModal({
                                  id: item?.id,
                                  type: "Delete",
                                });
                              }
                            }}
                            className="w-5 h-5 text-action-active cursor-pointer"
                          />
                        )}
                      </div>
                    ) : null
                  ) : item[column?.id] ? (
                    item[column?.id]
                  ) : (
                    "-"
                  )}
                </Cell>
              )}
            </Row>
          )}
        </Body>
      </Table>
      {editModalForm?.type ? (
        <Modal
          isOpen={!!editModalForm?.type}
          onClose={() => {
            setEditModalForm(null);
            resetField("remarks");
          }}
          name="Remark modal"
          modalClassName="p-10 md:p-20"
        >
          <Form
            id={"remark-form"}
            onSubmit={submitHandler}
            control={control}
            className="space-y-6 min-w-80 md:min-w-[524px]"
          >
            <h2 className="text-primary-text text-center text-xl font-normal">
              {editModalForm?.type === "create" ? "New Remark" : "Edit Remark"}
            </h2>
            <TextArea
              control={control}
              name="remarks"
              readOnly={
                editModalForm?.type === "update" ? !showEditForm : false
              }
              label="Remarks"
            />
            <div className="flex justify-between gap-2.5">
              <Button
                onPress={() => {
                  if (editModalForm?.type === "create") {
                    resetField("remarks");
                    setEditModalForm(null);
                  } else {
                    if (showEditForm) {
                      setShowEditForm(false);
                    } else {
                      resetField("remarks");
                      setEditModalForm(null);
                    }
                  }
                }}
                isDisabled={createLoading}
                variant="outlined"
              >
                CANCEL
              </Button>
              <Button
                onPress={() => {
                  if (editModalForm?.type === "update") {
                    if (showEditForm) {
                      setConfirmModal({
                        id: editModalForm?.id,
                        type: "update",
                      });
                    } else {
                      setShowEditForm(true);
                    }
                  }
                }}
                loading={createLoading}
                type={editModalForm?.type === "create" ? "submit" : "button"}
              >
                {editModalForm?.type === "create"
                  ? "SAVE"
                  : showEditForm
                  ? "SAVE"
                  : "EDIT"}
              </Button>
            </div>
          </Form>
        </Modal>
      ) : null}
      {confirmModal?.type === "Delete" ? (
        <ConfirmModal
          message={"Confirm Delete?"}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: deleteLoading,
              onPress: confirmHandler,
            },
            secondary: {
              isDisabled: deleteLoading,
            },
          }}
          isOpen={confirmModal?.type === "Delete"}
          loading={deleteLoading}
        />
      ) : null}
      {confirmModal?.type === "update" ? (
        <ConfirmModal
          message={"Confirm Edit?"}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: updateLoading,
              form: "remark-form",
              type: "submit",
            },
            secondary: {
              isDisabled: updateLoading,
            },
          }}
          isOpen={confirmModal?.type === "update"}
          loading={updateLoading}
        />
      ) : null}
    </Modal>
  );
};

export default Remarks;
