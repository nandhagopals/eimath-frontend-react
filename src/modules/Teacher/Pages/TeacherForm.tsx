import { Fragment, useState } from "react";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";
import { DateValue } from "react-aria-components";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { DateField, InputField, Mobile } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useAuth, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { dateTimeSubmitFormat, messageHelper, setDate } from "global/helpers";

import {
  CREATE_TEACHER,
  FILTER_TEACHERS,
  TeacherFieldArgs,
  TeacherFormDetails,
  UPDATE_TEACHER,
  teacherFormSchema,
} from "modules/Teacher";
import { FILTER_FRANCHISEES, FranchiseeField } from "modules/Franchisee";
import { MasterFranchiseeField } from "modules/MasterFranchisee";

const fieldArgs: TeacherFieldArgs = {
  isEmailNeed: true,
  isFranchiseInformationNeed: true,
  isISDCodeNeed: true,
  isMobileNumberNeed: true,
  isCountryNeed: true,
  isJoinDateNeed: true,
  isMasterFranchiseeInformationNeed: true,
};

const TeacherForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("Teacher", true);
  const navigate = useNavigate();
  const { authUserDetails } = useAuth();
  const isMasterFranchiseeUser =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchiseeUser = authUserDetails?.type === "Franchisee";

  const [fetchFranchisee] = useLazyQuery(FILTER_FRANCHISEES, {
    fetchPolicy: "cache-and-network",
  });

  const { teacherId } = useParams({
    from: "/private-layout/teacher/$teacherId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchTeacher, { loading, data }] = useLazyQuery(FILTER_TEACHERS, {
    fetchPolicy: "cache-and-network",
  });

  const teacher = data?.filterTeachers?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] =
    useMutation(CREATE_TEACHER);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_TEACHER);

  const {
    control,
    formState: { isValid },
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: teacherFormSchema,
    defaultValues: async () => {
      const franchiseeDetails = isFranchiseeUser
        ? await fetchFranchisee({
            variables: {
              isFranchiseeMasterFranchiseeInformationNeed: true,
            },
          })
            .then(({ data, error }) => {
              if (data?.filterFranchisees) {
                return data?.filterFranchisees?.edges?.[0]?.node || null;
              }

              if (error || !data?.filterFranchisees) {
                toastNotification([
                  {
                    message: error?.message || "Something went wrong.",
                    messageType: "error",
                  },
                ]);

                return null;
              }
            })
            .catch((error) => {
              toastNotification(messageHelper(error));
              return null;
            })
        : null;

      const teacher =
        teacherId && !Number.isNaN(+teacherId)
          ? await fetchTeacher({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +teacherId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterTeachers) {
                  return data?.filterTeachers?.edges?.[0]?.node || null;
                }

                if (error || !data?.filterTeachers) {
                  toastNotification([
                    {
                      message: error?.message || "Something went wrong.",
                      messageType: "error",
                    },
                  ]);

                  return null;
                }
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return null;
              })
          : null;

      return {
        name: teacher?.name ?? "",
        email: teacher?.email ?? "",
        mobile:
          teacher?.country?.id || teacher?.mobileNumber
            ? {
                country: teacher?.country?.id
                  ? {
                      id: teacher?.country?.id,
                      name: teacher?.country?.name || "N/A",
                      isdCode: teacher?.country?.isdCode || "N/A",
                    }
                  : (null as unknown as {
                      id: number;
                      name: string;
                      isdCode: string;
                    }),
                mobileNumber:
                  teacher?.mobileNumber ?? (null as unknown as string),
              }
            : (null as unknown as {
                country: {
                  id: number;
                  name: string;
                  isdCode: string;
                };
                mobileNumber: string;
              }),
        franchiseInformation: isFranchiseeUser
          ? teacher?.franchiseeInformation?.id &&
            teacher?.franchiseeInformation?.franchiseeName
            ? {
                id: teacher?.franchiseeInformation?.id,
                name: teacher?.franchiseeInformation?.franchiseeName ?? "N/A",
              }
            : {
                id: franchiseeDetails?.id || (null as unknown as number),
                name: franchiseeDetails?.franchiseeName ?? "N/A",
              }
          : teacher?.franchiseeInformation?.id &&
            teacher?.franchiseeInformation?.franchiseeName
          ? {
              id: teacher?.franchiseeInformation?.id,
              name: teacher?.franchiseeInformation?.franchiseeName ?? "N/A",
            }
          : (null as unknown as { id: number; name: string }),
        masterFranchiseInformation: isMasterFranchiseeUser
          ? teacher?.masterFranchiseeInformation?.id &&
            teacher?.masterFranchiseeInformation?.masterFranchiseeName
            ? {
                id: teacher?.masterFranchiseeInformation?.id,
                name: teacher?.masterFranchiseeInformation
                  ?.masterFranchiseeName,
              }
            : { id: authUserDetails?.id, name: "" }
          : isFranchiseeUser
          ? teacher?.masterFranchiseeInformation?.id &&
            teacher?.masterFranchiseeInformation?.masterFranchiseeName
            ? {
                id: teacher?.masterFranchiseeInformation?.id,
                name: teacher?.masterFranchiseeInformation
                  ?.masterFranchiseeName,
              }
            : {
                id:
                  franchiseeDetails?.masterFranchiseeInformation?.id ||
                  (null as unknown as number),
                name: "",
              }
          : teacher?.masterFranchiseeInformation?.id &&
            teacher?.masterFranchiseeInformation?.masterFranchiseeName
          ? {
              id: teacher?.masterFranchiseeInformation?.id,
              name: teacher?.masterFranchiseeInformation?.masterFranchiseeName,
            }
          : (null as unknown as {
              id: number;
              name: string;
            }),
        joinDate:
          teacher?.joinDate && setDate(teacher?.joinDate)
            ? setDate(teacher?.joinDate)!
            : (null as unknown as DateValue),
      };
    },
  });

  const watchMasterFranchisee = useWatch({
    control,
    name: "masterFranchiseInformation",
  });

  const submitHandler: FormSubmitHandler<TeacherFormDetails> = ({
    data: {
      name,
      email,
      franchiseInformation,
      joinDate,
      masterFranchiseInformation,
      mobile,
    },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      email: email?.trim(),
      franchiseeInformationId: franchiseInformation?.id,
      masterFranchiseeInformationId: masterFranchiseInformation?.id,
      countryId: mobile?.country?.id,
      mobileNumber: mobile?.mobileNumber?.toString(),
      joinDate:
        joinDate && dateTimeSubmitFormat(joinDate)
          ? dateTimeSubmitFormat(joinDate, true)!
          : undefined!,
    };

    if (teacher?.id) {
      updateMutation({
        variables: {
          id: teacher?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateTeacher?.id) {
            closeConfirmModal();

            navigate({
              to: "/teacher",
            });
          } else {
            toastNotification([
              {
                message: "Something went wrong.",
                messageType: "error",
              },
            ]);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
          setShowConfirmModal(false);
        });
    } else {
      createMutation({
        variables: {
          ...fieldArgs,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createTeacher?.id) {
            closeConfirmModal();

            navigate({
              to: "/teacher",
            });
          } else {
            toastNotification([
              {
                message: "Something went wrong.",
                messageType: "error",
              },
            ]);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
          setShowConfirmModal(false);
        });
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const closeConfirmModal = () => {
    setShowEditForm(false);
    setShowConfirmModal(false);
  };

  const cancelButton = (
    <Button
      className={
        "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
      }
      onPress={() => {
        clearErrors();
        reset();

        teacherId && Number.isNaN(+teacherId)
          ? navigate({
              to: "/teacher",
            })
          : setShowEditForm(false);
      }}
      isDisabled={createLoading || updateLoading}
    >
      CANCEL
    </Button>
  );

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const saveButtonHandler = () => {
    clearErrors();
    setShowConfirmModal(true);
  };

  return (
    <Form
      id={"teacher-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          teacherId && !Number.isNaN(+teacherId)
            ? "Edit Teacher Account"
            : "Create Teacher Account"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Teacher Account",
            to: "/teacher",
          },
          {
            name:
              teacherId && !Number.isNaN(+teacherId)
                ? "Edit Teacher Account"
                : "Create Teacher Account",
            to: "/teacher/$teacherId",
            params: { teacherId: teacherId as unknown as undefined },
          },
        ]}
      />
      <div className="rounded bg-primary-contrast p-4 md:p-8 shadow-card-outline mt-6 grid grid-cols-1 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => {
            return (
              <div
                key={i}
                className="min-h-[56px] animate-pulse bg-slate-200 rounded-lg"
              />
            );
          })
        ) : (
          <Fragment>
            <p className="font-normal text-xs">Personal Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                control={control}
                name="name"
                label="Name"
                readOnly={
                  (teacherId && !Number.isNaN(+teacherId) && !showEditForm) ||
                  false
                }
              />
              <InputField
                name={"email"}
                control={control}
                label="Email"
                type="email"
                readOnly={
                  (teacherId && !Number.isNaN(+teacherId) && !showEditForm) ||
                  false
                }
              />
              <Mobile
                control={control}
                name="mobile"
                countryLabel="Country"
                inputLabel="Mobile Number"
                readOnly={
                  (teacherId && !Number.isNaN(+teacherId) && !showEditForm) ||
                  false
                }
              />
              <DateField
                control={control}
                name="joinDate"
                label="Join Date"
                readOnly={
                  (teacherId && !Number.isNaN(+teacherId) && !showEditForm) ||
                  false
                }
                type="date"
              />
            </div>
            <p className="font-normal text-xs">Franchise Information</p>
            <div className="grid grid-cols-2 gap-6">
              {!isMasterFranchiseeUser && !isFranchiseeUser && (
                <MasterFranchiseeField
                  name={"masterFranchiseInformation"}
                  control={control}
                  label="Master Franchise"
                  readOnly={
                    (teacherId && !Number.isNaN(+teacherId) && !showEditForm) ||
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
              )}
              <FranchiseeField
                control={control}
                name="franchiseInformation"
                label="Franchise"
                args={{
                  filter: {
                    masterFranchiseeId: {
                      number: +watchMasterFranchisee?.id,
                    },
                    status: {
                      inArray: ["Active"],
                    },
                  },
                }}
                disabled={!watchMasterFranchisee?.id}
                readOnly={
                  (teacherId && !Number.isNaN(+teacherId) && !showEditForm) ||
                  false
                }
              />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && teacherId && !Number.isNaN(+teacherId)
            ? cancelButton
            : teacherId && Number.isNaN(+teacherId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              teacherId && !Number.isNaN(+teacherId)
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
              teacherId && !Number.isNaN(+teacherId) ? !canUpdate : !canCreate
            }
          >
            {teacherId && !Number.isNaN(+teacherId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          teacherId && Number.isNaN(+teacherId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "teacher-form",
          },
          secondary: {
            isDisabled: createLoading || updateLoading,
          },
        }}
        isOpen={showConfirmModal}
        loading={createLoading || updateLoading}
      />
    </Form>
  );
};

export default TeacherForm;
