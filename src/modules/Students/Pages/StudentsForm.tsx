/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useState } from "react";
import {
  Form,
  FormSubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button as _Button } from "react-aria-components";

import { InputField, Mobile, Select, Switch } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import {
  useAllowedResource,
  useAuth,
  useFormWithZod,
  usePreLoading,
} from "global/hook";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";
import { toastNotification } from "global/cache";
import {
  combineClassName,
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  CREATE_STUDENT,
  FILTER_STUDENTS,
  StudentFieldArgs,
  StudentForm as IStudentForm,
  UPDATE_STUDENT,
  studentFormSchema,
  GET_STUDENT_KIN_RELATIONSHIP,
  FILTER_INVOICES,
} from "modules/Students";
import { FILTER_FRANCHISEES, FranchiseeField } from "modules/Franchisee";
import {
  FILTER_MASTER_FRANCHISEE_INFORMATION,
  MasterFranchiseeField,
} from "modules/MasterFranchisee";
import { CountryField } from "modules/Settings/Country";
import { FranchiseeEducationCategoryField } from "modules/EducationMaterials/EducationalCategory";
import StudentInvoicePDF from "modules/Students/Pages/StudentInvoicePDF";

const fieldArgs: StudentFieldArgs = {
  isStudentEducationalLevelNeed: true,
  isStudentEducationalTermNeed: true,
  isStudentMasterFranchiseeInformationNeed: true,
  isStudentFranchiseeNeed: true,
  isStudentStudentKinsNeed: true,
  isStudentKinAddressNeed: true,
  isStudentKinISDCountryNeed: true,
  isStudentKinPostalCodeNeed: true,
  isStudentKinPostalCountryNeed: true,
  isStudentKinEmailNeed: true,
  isStudentKinIsPrimaryContactNeed: true,
  isStudentKinRelationshipNeed: true,
  isStudentKinMobileNumberNeed: true,
  isStudentStudentDiscountsNeed: true,
  isStudentHasDiscountNeed: true,
  isStudentEducationalCategoryNeed: true,
};

const StudentForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("Student", true);
  const canDeleteKin = useAllowedResource("DeleteStudentKin");
  const canDeleteDiscount = useAllowedResource("DeleteStudentDiscount");
  const { authUserDetails } = useAuth();
  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchisee = authUserDetails?.type === "Franchisee";
  const navigate = useNavigate();

  const { studentId } = useParams({
    from: "/private-layout/students/$studentId",
  });

  const [fetchStudent, { loading: studentsLoading, data }] = useLazyQuery(
    FILTER_STUDENTS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const [fetchFranchisee, { loading: franchiseeLoading, data: franchisees }] =
    useLazyQuery(FILTER_FRANCHISEES, {
      fetchPolicy: "cache-and-network",
    });

  const [
    fetchMasterFranchisee,
    { loading: masterFranchiseeLoading, data: masterFranchisees },
  ] = useLazyQuery(FILTER_MASTER_FRANCHISEE_INFORMATION);

  const student = data?.filterStudents?.edges?.[0]?.node;

  const defaultStudentKin = {
    address: null as unknown as string,
    email: null as unknown as string,
    isPrimaryContact: false,
    mobile: null as unknown as {
      country: { id: number; isdCode: string; name: string };
      mobileNumber: string;
    },
    name: null as unknown as string,
    relationship: null as unknown as "Father",
    postalCode: null as unknown as {
      country: { id: number; isdCode: string; name: string };
      postalCode: string;
    },
  };

  const {
    control,
    clearErrors,
    formState: { isValid, errors },
    reset,
    resetField,
  } = useFormWithZod({
    schema: studentFormSchema,
    defaultValues: async () => {
      const student =
        studentId && !Number.isNaN(+studentId)
          ? await fetchStudent({
              variables: {
                filter: {
                  id: {
                    number: +studentId,
                  },
                },
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                return data?.filterStudents?.edges?.[0]?.node;
              })
              .catch(() => {
                return null;
              })
          : null;

      const studentKins =
        student?.studentKins && student?.studentKins?.length > 0
          ? [
              ...student.studentKins.map((studentKin) => {
                return {
                  id: studentKin?.id,
                  address: studentKin?.address ?? (null as unknown as string),
                  email: studentKin?.email ?? (null as unknown as string),
                  isPrimaryContact: studentKin?.isPrimaryContact ?? false,
                  mobile: studentKin?.mobileNumber
                    ? {
                        country: studentKin?.isdCountry?.id
                          ? {
                              id: studentKin?.isdCountry?.id,
                              name: studentKin?.isdCountry?.name || "N/A",
                              isdCode: studentKin?.isdCountry?.isdCode ?? "N/A",
                            }
                          : (null as unknown as {
                              id: number;
                              isdCode: string;
                              name: string;
                            }),
                        mobileNumber:
                          studentKin?.mobileNumber ??
                          (null as unknown as string),
                      }
                    : (null as unknown as {
                        country: { id: number; isdCode: string; name: string };
                        mobileNumber: string;
                      }),
                  name: studentKin?.name ?? (null as unknown as string),
                  relationship:
                    studentKin?.relationship ?? (null as unknown as "Father"),
                  postalCode: studentKin?.postalCode
                    ? {
                        country: studentKin?.postalCountry?.id
                          ? {
                              id: studentKin?.postalCountry?.id,
                              name: studentKin?.postalCountry?.name || "N/A",
                              isdCode:
                                studentKin?.postalCountry?.isdCode ?? "N/A",
                            }
                          : (null as unknown as {
                              id: number;
                              isdCode: string;
                              name: string;
                            }),
                        postalCode:
                          studentKin?.postalCode ?? (null as unknown as string),
                      }
                    : (null as unknown as {
                        country: { id: number; isdCode: string; name: string };
                        postalCode: string;
                      }),
                };
              }),
            ]
          : [defaultStudentKin];

      const franchisees = await fetchFranchisee({
        variables: {
          isFranchiseeMasterFranchiseeInformationNeed: true,
        },
      })
        .then(({ data }) => {
          return data ?? null;
        })
        .catch((error) => {
          toastNotification(messageHelper(error));

          return null;
        });

      const masterFranchiseeInformation =
        franchisees?.filterFranchisees?.edges?.[0]?.node
          ?.masterFranchiseeInformation;

      const franchiseeInformation =
        franchisees?.filterFranchisees?.edges?.[0]?.node;

      if (isMasterFranchisee) {
        await fetchMasterFranchisee({
          variables: {
            isMasterFranchiseeInformationCurrencyNeed: true,
            filter: {
              id: { number: authUserDetails?.id },
            },
          },
        });
      }

      return {
        educationalLevel: student?.educationalLevel?.id
          ? {
              id: student?.educationalLevel?.id,
              name: student?.educationalLevel?.name || "N/A",
            }
          : (null as unknown as { id: number; name: string }),
        name: student?.name ?? "",
        franchisee: student?.franchiseeInformation?.id
          ? {
              id: student?.franchiseeInformation?.id,
              name: student?.franchiseeInformation?.ownerName || "N/A",
            }
          : isFranchisee && franchiseeInformation?.id
          ? {
              id: franchiseeInformation?.id,
              name: franchiseeInformation?.companyName ?? "N/A",
            }
          : (null as unknown as {
              id: number;
              name: string;
            }),
        masterFranchiseeInformation: student?.masterFranchiseeInformation?.id
          ? {
              id: student?.masterFranchiseeInformation?.id,
              name: student?.masterFranchiseeInformation?.ownerName || "N/A",
            }
          : isMasterFranchisee
          ? {
              id: authUserDetails?.id,
              name: "N/A",
            }
          : isFranchisee && masterFranchiseeInformation?.id
          ? {
              id: masterFranchiseeInformation?.id,
              name: masterFranchiseeInformation?.masterFranchiseeName ?? "N/A",
            }
          : (null as unknown as {
              id: number;
              name: string;
            }),
        studentKins,
        educationalTerm: student?.educationalTerm?.id
          ? {
              id: student?.educationalTerm?.id,
              name: student?.educationalTerm?.name || "N/A",
            }
          : (null as unknown as {
              id: number;
              name: string;
            }),
        hasDiscount: student?.hasDiscount ?? false,
        discountDetails:
          student?.studentDiscounts && student?.studentDiscounts?.length > 0
            ? (student?.studentDiscounts as unknown as any)
            : [],
        educationalCategory: student?.educationalCategory?.id
          ? {
              id: student?.educationalCategory?.id,
              name: student?.educationalCategory?.name ?? "N/A",
            }
          : (null as unknown as { id: number; name: string }),
      };
    },
  });

  const [
    watchMasterFranchisee,
    watchHasDiscount,
    watchFranchisee,
    watchEducationalCategory,
    watchEducationalLevel,
  ] = useWatch({
    control,
    name: [
      "masterFranchiseeInformation",
      "hasDiscount",
      "franchisee",
      "educationalCategory",
      "educationalLevel",
    ],
  });

  const currency = isAdmin
    ? watchMasterFranchisee?.currency
    : isMasterFranchisee
    ? masterFranchisees?.filterMasterFranchiseeInformation?.edges?.[0]?.node
        ?.currency
    : isFranchisee
    ? franchisees?.filterFranchisees?.edges?.[0]?.node
        ?.masterFranchiseeInformation?.currency
    : null;

  const [createMutation, { loading: createLoading }] =
    useMutation(CREATE_STUDENT);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_STUDENT);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closeConfirmModal = () => {
    setShowEditForm(false);
    setShowConfirmModal(false);
  };

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const cancelButton = (
    <Button
      className={
        "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
      }
      onPress={() => {
        clearErrors();
        reset();
        studentId && Number.isNaN(+studentId)
          ? navigate({
              to: "/students",
            })
          : setShowEditForm(false);
      }}
      isDisabled={createLoading || updateLoading}
    >
      CANCEL
    </Button>
  );

  const saveButtonHandler = () => {
    clearErrors();
    setShowConfirmModal(true);
  };

  const [invoicePDF, setInvoicePDF] = useState<{
    url: string;
    invoiceId: number;
    studentId: number;
  } | null>(null);
  const closeInvoicePDF = () => {
    setInvoicePDF(null);
  };
  const [fetchInvoice, { loading: filterInvoicesLoading }] = useLazyQuery(
    FILTER_INVOICES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
    }
  );

  const submitHandler: FormSubmitHandler<IStudentForm> = ({
    data: {
      educationalLevel,
      name,
      franchisee,
      masterFranchiseeInformation,
      studentKins,
      educationalTerm,
      hasDiscount,
      discountDetails,
      educationalCategory,
    },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      masterFranchiseeInformationId: masterFranchiseeInformation?.id,
      educationalLevelId: educationalLevel?.id,
      franchiseeId: franchisee?.id,
      educationalTermId: educationalTerm?.id ?? null,
      studentKins:
        studentKins && studentKins?.length > 0
          ? studentKins?.map((studentKin) => {
              return {
                id: studentKin?.id ? studentKin?.id : undefined,
                name: studentKin?.name?.trim(),
                relationship: studentKin?.relationship,
                isPrimary: studentKin?.isPrimaryContact,
                isdCountryId: studentKin?.mobile?.country?.id,
                mobileNumber: studentKin?.mobile?.mobileNumber?.trim(),
                email: studentKin?.email?.trim(),
                address: studentKin?.address?.trim(),
                postalCode: studentKin?.postalCode?.postalCode?.trim(),
                postalCountryId: studentKin?.postalCode?.country?.id,
              };
            })
          : [],
      hasDiscount:
        studentId && !Number.isNaN(+studentId) ? undefined : hasDiscount,
      studentDiscounts: discountDetails
        ?.map((value) =>
          value?.discountAmount
            ? {
                id: value?.id,
                discountAmount: value?.discountAmount!,
                description: value?.description!,
              }
            : null
        )
        ?.filter(notEmpty),
      educationalCategoryId: educationalCategory?.id,
    };

    if (typeof studentId === "number") {
      updateMutation({
        variables: {
          id: student?.id ?? studentId,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateStudent?.id) {
            closeConfirmModal();
            navigate({
              to: "/students",
              search: true,
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else if (studentId === "new") {
      createMutation({
        variables: {
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createStudent?.id) {
            closeConfirmModal();
            if (isFranchisee) {
              fetchInvoice({
                variables: {
                  filter: {
                    category: {
                      isExactly: "New student",
                    },
                    studentId: {
                      number: data?.createStudent?.id,
                    },
                  },
                  isInvoiceInvoiceFileURLNeed: true,
                },
              })
                .then(({ data: filterInvoices }) => {
                  if (filterInvoices?.filterInvoices?.edges?.[0]?.node?.id) {
                    if (
                      filterInvoices?.filterInvoices?.edges?.[0]?.node
                        ?.invoiceFileURL
                    ) {
                      setInvoicePDF({
                        url: filterInvoices?.filterInvoices?.edges?.[0]?.node
                          ?.invoiceFileURL,
                        invoiceId:
                          filterInvoices?.filterInvoices?.edges?.[0]?.node?.id!,
                        studentId: data?.createStudent?.id!,
                      });
                    }
                  } else {
                    toastNotification([
                      {
                        message:
                          "Student created successful, failed to generate invoice",
                        messageType: "error",
                      },
                    ]);
                    navigate({
                      to: "/students",
                      search: true,
                    });
                  }
                })
                .catch(() => {
                  toastNotification([
                    {
                      message:
                        "Student created successful, failed to generate invoice",
                      messageType: "error",
                    },
                  ]);
                  navigate({
                    to: "/students",
                    search: true,
                  });
                });
            } else {
              navigate({
                to: "/students",
                search: true,
              });
            }
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "studentKins",
  });

  const {
    fields: discountDetailsFields,
    append: discountDetailsAppend,
    remove: discountDetailsRemove,
  } = useFieldArray({
    control,
    name: "discountDetails",
  });
  const {
    data: getStudentKinRelationship,
    loading: getStudentKinRelationshipLoading,
  } = useQuery(GET_STUDENT_KIN_RELATIONSHIP);

  const relationshipOptions =
    getStudentKinRelationship?.getStudentKinRelationship || [];

  const loading = usePreLoading(
    franchiseeLoading || studentsLoading || masterFranchiseeLoading
  );

  const franchiseeField = (
    <FranchiseeField
      control={control}
      name="franchisee"
      label={"Franchisee"}
      readOnly={
        watchMasterFranchisee?.id
          ? (studentId && !Number.isNaN(+studentId) && !showEditForm) || false
          : true
      }
      args={{
        filter: {
          masterFranchiseeId: { number: watchMasterFranchisee?.id },
          status: {
            inArray: ["Active"],
          },
        },
      }}
      onChange={() => {
        resetField("educationalCategory", {
          defaultValue: null as unknown as {
            id: number;
            name: string;
          },
        });
        resetField("educationalLevel", {
          defaultValue: null as unknown as {
            id: number;
            name: string;
          },
        });
        resetField("educationalTerm", {
          defaultValue: null as unknown as {
            id: number;
            name: string;
          },
        });
      }}
    />
  );

  const educationalCategoryField = (
    <FranchiseeEducationCategoryField
      control={control}
      name="educationalCategory"
      label="Educational Category"
      readOnly={
        watchFranchisee?.id
          ? (studentId && !Number.isNaN(+studentId) && !showEditForm) || false
          : true
      }
      args={{
        franchiseeId: watchFranchisee?.id,
        filter: {
          status: {
            inArray: ["Active"],
          },
        },
      }}
      onChange={() => {
        resetField("educationalLevel", {
          defaultValue: null as unknown as {
            id: number;
            name: string;
          },
        });
        resetField("educationalTerm", {
          defaultValue: null as unknown as {
            id: number;
            name: string;
          },
        });
      }}
    />
  );

  const educationalLevelField = (
    <FranchiseeEducationCategoryField
      control={control}
      name="educationalLevel"
      label="Educational Level"
      readOnly={
        watchEducationalCategory?.id &&
        watchFranchisee?.id &&
        watchMasterFranchisee?.id
          ? (studentId && !Number.isNaN(+studentId) && !showEditForm) || false
          : true
      }
      args={{
        franchiseeId: watchFranchisee?.id,
        filter: {
          status: {
            inArray: ["Active"],
          },
        },
      }}
      fieldType={{
        type: "educationalLevel",
        categoryId: watchEducationalCategory?.id,
      }}
      onChange={() => {
        resetField("educationalTerm", {
          defaultValue: null as unknown as {
            id: number;
            name: string;
          },
        });
      }}
    />
  );

  const educationalTermField = (
    <FranchiseeEducationCategoryField
      control={control}
      name="educationalTerm"
      label="Educational Term"
      readOnly={
        watchEducationalCategory?.id &&
        watchFranchisee?.id &&
        watchMasterFranchisee?.id &&
        watchEducationalLevel?.id
          ? (studentId && !Number.isNaN(+studentId) && !showEditForm) || false
          : true
      }
      args={{
        franchiseeId: watchFranchisee?.id,
        filter: {
          status: {
            inArray: ["Active"],
          },
        },
      }}
      fieldType={{
        type: "educationalTerm",
        categoryId: watchEducationalCategory?.id,
        educationalLevelId: watchEducationalLevel?.id,
      }}
    />
  );

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={
          studentId && !Number.isNaN(+studentId)
            ? "Edit Student Account"
            : "Create Student Account"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Student Account",
            to: "/students",
          },
          {
            name:
              studentId && !Number.isNaN(+studentId)
                ? "Edit Student Account"
                : "Create Student Account",
            to: "/students/$studentId",
            params: {
              studentId,
            },
          },
        ]}
      />
      <Form
        control={control}
        onSubmit={submitHandler}
        className="space-y-6 @container bg-white p-8 shadow-card-outline"
        id={"student"}
      >
        <p className="text-xs font-normal text-dark-jungle-green">
          Student Particular
        </p>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
          {loading ? (
            Array.from({ length: 2 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              <InputField
                control={control}
                name="name"
                label="Student Name"
                readOnly={
                  (studentId && !Number.isNaN(+studentId) && !showEditForm) ||
                  false
                }
              />
              {isAdmin ? (
                <MasterFranchiseeField
                  control={control}
                  name="masterFranchiseeInformation"
                  label="Master Franchise"
                  readOnly={
                    (studentId && !Number.isNaN(+studentId) && !showEditForm) ||
                    false
                  }
                  args={{
                    filter: {
                      status: {
                        inArray: ["Active"],
                      },
                    },
                    isMasterFranchiseeInformationCurrencyNeed: true,
                  }}
                  onChange={() => {
                    resetField("franchisee", {
                      defaultValue: null as unknown as {
                        id: number;
                        name: string;
                      },
                    });
                    resetField("educationalCategory", {
                      defaultValue: null as unknown as {
                        id: number;
                        name: string;
                      },
                    });
                    resetField("educationalLevel", {
                      defaultValue: null as unknown as {
                        id: number;
                        name: string;
                      },
                    });
                    resetField("educationalTerm", {
                      defaultValue: null as unknown as {
                        id: number;
                        name: string;
                      },
                    });
                  }}
                />
              ) : null}

              {isMasterFranchisee ? franchiseeField : null}

              {isFranchisee ? educationalCategoryField : null}
            </Fragment>
          )}
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
          {loading ? (
            Array.from({ length: 2 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              {isAdmin ? franchiseeField : null}
              {isMasterFranchisee ? educationalCategoryField : null}
              {isFranchisee ? educationalLevelField : null}
              {isAdmin ? educationalCategoryField : null}
              {isMasterFranchisee ? educationalLevelField : null}
              {isFranchisee ? educationalTermField : null}
            </Fragment>
          )}
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
          {loading ? (
            Array.from({ length: 2 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              {isAdmin ? educationalLevelField : null}
              {isAdmin ? educationalTermField : null}
              {isMasterFranchisee ? educationalTermField : null}
            </Fragment>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs font-normal text-dark-jungle-green">
            Next Of Kin Particular
          </p>
          {studentId && !Number.isNaN(+studentId) ? (
            showEditForm ? (
              <Button
                className={
                  "w-min bg-none whitespace-nowrap bg-secondary-button rounded-full text-primary-text hover:bg-secondary-button-hover flex items-center gap-2 px-2 py-1.5 shadow-[0px_1px_18px_0px_#0000001F,0px_6px_10px_0px_#00000024,0px_3px_5px_-1px_#FF5F0033]"
                }
                onPress={() => {
                  append(defaultStudentKin);
                }}
                isDisabled={createLoading || updateLoading}
              >
                <AddIcon className="w-6 h-6" />
                ADD NOK
              </Button>
            ) : null
          ) : (
            <Button
              className={
                "w-min bg-none whitespace-nowrap bg-secondary-button rounded-full text-primary-text hover:bg-secondary-button-hover flex items-center gap-2 px-2 py-1.5 shadow-[0px_1px_18px_0px_#0000001F,0px_6px_10px_0px_#00000024,0px_3px_5px_-1px_#FF5F0033]"
              }
              onPress={() => {
                append(defaultStudentKin);
              }}
              isDisabled={createLoading || updateLoading}
            >
              <AddIcon className="w-6 h-6" />
              ADD NOK
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
              {Array.from({ length: 2 })?.map((_, index) => (
                <div
                  className="w-full min-h-[56px] rounded  border shimmer-animation"
                  key={index}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
              {Array.from({ length: 2 })?.map((_, index) => (
                <div
                  className="w-full min-h-[56px] rounded  border shimmer-animation"
                  key={index}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
              {Array.from({ length: 2 })?.map((_, index) => (
                <div
                  className="w-full min-h-[56px] rounded  border shimmer-animation"
                  key={index}
                />
              ))}
            </div>
          </div>
        ) : (
          fields?.map((field, index) => {
            return (
              <div key={field?.id} className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
                  <InputField
                    control={control}
                    name={`studentKins.${index}.name`}
                    label="Name"
                    readOnly={
                      (studentId &&
                        !Number.isNaN(+studentId) &&
                        !showEditForm) ||
                      false
                    }
                  />
                  <div className="grid grid-cols-1 gap-2">
                    <Select
                      control={control}
                      name={`studentKins.${index}.relationship`}
                      label="Relationship"
                      options={relationshipOptions}
                      readOnly={
                        (studentId &&
                          !Number.isNaN(+studentId) &&
                          !showEditForm) ||
                        false
                      }
                      loading={getStudentKinRelationshipLoading}
                    />
                    <div>
                      <Switch
                        control={control}
                        name={`studentKins.${index}.isPrimaryContact`}
                        label="Primary Contact"
                        className="ml-auto flex-row-reverse"
                        readOnly={
                          (studentId &&
                            !Number.isNaN(+studentId) &&
                            !showEditForm) ||
                          false
                        }
                        onChange={() => {
                          fields?.forEach((_field, i) => {
                            if (i !== index) {
                              resetField(`studentKins.${i}.isPrimaryContact`, {
                                defaultValue: false,
                              });
                            }
                          });
                        }}
                      />
                      <p className="empty:hidden text-error-main text-end text-xs">
                        {errors?.studentKins?.message}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-normal text-dark-jungle-green">
                  Contact Information
                </p>
                <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
                  <Mobile
                    control={control}
                    name={`studentKins.${index}.mobile`}
                    countryLabel="Country"
                    inputLabel="Mobile Number"
                    readOnly={
                      (studentId &&
                        !Number.isNaN(+studentId) &&
                        !showEditForm) ||
                      false
                    }
                  />
                  <InputField
                    control={control}
                    name={`studentKins.${index}.email`}
                    label="Email"
                    readOnly={
                      (studentId &&
                        !Number.isNaN(+studentId) &&
                        !showEditForm) ||
                      false
                    }
                  />
                </div>
                <p className="text-xs font-normal text-dark-jungle-green">
                  Address
                </p>
                <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
                  <InputField
                    control={control}
                    name={`studentKins.${index}.address`}
                    label="Address"
                    readOnly={
                      (studentId &&
                        !Number.isNaN(+studentId) &&
                        !showEditForm) ||
                      false
                    }
                  />
                  <div className={"w-full bg-white"}>
                    <div className={"grid grid-cols-2 gap-2.5 items-start"}>
                      <CountryField
                        control={control}
                        name={`studentKins.${index}.postalCode.country`}
                        label="Country"
                        readOnly={
                          (studentId &&
                            !Number.isNaN(+studentId) &&
                            !showEditForm) ||
                          false
                        }
                        args={{
                          filter: {
                            status: {
                              inArray: ["Active"],
                            },
                          },
                        }}
                      />
                      <InputField
                        control={control}
                        name={`studentKins.${index}.postalCode.postalCode`}
                        label="Postal Code"
                        readOnly={
                          (studentId &&
                            !Number.isNaN(+studentId) &&
                            !showEditForm) ||
                          false
                        }
                      />
                    </div>
                  </div>
                </div>
                {index !== fields?.length - 1 ? (
                  <div className="flex gap-2.5 items-center">
                    <hr className="border-other-standard-input-line flex-1" />
                    {studentId && !Number.isNaN(+studentId) ? (
                      showEditForm && canDeleteKin ? (
                        <_Button
                          className={
                            "size-10 min-w-10 min-h-10 flex justify-center items-center bg-transparent focus:outline-none focus:bg-action-hover rounded-full text-action-active hover:bg-action-hover"
                          }
                          onPress={() => {
                            remove(index);
                          }}
                        >
                          <DeleteIcon />
                        </_Button>
                      ) : null
                    ) : (
                      canDeleteKin && (
                        <_Button
                          className={
                            "size-10 min-w-10 min-h-10 flex justify-center items-center bg-transparent focus:outline-none focus:bg-action-hover rounded-full text-action-active hover:bg-action-hover"
                          }
                          onPress={() => {
                            remove(index);
                          }}
                        >
                          <DeleteIcon />
                        </_Button>
                      )
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}

        {studentId && !Number.isNaN(+studentId) ? null : loading ? (
          <div className="min-w-[130px] shimmer-animation min-h-[38px]" />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Switch
              control={control}
              name="hasDiscount"
              className="w-min flex-row-reverse gap-3"
              label="Discount?"
              readOnly={
                (studentId && !Number.isNaN(+studentId) && !showEditForm) ||
                false
              }
              onChange={(hasDiscount) => {
                if (hasDiscount) {
                  discountDetailsAppend({
                    discountAmount: null as unknown as number,
                    description: null as unknown as string,
                  });
                } else {
                  if (discountDetailsFields?.length > 0) {
                    discountDetailsFields?.forEach((_, index) => {
                      discountDetailsRemove(index);
                    });
                  }
                }
              }}
            />
            {errors?.hasDiscount?.message ? (
              <p className="text-xs text-error-main font-normal">
                {errors?.hasDiscount?.message}
              </p>
            ) : null}
            {watchHasDiscount ? (
              <div className="space-y-6">
                {discountDetailsFields?.map((field, index) => {
                  return (
                    <div
                      key={field?.id}
                      className="flex gap-6 xl:gap-10 items-center w-full"
                    >
                      <div className="flex flex-col gap-6 md:flex-row xl:gap-10 items-center flex-1">
                        <InputField
                          type="number"
                          control={control}
                          name={`discountDetails.${index}.discountAmount`}
                          label={`Discount Amount ${
                            currency ? `(${currency})` : ""
                          } `}
                          readOnly={
                            (studentId &&
                              !Number.isNaN(+studentId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                        <InputField
                          control={control}
                          name={`discountDetails.${index}.description`}
                          label="Description"
                          readOnly={
                            (studentId &&
                              !Number.isNaN(+studentId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                      </div>

                      {index === discountDetailsFields?.length - 1 ? (
                        <_Button
                          className={({ isDisabled }) =>
                            combineClassName(
                              "size-10 min-w-10 min-h-10 flex justify-center items-center focus:outline-none rounded-full focus:bg-action-hover  bg-secondary-button shadow-gradient-elevation",
                              isDisabled
                                ? "cursor-not-allowed"
                                : "hover:bg-secondary-button-hover"
                            )
                          }
                          isDisabled={
                            studentId && !Number.isNaN(+studentId)
                              ? showEditForm
                                ? false
                                : true
                              : false
                          }
                          onPress={() => {
                            discountDetailsAppend({
                              discountAmount: null as unknown as number,
                              description: null as unknown as string,
                            });
                          }}
                        >
                          <AddIcon />
                        </_Button>
                      ) : studentId && !Number.isNaN(+studentId) ? (
                        showEditForm && canDeleteDiscount ? (
                          <_Button
                            className={
                              "size-10 min-w-10 min-h-10 flex justify-center items-center bg-transparent focus:outline-none focus:bg-action-hover rounded-full text-action-active hover:bg-action-hover"
                            }
                            onPress={() => {
                              discountDetailsRemove(index);
                            }}
                          >
                            <DeleteIcon />
                          </_Button>
                        ) : null
                      ) : (
                        canDeleteDiscount && (
                          <_Button
                            className={
                              "size-10 min-w-10 min-h-10 flex justify-center items-center bg-transparent focus:outline-none focus:bg-action-hover rounded-full text-action-active hover:bg-action-hover"
                            }
                            onPress={() => {
                              discountDetailsRemove(index);
                            }}
                          >
                            <DeleteIcon />
                          </_Button>
                        )
                      )}
                    </div>
                  );
                })}{" "}
                {/* {studentId && !Number.isNaN(+studentId) ? (
                  showEditForm ? (
                    <div className="flex gap-6 xl:gap-10 items-center w-full">
                      <div className="flex flex-col gap-6 md:flex-row xl:gap-10 items-center flex-1">
                        <InputField
                          type="number"
                          control={control}
                          name={"discountAmount"}
                          label="Discount Amount ($)"
                          readOnly={
                            (studentId &&
                              !Number.isNaN(+studentId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                        <InputField
                          control={control}
                          name={"discountDescription"}
                          label="Description"
                          readOnly={
                            (studentId &&
                              !Number.isNaN(+studentId) &&
                              !showEditForm) ||
                            false
                          }
                        />
                      </div>
                      <_Button
                        className={({ isDisabled }) =>
                          combineClassName(
                            "size-10 min-w-10 min-h-10 flex justify-center items-center focus:outline-none rounded-full focus:bg-action-hover  bg-secondary-button shadow-gradient-elevation",
                            isDisabled
                              ? "cursor-not-allowed"
                              : "hover:bg-secondary-button-hover"
                          )
                        }
                        isDisabled={
                          !watchDiscountAmount && !watchDiscountDescription
                        }
                        onPress={() => {
                          discountDetailsAppend({
                            discountAmount: watchDiscountAmount!,
                            description: watchDiscountDescription!,
                          });
                          resetField("discountAmount");
                          resetField("discountDescription");
                        }}
                      >
                        <AddIcon />
                      </_Button>
                    </div>
                  ) : null
                ) : (
                  <div className="flex gap-6 xl:gap-10 items-center w-full">
                    <div className="flex flex-col gap-6 md:flex-row xl:gap-10 items-center flex-1">
                      <InputField
                        type="number"
                        control={control}
                        name={"discountAmount"}
                        label="Discount Amount ($)"
                        readOnly={
                          (studentId &&
                            !Number.isNaN(+studentId) &&
                            !showEditForm) ||
                          false
                        }
                      />
                      <InputField
                        control={control}
                        name={"discountDescription"}
                        label="Description"
                        readOnly={
                          (studentId &&
                            !Number.isNaN(+studentId) &&
                            !showEditForm) ||
                          false
                        }
                      />
                    </div>
                  </div>
                )} */}
              </div>
            ) : null}
          </div>
        )}

        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && studentId && !Number.isNaN(+studentId)
            ? cancelButton
            : studentId && Number.isNaN(+studentId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              studentId && !Number.isNaN(+studentId)
                ? showEditForm
                  ? isValid
                    ? saveButtonHandler()
                    : undefined
                  : editButtonHandler()
                : isValid
                ? saveButtonHandler()
                : undefined;
            }}
            isDisabled={
              studentId && !Number.isNaN(+studentId) ? !canUpdate : !canCreate
            }
          >
            {studentId && !Number.isNaN(+studentId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
        <ConfirmModal
          message={`Confirm ${
            studentId && Number.isNaN(+studentId) ? "Create" : "Edit"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: createLoading || updateLoading || filterInvoicesLoading,
              type: "submit",
              form: "student",
            },
            secondary: {
              isDisabled:
                createLoading || updateLoading || filterInvoicesLoading,
            },
          }}
          isOpen={showConfirmModal}
          loading={createLoading || updateLoading || filterInvoicesLoading}
        />

        <StudentInvoicePDF
          isOpen={invoicePDF?.url && invoicePDF?.invoiceId ? true : false}
          onClose={closeInvoicePDF}
          url={invoicePDF?.url!}
          invoiceId={invoicePDF?.invoiceId!}
          studentId={invoicePDF?.studentId!}
        />
      </Form>
    </div>
  );
};

export default StudentForm;
