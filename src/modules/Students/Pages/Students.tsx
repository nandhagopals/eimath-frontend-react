/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { RadioGroup as _RadioGroup } from "@headlessui/react";
import { Cell, Checkbox, Row, Selection } from "react-aria-components";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { Controller, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { Body, Head, Table, TableAction } from "components/Table";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import {
  CustomCheckbox,
  InputField,
  RadioGroup,
  Select,
} from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import {
  useFormWithZod,
  usePreLoading,
  useAuth,
  useAllowedResource,
} from "global/hook";
import {
  combineClassName,
  fileDownload,
  formatDate,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DownloadIcon from "global/assets/images/file-download-filled.svg?react";

import {
  FILTER_STUDENTS,
  FilterStudentsArgs,
  GENERATE_STUDENT_CSV,
  StudentFieldArgs,
  UPDATE_STUDENT,
  WITHDRAW_STUDENTS,
  studentsFilterSchema,
} from "modules/Students";
import { EducationLevelsField } from "modules/EducationMaterials/Levels";
import { FranchiseeField } from "modules/Franchisee";
import Remarks from "modules/Students/Pages/Remarks";
import WithdrawWithRemark from "modules/Students/Pages/WithdrawWithRemark";
import StudentItemsAccordion from "modules/Students/Pages/StudentItemsAccordion";
import StudentAllRenewalInvoicePDF from "modules/Students/Pages/StudentAllRenewalInvoicePDF";

const fieldArgs: StudentFieldArgs = {
  isStudentEducationalLevelNeed: true,
  isStudentFranchiseeNeed: true,
  isStudentStudentKinsNeed: true,
  isStudentKinRelationshipNeed: true,
  isStudentKinMobileNumberNeed: true,
  isStudentKinIsdCodeNeed: true,
  isStudentStatusNeed: true,
  isStudentWithdrawRemarkNeed: true,
  isStudentJoinedAtNeed: true,
  isStudentGraduatedAtNeed: true,
  isStudentWithdrawnAtNeed: true,
};

const Students = () => {
  const { canCreate, canUpdate, canDelete } = useAllowedResource(
    "Student",
    true
  );

  const canArchiveAndUnarchive = useAllowedResource(
    "ArchiveAndUnarchiveStudent"
  );

  const canDownloadCSV = useAllowedResource("DownloadStudent");

  const {
    canRead,
    canCreate: canCreateRemark,
    canUpdate: canUpdateRemark,
    canDelete: canDeleteRemark,
  } = useAllowedResource("StudentRemark", true);

  // const canRenewalStudent = useAllowedResource("RenewStudent");

  const { authUserDetails } = useAuth();
  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchisee = authUserDetails?.type === "Franchisee";

  const navigate = useNavigate();

  const defaultPageSize = useReactiveVar(paginationDefaultCount);

  const { control, resetField } = useFormWithZod({
    schema: studentsFilterSchema,
    defaultValues: {
      pageSize: defaultPageSize,
      pageStatus: "ACTIVE",
      search: "",
      pageType: isAdmin
        ? "isAdmin"
        : isMasterFranchisee
        ? "isMasterFranchisee"
        : isFranchisee
        ? "isFranchisee"
        : null,
      currentTermOrRenewalTerm: "CURRENT TERM",
      sortBy: { column: "id", direction: "descending" },
    },
  });

  const [
    watchSearch,
    watchPageSize,
    watchPageStatus,
    watchSortBy,
    watchLevel,
    watchFranchisee,
    watchStatus,
    watchCurrentTermOrRenewalTerm,
  ] = useWatch({
    control,
    name: [
      "search",
      "pageSize",
      "pageStatus",
      "sortBy",
      "level",
      "franchisee",
      "status",
      "currentTermOrRenewalTerm",
    ],
  });

  const commonTableHeaders = [
    {
      name: "ID",
      id: "id" as const,
      isRowHeader: true,
      showCheckbox: isFranchisee ? true : undefined,
    },
    { name: "Name", id: "name" as const },
    { name: "Level", id: "level" as const },
  ];

  const commonTableHeadersForActive = [
    ...commonTableHeaders,
    { name: "NOK Name", id: "nokName" as const, hideSort: true },
    { name: "NOK R/S", id: "nokR/S" as const, hideSort: true },
    { name: "NOK Number", id: "nokNumber" as const, hideSort: true },
    { name: "Date", id: "date" as const, hideSort: true },
    { name: "Franchisee", id: "prefix" as const },
  ];

  const commonTableHeadersForPast = [
    ...commonTableHeaders,
    { name: "Status", id: "status" as const, hideSort: true },
    { name: "Date", id: "date" as const, hideSort: true },
    { name: "Franchisee", id: "prefix" as const },
  ];

  const tableHeaders: {
    name: string;
    id:
      | "id"
      | "name"
      | "level"
      | "nokName"
      | "nokR/S"
      | "nokNumber"
      | "prefix"
      | "action"
      | "status"
      | "term"
      | "date";
    isRowHeader?: boolean;
    hideSort?: boolean;
    showCheckbox?: boolean;
  }[] =
    watchPageStatus === "ACTIVE"
      ? [
          ...commonTableHeadersForActive,
          { name: "Actions", id: "action" as const, hideSort: true },
        ]
      : watchPageStatus === "PAST"
      ? [
          ...commonTableHeadersForPast,
          { name: "Actions", id: "action" as const, hideSort: true },
        ]
      : [
          ...commonTableHeadersForActive,
          { name: "Actions", id: "action" as const, hideSort: true },
        ];

  const commonQueryArgs: FilterStudentsArgs = useMemo(
    () => ({
      ...fieldArgs,
      pagination: { size: watchPageSize },
      filter: {
        status: {
          inArray:
            watchPageStatus === "ACTIVE"
              ? ["Active"]
              : watchPageStatus === "PAST"
              ? watchStatus
                ? [watchStatus]
                : ["Withdrawn", "Graduated"]
              : watchPageStatus === "ARCHIVED"
              ? ["Archived"]
              : [],
        },
        educationalLevelId:
          watchPageStatus === "ACTIVE" && watchLevel?.id
            ? {
                number: watchLevel?.id,
              }
            : undefined,
        franchiseeId: watchFranchisee?.id
          ? {
              number: watchFranchisee?.id,
            }
          : undefined,
      },
      globalSearch: undefined,
      sortBy: watchSortBy?.column
        ? {
            column:
              watchSortBy?.column === "level"
                ? watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
                  ? "nextEducationalLevel"
                  : "educationalLevel"
                : watchSortBy?.column === "prefix"
                ? "franchiseeInformation"
                : watchSortBy?.column ?? "id",
            order:
              watchSortBy?.direction === "ascending"
                ? ("ASC" as const)
                : ("DESC" as const),
            subClassField:
              watchSortBy?.column === "level"
                ? "name"
                : watchSortBy?.column === "prefix"
                ? "prefix"
                : undefined,
          }
        : undefined,
      excludeInProgressStudentRenewal:
        watchCurrentTermOrRenewalTerm === "PENDING RENEWAL" ? true : false,
      isStudentNextEducationalLevelNeed:
        watchCurrentTermOrRenewalTerm === "PENDING RENEWAL" ? true : false,
      isStudentNextEducationalTermNeed:
        watchCurrentTermOrRenewalTerm === "PENDING RENEWAL" ? true : false,
    }),
    [
      watchCurrentTermOrRenewalTerm,
      watchFranchisee?.id,
      watchPageStatus,
      watchStatus,
      watchSortBy?.direction,
      watchSortBy?.column,
    ]
  );

  const { data, loading, fetchMore, updateQuery, refetch } = useQuery(
    FILTER_STUDENTS,
    {
      variables: commonQueryArgs,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_STUDENT);

  const [generateCSV, { loading: csvFileLoading }] =
    useMutation(GENERATE_STUDENT_CSV);

  const [confirmModal, setConfirmModal] = useState<
    | { type: "Archive"; id: number }
    | { type: "Unarchive"; id: number }
    | { type: "Delete"; id: number }
    | { type: "Rejoin"; id: number }
    | { type: "Withdraw"; ids: number[] }
    | null
  >(null);

  const closeConfirmModal = () => {
    if (confirmModal?.type === "Withdraw") {
      resetField("studentBunkAction", { defaultValue: null });
    }
    setConfirmModal(null);
  };

  const [withdrawStudentMutation, { loading: withdrawStudentMutationLoading }] =
    useMutation(WITHDRAW_STUDENTS);

  const confirmHandler = () => {
    if (confirmModal?.type === "Withdraw" && confirmModal?.ids?.length > 0) {
      withdrawStudentMutation({
        variables: {
          withdrawInfo: confirmModal?.ids?.map((id) => ({ studentId: id })),
        },
      })
        .then(({ data }) => {
          if (data?.withdrawStudents) {
            refetch();
            closeConfirmModal();
            resetField("studentBunkAction", { defaultValue: null });
            setSelectedKeys(new Set([]));
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    }

    if (
      confirmModal?.type &&
      confirmModal?.type !== "Withdraw" &&
      confirmModal?.id
    ) {
      updateMutation({
        variables: {
          id: confirmModal?.id,
          status:
            confirmModal?.type === "Archive"
              ? "Archived"
              : confirmModal?.type === "Unarchive"
              ? "Active"
              : confirmModal?.type === "Delete"
              ? "Deleted"
              : "Active",
        },
      })
        .then((res) => {
          if (res?.data?.updateStudent) {
            closeConfirmModal();

            if (data?.filterStudents?.edges?.length === 1) {
              const queryArgs = commonQueryArgs;

              queryArgs.globalSearch = undefined;

              fetchMore({
                variables: queryArgs,
                updateQuery: (_, { fetchMoreResult: { filterStudents } }) => {
                  return {
                    filterStudents,
                  };
                },
              }).catch((error) => {
                toastNotification(messageHelper(error));
              });
            } else if (data?.filterStudents?.pageInfo?.hasNextPage) {
              const deleteItemIndex = data?.filterStudents?.edges?.findIndex(
                (edgeDetails) => edgeDetails?.node?.id === +confirmModal?.id
              );

              const nextPointCursorData =
                (deleteItemIndex || 0) + 1 === watchPageSize
                  ? data &&
                    data?.filterStudents &&
                    data.filterStudents?.edges &&
                    data.filterStudents?.edges[(deleteItemIndex || 0) - 1]
                  : null;

              const queryArgs = commonQueryArgs;

              queryArgs.pagination = {
                size: 1,
                after:
                  nextPointCursorData?.cursor ||
                  data?.filterStudents?.pageInfo?.endCursor,
              };

              fetchMore({
                variables: queryArgs,
              }).then((refetchRes) => {
                if (refetchRes?.data?.filterStudents?.edges?.length === 1) {
                  updateQuery(({ filterStudents }) => {
                    const olderRecord =
                      filterStudents?.edges?.filter(
                        (edgeDetails) =>
                          edgeDetails?.node?.id !== confirmModal?.id
                      ) || [];
                    return {
                      filterStudents: filterStudents
                        ? {
                            pageInfo: refetchRes?.data?.filterStudents?.pageInfo
                              ? {
                                  ...filterStudents?.pageInfo,
                                  endCursor:
                                    refetchRes?.data?.filterStudents?.pageInfo
                                      ?.endCursor,
                                  hasNextPage:
                                    refetchRes?.data?.filterStudents?.pageInfo
                                      ?.hasNextPage,
                                  totalNumberOfItems:
                                    refetchRes?.data?.filterStudents?.pageInfo
                                      ?.totalNumberOfItems,
                                }
                              : null,
                            edges:
                              refetchRes?.data?.filterStudents?.edges &&
                              refetchRes?.data?.filterStudents?.edges?.length >
                                0
                                ? [
                                    ...olderRecord,
                                    ...(refetchRes?.data?.filterStudents
                                      ?.edges || []),
                                  ]
                                : [],
                            __typename: filterStudents?.__typename,
                          }
                        : null,
                    };
                  });
                }
              });
            } else {
              updateQuery(({ filterStudents }) => {
                return {
                  filterStudents: filterStudents
                    ? {
                        pageInfo: filterStudents?.pageInfo
                          ? {
                              ...filterStudents?.pageInfo,
                              totalNumberOfItems: filterStudents?.pageInfo
                                ?.totalNumberOfItems
                                ? filterStudents?.pageInfo?.totalNumberOfItems -
                                  1
                                : 0,
                            }
                          : null,
                        edges:
                          filterStudents?.edges &&
                          filterStudents?.edges?.length > 0
                            ? filterStudents?.edges?.filter(
                                (edge) => edge?.node?.id !== confirmModal?.id
                              ) || []
                            : [],
                        __typename: filterStudents?.__typename,
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

  const rows =
    data?.filterStudents?.edges?.map((edge) => ({
      id: edge?.node?.id,
      name: edge?.node?.name,
      level:
        watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
          ? edge?.node?.nextEducationalLevel?.name
          : edge?.node?.educationalLevel?.name,
      term:
        watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
          ? edge?.node?.nextEducationalTerm?.name
          : edge?.node?.educationalTerm?.name,
      nokName: edge?.node?.studentKins?.map((studentKin) => studentKin?.name),
      "nokR/S": edge?.node?.studentKins?.map(
        (studentKin) => studentKin?.relationship
      ),
      nokNumber: edge?.node?.studentKins?.map((studentKin) =>
        studentKin?.mobileNumber
          ? `${studentKin?.isdCode ? studentKin?.isdCode : ""} ${
              studentKin?.mobileNumber
            }`
          : "N/A"
      ),
      prefix: edge?.node?.franchiseeInformation?.franchiseeName,
      status: edge?.node?.status,
      action: "action" as const,
      withdrawRemark: edge?.node?.withdrawRemarks,
      date:
        edge?.node?.status === "Withdrawn"
          ? edge?.node?.withdrawnAt &&
            formatDate(edge?.node?.withdrawnAt, "dd/MM/yyyy")
            ? formatDate(edge?.node?.withdrawnAt, "dd/MM/yyyy")
            : null
          : edge?.node?.status === "Graduated"
          ? edge?.node?.graduatedAt &&
            formatDate(edge?.node?.graduatedAt, "dd/MM/yyyy")
            ? formatDate(edge?.node?.graduatedAt, "dd/MM/yyyy")
            : null
          : edge?.node?.status === "Active"
          ? edge?.node?.joinedAt &&
            formatDate(edge?.node?.joinedAt, "dd/MM/yyyy")
            ? formatDate(edge?.node?.joinedAt, "dd/MM/yyyy")
            : null
          : null,
    })) || [];

  const onNext = () => {
    const queryArgs = commonQueryArgs;
    queryArgs.globalSearch = watchSearch || undefined;
    queryArgs.pagination = {
      size: watchPageSize,
      after: data?.filterStudents?.pageInfo?.endCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterStudents } }) => {
        return { filterStudents };
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
      before: data?.filterStudents?.pageInfo?.startCursor,
    };

    fetchMore({
      variables: queryArgs,
      updateQuery: (_, { fetchMoreResult: { filterStudents } }) => {
        return { filterStudents };
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
      updateQuery: (_, { fetchMoreResult: { filterStudents } }) => {
        return {
          filterStudents,
        };
      },
    }).catch((error) => {
      toastNotification(messageHelper(error));
    });
  };

  const totalCount = data?.filterStudents?.pageInfo?.totalNumberOfItems || 0;
  const nextDisabled =
    data?.filterStudents?.pageInfo?.hasNextPage &&
    data?.filterStudents?.pageInfo?.endCursor
      ? true
      : false;
  const prevDisabled =
    data?.filterStudents?.pageInfo?.hasPreviousPage &&
    data?.filterStudents?.pageInfo?.startCursor
      ? true
      : false;

  const preLoading = usePreLoading(loading);

  const onSearchChange: (search: string | null | undefined) => void =
    useCallback((search) => {
      const queryArgs = commonQueryArgs;

      queryArgs.globalSearch = search || undefined;

      fetchMore({
        variables: queryArgs,
        updateQuery: (_, { fetchMoreResult: { filterStudents } }) => {
          return {
            filterStudents,
          };
        },
      }).catch((error) => {
        toastNotification(messageHelper(error));
      });
    }, []);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const [remarksStudentId, setRemarksStudentId] = useState<number | null>(null);

  const remarksModalCloseHandler = () => {
    setRemarksStudentId(null);
  };

  const [showAllInvoicePDF, setShowAllInvoicePDF] = useState<{
    studentId: number[];
  } | null>(null);

  const closeAllInvoicePDFHandler = () => {
    setShowAllInvoicePDF(null);
    resetField("studentBunkAction", { defaultValue: null });
  };

  const kebabMenuList: (item: (typeof rows)[number]) => {
    id:
      | "View/Edit"
      | "Remarks"
      | "Withdraw"
      | "Archive"
      | "Renewal"
      | "Rejoin"
      | "Unarchive"
      | "Delete"
      | "Proceed"
      | "Edit"
      | null;
  }[] = (item) =>
    isAdmin
      ? watchPageStatus === "ACTIVE"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canUpdate ? "Withdraw" : null },
            { id: canArchiveAndUnarchive ? "Archive" : null },
          ]
        : watchPageStatus === "PAST"
        ? item?.status === "Withdrawn"
          ? [
              { id: canRead ? "View/Edit" : null },
              { id: canRead ? "Remarks" : null },
              { id: canUpdate ? "Rejoin" : null },
              { id: canArchiveAndUnarchive ? "Archive" : null },
            ]
          : item?.status === "Graduated"
          ? [
              { id: canRead ? "View/Edit" : null },
              { id: canRead ? "Remarks" : null },
              { id: canArchiveAndUnarchive ? "Archive" : null },
            ]
          : []
        : watchPageStatus === "ARCHIVED"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canArchiveAndUnarchive ? "Unarchive" : null },
            { id: canDelete ? "Delete" : null },
          ]
        : []
      : isMasterFranchisee
      ? watchPageStatus === "ACTIVE"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canUpdate ? "Withdraw" : null },
            { id: canArchiveAndUnarchive ? "Archive" : null },
          ]
        : watchPageStatus === "PAST"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canUpdate ? "Rejoin" : null },
            { id: canArchiveAndUnarchive ? "Archive" : null },
          ]
        : watchPageStatus === "ARCHIVED"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canArchiveAndUnarchive ? "Unarchive" : null },
            { id: canDelete ? "Delete" : null },
          ]
        : []
      : isFranchisee
      ? watchPageStatus === "ACTIVE"
        ? watchCurrentTermOrRenewalTerm === "CURRENT TERM"
          ? [
              { id: canRead ? "View/Edit" : null },
              { id: canRead ? "Remarks" : null },
              { id: canUpdate ? "Withdraw" : null },
              // { id: canRenewalStudent ? "Renewal" : null },
              { id: canArchiveAndUnarchive ? "Archive" : null },
            ]
          : watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
          ? [
              {
                id: canUpdate ? "Proceed" : null,
              },
              {
                id: canUpdate ? "Edit" : null,
              },
              {
                id: canUpdate ? "Withdraw" : null,
              },
            ]
          : []
        : watchPageStatus === "PAST"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canUpdate ? "Rejoin" : null },
            { id: canArchiveAndUnarchive ? "Archive" : null },
          ]
        : watchPageStatus === "ARCHIVED"
        ? [
            { id: canRead ? "View/Edit" : null },
            { id: canRead ? "Remarks" : null },
            { id: canArchiveAndUnarchive ? "Unarchive" : null },
            { id: canDelete ? "Delete" : null },
          ]
        : []
      : [];

  const kebabMenuAction = (
    value: ReturnType<typeof kebabMenuList>[number]["id"],
    item: (typeof rows)[number]
  ) => {
    if (item?.id) {
      switch (value) {
        case "Archive": {
          setConfirmModal({
            type: "Archive",
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
        case "Edit": {
          navigate({
            // to: "/students/$studentId/renewal/$renewalId",
            to: "/students/$studentId",
            params: {
              studentId: item?.id,
              // renewalId: "renew-student",
            },
          });
          break;
        }
        case "Proceed": {
          setShowAllInvoicePDF({
            studentId: [item?.id],
          });
          break;
        }
        case "Rejoin": {
          setConfirmModal({
            type: "Rejoin",
            id: item?.id,
          });
          break;
        }
        case "Remarks": {
          setRemarksStudentId(item?.id);
          break;
        }
        case "Renewal": {
          setShowAllInvoicePDF({
            studentId: [item?.id],
          });
          break;
        }
        case "Unarchive": {
          setConfirmModal({
            type: "Unarchive",
            id: item?.id,
          });
          break;
        }
        case "View/Edit": {
          navigate({
            to: "/students/$studentId",
            params: {
              studentId: item?.id,
            },
          });
          break;
        }
        case "Withdraw": {
          if (isMasterFranchisee) {
            setShowConfirmWithDrawModal({
              studentId: item?.id,
              withdrawRemark: item?.withdrawRemark,
            });
          } else {
            setConfirmModal({
              type: "Withdraw",
              ids: [item?.id],
            });
          }
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
      .then(({ data }) => {
        if (
          data?.generateStudentCSV !== null &&
          data?.generateStudentCSV !== undefined &&
          data?.generateStudentCSV?.length > 5
        ) {
          fileDownload(data?.generateStudentCSV);
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper(error));
      });
  };

  const [showConfirmWithDrawModal, setShowConfirmWithDrawModal] = useState<{
    studentId: number;
    withdrawRemark: string | null | undefined;
  } | null>(null);

  const downloadCSVButton = (
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
  );

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <div className="flex justify-between gap-2 py-2">
        <TitleAndBreadcrumb
          title="Student Account"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Student Account",
              to: "/students",
            },
          ]}
        />
        {canCreate && (
          <Button
            onPress={() => {
              navigate({
                to: "/students/$studentId",
                params: {
                  studentId: "new",
                },
              });
            }}
            className={
              "w-min h-min flex items-center whitespace-nowrap gap-2 px-4 text-[14px] leading-6 tracking-[.4px]"
            }
          >
            <AddIcon />
            ADD STUDENT
          </Button>
        )}
      </div>
      <RadioGroup
        control={control}
        name="pageStatus"
        options={["ACTIVE", "PAST", "ARCHIVED"]}
        variant="filled"
        className="flex justify-end"
        onChange={() => {
          resetField("search", { defaultValue: "" });
          resetField("sortBy", {
            defaultValue: { column: "id", direction: "descending" },
          });
          resetField("cursor", { defaultValue: null });
          resetField("franchisee", { defaultValue: null });
          resetField("level", { defaultValue: null });
          resetField("status", { defaultValue: null });
          setSelectedKeys(new Set([]));
        }}
      />
      {isFranchisee && canDownloadCSV && (
        <div className="w-full flex justify-end">{downloadCSVButton}</div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 justify-center">
        <div className="flex justify-center items-center md:justify-start flex-wrap gap-x-1.5 gap-y-2.5">
          <InputField
            type="search"
            name={"search"}
            control={control}
            debounceOnChange={onSearchChange}
            className="max-w-[220px] min-w-[220px]"
            variant="small"
          />
          {watchPageStatus === "ACTIVE" ? (
            <EducationLevelsField
              control={control}
              name="level"
              label="Level"
              variant="small"
              className="max-w-[220px] min-w-[220px]"
              canClear
            />
          ) : null}
          {watchPageStatus === "PAST" ? (
            <Select
              control={control}
              name="status"
              options={["Graduated", "Withdrawn"]}
              label="Status"
              className="max-w-[220px] min-w-[220px]"
              variant="small"
              canClear
            />
          ) : null}
          {isFranchisee ? null : (
            <FranchiseeField
              control={control}
              name="franchisee"
              label={"Franchisee"}
              className="max-w-[220px] min-w-[220px]"
              variant="small"
              canClear
            />
          )}
        </div>
        {isFranchisee && watchPageStatus === "ACTIVE" && (
          <Controller
            name="currentTermOrRenewalTerm"
            control={control}
            rules={{
              onChange: () => {
                setSelectedKeys(new Set([]));
              },
            }}
            render={({ field: { value, onChange } }) => {
              return (
                <_RadioGroup
                  value={value}
                  onChange={onChange}
                  className={"flex"}
                >
                  {["CURRENT TERM", "PENDING RENEWAL"]?.map((option) => {
                    return (
                      <_RadioGroup.Option
                        value={option}
                        key={option}
                        className={({ checked }) =>
                          combineClassName(
                            "w-[154px] min-w-[154px] flex justify-center items-center border-b-2 text-sm font-medium py-3 px-2 cursor-pointer",
                            checked
                              ? "text-primary-main border-b-primary-main"
                              : "text-secondary-text border-b-transparent"
                          )
                        }
                      >
                        {option}
                      </_RadioGroup.Option>
                    );
                  })}
                </_RadioGroup>
              );
            }}
          />
        )}
        {isFranchisee && watchPageStatus === "ACTIVE" && (
          <Select
            control={control}
            name={"studentBunkAction"}
            options={
              watchCurrentTermOrRenewalTerm === "CURRENT TERM"
                ? ["Renewal", "Withdraw", "Archive"]
                : watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
                ? ["Proceed", "Withdraw"]
                : []
            }
            label="Bulk Action"
            className="max-w-[220px] bg-background-default"
            variant="small"
            canClear
            onChange={(data) => {
              if (data === "Proceed" || data === "Renewal") {
                if (selectedKeys === "all" || selectedKeys?.size > 0) {
                  const [...keys] = selectedKeys;

                  if (
                    selectedKeys === "all" &&
                    rows?.map((row) => row?.id ?? null)?.filter(notEmpty)
                      ?.length > 0
                  ) {
                    setShowAllInvoicePDF({
                      studentId: rows
                        ?.map((row) => row?.id ?? null)
                        ?.filter(notEmpty),
                    });
                  } else {
                    setShowAllInvoicePDF({
                      studentId: keys as unknown as number[],
                    });
                  }
                } else {
                  toastNotification([
                    {
                      message: "Select at least one student.",
                      messageType: "error",
                    },
                  ]);
                  resetField("studentBunkAction", { defaultValue: null });
                }
              }

              if (data === "Withdraw") {
                if (selectedKeys === "all" || selectedKeys?.size > 0) {
                  const [...keys] = selectedKeys;

                  if (
                    selectedKeys === "all" &&
                    rows?.map((row) => row?.id ?? null)?.filter(notEmpty)
                      ?.length > 0
                  ) {
                    setConfirmModal({
                      type: "Withdraw",
                      ids: rows
                        ?.map((row) => row?.id ?? null)
                        ?.filter(notEmpty),
                    });
                  } else {
                    setConfirmModal({
                      type: "Withdraw",
                      ids: keys as unknown as number[],
                    });
                  }
                } else {
                  toastNotification([
                    {
                      message: "Select at least one student.",
                      messageType: "error",
                    },
                  ]);
                  resetField("studentBunkAction", { defaultValue: null });
                }
              }
            }}
          />
        )}
        {!isFranchisee && canDownloadCSV && (
          <div className="w-full flex justify-center">{downloadCSVButton}</div>
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
        selectionBehavior={isFranchisee ? "toggle" : undefined}
        selectionMode={isFranchisee ? "multiple" : undefined}
        onSelectionChange={isFranchisee ? setSelectedKeys : undefined}
        selectedKeys={isFranchisee ? selectedKeys : undefined}
      >
        <Head
          headers={
            watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
              ? [
                  ...tableHeaders.slice(0, 3),
                  { id: "term", name: "Term", hideSort: true },
                  ...tableHeaders.slice(3),
                ]
              : tableHeaders
          }
          allowsSorting
        />
        <Body
          headers={
            watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
              ? [
                  ...tableHeaders.slice(0, 3),
                  { id: "term", name: "Term", hideSort: true },
                  ...tableHeaders.slice(3),
                ]
              : tableHeaders
          }
          items={rows}
          defaultPageSize={defaultPageSize}
          loading={preLoading}
          className={
            "text-[14px] leading-5 tracking-[.17px] divide-y divide-gray-200"
          }
        >
          {(item) => (
            <Row
              columns={
                watchCurrentTermOrRenewalTerm === "PENDING RENEWAL"
                  ? [
                      ...tableHeaders.slice(0, 3),
                      { id: "term", name: "Term", hideSort: true },
                      ...tableHeaders.slice(3),
                    ]
                  : tableHeaders
              }
              className={"hover:bg-action-hover focus:outline-none"}
            >
              {(column) => (
                <Cell className={"px-4 last:px-0"}>
                  {column?.id === "id" && isFranchisee ? (
                    <div className="flex gap-2 items-center">
                      <Checkbox slot={"selection"}>
                        {({
                          isIndeterminate,
                          isSelected,
                          isDisabled,
                          isReadOnly,
                        }) => {
                          return (
                            <CustomCheckbox
                              isChecked={isSelected}
                              isIndeterminate={isIndeterminate}
                              disabled={isDisabled}
                              readOnly={isReadOnly}
                            />
                          );
                        }}
                      </Checkbox>
                      <p>{item?.id}</p>
                    </div>
                  ) : column?.id === "action" ? (
                    <div className="flex items-center">
                      <TableAction
                        type="kebab"
                        items={
                          kebabMenuList(item)?.filter(
                            (value) => value?.id !== null
                          ) as unknown as {
                            id:
                              | "View/Edit"
                              | "Remarks"
                              | "Withdraw"
                              | "Archive"
                              | "Renewal"
                              | "Rejoin"
                              | "Unarchive"
                              | "Delete"
                              | "Proceed"
                              | "Edit";
                          }[]
                        }
                        onAction={(value) => {
                          kebabMenuAction(value?.id ?? null, item);
                        }}
                      />
                      {isFranchisee &&
                      watchCurrentTermOrRenewalTerm === "PENDING RENEWAL" ? (
                        <StudentItemsAccordion studentId={item?.id!} />
                      ) : null}
                    </div>
                  ) : column?.id === "status" ? (
                    <p
                      className={combineClassName(
                        " text-[13px] font-normal px-2.5 py-1 rounded-full w-min",
                        item?.status === "Withdrawn"
                          ? "bg-error-main text-white"
                          : item?.status === "Graduated"
                          ? "bg-secondary-main text-white"
                          : "border text-primary-text"
                      )}
                    >
                      {item?.status ?? "-"}
                    </p>
                  ) : column?.id === "nokName" ? (
                    item?.nokName && item?.nokName?.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {item?.nokName?.map((nokName, index) => (
                          <p
                            key={index}
                            className={
                              "text-[13px] font-normal px-2.5 py-1 rounded-full border text-primary-text"
                            }
                          >
                            {nokName ?? "-"}
                          </p>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )
                  ) : column?.id === "nokR/S" ? (
                    item?.["nokR/S"] && item?.["nokR/S"]?.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {item?.["nokR/S"]?.map((relationShip, index) => (
                          <p
                            key={index}
                            className={
                              " text-[13px] font-normal px-2.5 py-1 rounded-full border text-primary-text"
                            }
                          >
                            {relationShip ?? "-"}
                          </p>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )
                  ) : column?.id === "nokNumber" ? (
                    item?.nokNumber && item?.nokNumber?.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5 whitespace-nowrap">
                        {item?.nokNumber?.map((nokNumber, index) => (
                          <p
                            key={index}
                            className={
                              " text-[13px] font-normal px-2.5 py-1 rounded-full border text-primary-text"
                            }
                          >
                            {nokNumber ?? "-"}
                          </p>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )
                  ) : column?.id === "prefix" ? (
                    item?.prefix === null || item?.prefix === undefined ? (
                      <Button
                        className={
                          "w-min whitespace-nowrap rounded-full px-2.5 py-2 text-[13px]  bg-none bg-error-main text-white border-none"
                        }
                      >
                        Untagged
                      </Button>
                    ) : (
                      item?.prefix
                    )
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
      <ConfirmModal
        message={
          confirmModal?.type === "Archive"
            ? "Confirm Archive?"
            : confirmModal?.type === "Delete"
            ? "Confirm Delete?"
            : confirmModal?.type === "Rejoin"
            ? "Confirm Rejoin?"
            : confirmModal?.type === "Unarchive"
            ? "Confirm Unarchive?"
            : confirmModal?.type === "Withdraw"
            ? "Confirm Withdraw?"
            : ""
        }
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: updateLoading || withdrawStudentMutationLoading,
            onPress: confirmHandler,
          },
          secondary: {
            isDisabled: updateLoading || withdrawStudentMutationLoading,
          },
        }}
        isOpen={!!confirmModal?.type}
        loading={updateLoading || withdrawStudentMutationLoading}
      />
      {remarksStudentId && (
        <Remarks
          isOpen={!!remarksStudentId}
          onClose={remarksModalCloseHandler}
          studentId={remarksStudentId!}
          defaultPageSize={defaultPageSize}
          canCreateRemark={canCreateRemark}
          canUpdateRemark={canUpdateRemark}
          canDeleteRemark={canDeleteRemark}
        />
      )}
      {showConfirmWithDrawModal ? (
        <WithdrawWithRemark
          isOpen={!!showConfirmWithDrawModal?.studentId}
          onClose={() => {
            setShowConfirmWithDrawModal(null);
          }}
          studentId={showConfirmWithDrawModal?.studentId}
          withDrawRemark={showConfirmWithDrawModal?.withdrawRemark}
          refetch={refetch}
        />
      ) : null}
      {showAllInvoicePDF?.studentId &&
      showAllInvoicePDF?.studentId?.length > 0 ? (
        <StudentAllRenewalInvoicePDF
          isOpen={
            showAllInvoicePDF?.studentId &&
            showAllInvoicePDF?.studentId?.length > 0
              ? true
              : false
          }
          onClose={closeAllInvoicePDFHandler}
          studentIds={showAllInvoicePDF?.studentId}
          setSelectedKeys={setSelectedKeys}
          refetch={refetch}
        />
      ) : null}
    </div>
  );
};

export default Students;
