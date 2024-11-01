import { Fragment, useState } from "react";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { DateValue } from "react-aria-components";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField, TabGroup, Mobile, DateField } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import {
  dateTimeSubmitFormat,
  genderList,
  messageHelper,
  setDate,
} from "global/helpers";

import {
  CREATE_STAFF,
  FILTER_STAFFS,
  UPDATE_STAFF,
  StaffForm,
  staffFormSchema,
} from "modules/Accounts/StaffAccount";
import { RoleField } from "modules/Accounts/RoleAccess";

const fieldArgs = {
  isStaffMobileNumberNeed: true,
  isStaffEmailNeed: true,
  isStaffDobNeed: true,
  isStaffStatusNeed: true,
  isStaffGenderNeed: true,
  isStaffCountryNeed: true,
  isStaffPasswordNeed: true,
  isStaffRoleNeed: true,
};

const CreateOrEditStaffAccount = () => {
  const { canCreate, canUpdate } = useAllowedResource("User", true);
  const navigate = useNavigate();

  const { staffAccountId } = useParams({
    from: "/private-layout/accounts/staff-account/$staffAccountId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchStaffs, { loading, data }] = useLazyQuery(FILTER_STAFFS, {
    fetchPolicy: "cache-and-network",
  });

  const staff = data?.filterStaffs?.edges?.[0]?.node || null;

  const [createStaff, { loading: createLoading }] = useMutation(CREATE_STAFF);

  const [updateStaff, { loading: updateLoading }] = useMutation(UPDATE_STAFF);

  const dummyPassword = "pas    s";

  const {
    control,
    formState: { isValid, dirtyFields },
    resetField,
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: staffFormSchema,
    defaultValues: async () => {
      const staff =
        staffAccountId && !Number.isNaN(+staffAccountId)
          ? await fetchStaffs({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +staffAccountId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterStaffs) {
                  return data?.filterStaffs?.edges?.[0]?.node || null;
                }

                if (error || !data?.filterStaffs) {
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
        name: staff?.name ?? "",
        email: staff?.email ?? "",
        gender: staff?.gender
          ? new Set([staff?.gender])
          : (null as unknown as Set<"Male">),
        mobile:
          staff?.country?.id || staff?.mobileNumber
            ? {
                country: staff?.country?.id
                  ? {
                      id: staff?.country?.id,
                      name: staff?.country?.name || "N/A",
                      isdCode: staff?.country?.isdCode || "N/A",
                    }
                  : (null as unknown as {
                      id: number;
                      name: string;
                      isdCode: string;
                    }),
                mobileNumber:
                  staff?.mobileNumber ?? (null as unknown as string),
              }
            : (null as unknown as {
                country: {
                  id: number;
                  name: string;
                  isdCode: string;
                };
                mobileNumber: string;
              }),
        password: staff?.password ? dummyPassword : (null as unknown as string),
        dateOfBirth:
          staff?.dob && setDate(staff?.dob)
            ? setDate(staff?.dob)!
            : (null as unknown as DateValue),
        role: staff?.roles?.[0]?.id
          ? {
              id: staff?.roles?.[0]?.id,
              name: staff?.roles?.[0]?.name ?? "N/A",
            }
          : (null as unknown as { id: number; name: string }),
      };
    },
  });

  const [watchPassword] = useWatch({
    control,
    name: ["password"],
  });

  const countrySubmitHandler: FormSubmitHandler<StaffForm> = ({
    data: { email, gender, mobile, name, password, dateOfBirth, role },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      gender: gender?.values()?.next()?.value,
      email: email?.trim(),
      password: staff?.id && password === dummyPassword ? undefined! : password,
      countryId: mobile?.country?.id,
      mobileNumber: mobile?.mobileNumber?.toString(),
      roleId: role?.id,
    };

    if (staff?.id) {
      updateStaff({
        variables: {
          id: staff?.id,
          ...fieldArgs,
          ...commonArgs,
          dob: (dateOfBirth && dateTimeSubmitFormat(dateOfBirth)) ?? null,
        },
      })
        .then(({ data }) => {
          if (data?.updateStaff?.id) {
            closeConfirmModal();

            navigate({
              to: "/accounts/staff-account",
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
        .catch((error) => toastNotification(messageHelper(error)));
    } else {
      createStaff({
        variables: {
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createStaff?.id) {
            navigate({
              to: "/accounts/staff-account",
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
        .catch((error) => toastNotification(messageHelper(error)));
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

        staffAccountId && Number.isNaN(+staffAccountId)
          ? navigate({
              to: "/accounts/staff-account",
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
      id={"staff-form"}
      control={control}
      onSubmit={countrySubmitHandler}
      className="max-w-5xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          staffAccountId && !Number.isNaN(+staffAccountId)
            ? "Edit Staff Account"
            : "Create Staff Account"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          { name: "Account", to: "/accounts/staff-account" },
          { name: "Staff Account", to: "/accounts/staff-account" },
          {
            name:
              staffAccountId && !Number.isNaN(+staffAccountId)
                ? "Edit Staff Account"
                : "Create Staff Account",
            to: "/accounts/staff-account/$staffAccountId",
            params: { staffAccountId: staffAccountId as unknown as undefined },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[106px]">
              <InputField
                control={control}
                name="name"
                label="Name"
                readOnly={
                  (staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    !showEditForm) ||
                  false
                }
              />
              <InputField
                control={control}
                name="email"
                label="Email"
                readOnly={
                  (staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[106px]">
              <TabGroup
                control={control}
                name="gender"
                label="Gender"
                tags={genderList}
                readOnly={
                  (staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    !showEditForm) ||
                  false
                }
              />
              {staffAccountId && !Number.isNaN(+staffAccountId) && (
                <DateField
                  control={control}
                  name="dateOfBirth"
                  label="Birth Date"
                  readOnly={
                    (staffAccountId &&
                      !Number.isNaN(+staffAccountId) &&
                      !showEditForm) ||
                    false
                  }
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[106px]">
              <Mobile
                control={control}
                name="mobile"
                countryLabel="Country"
                inputLabel="Mobile Number"
                readOnly={
                  (staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    !showEditForm) ||
                  false
                }
              />
              <InputField
                type="password"
                control={control}
                name="password"
                label="Password"
                readOnly={
                  (staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    !showEditForm) ||
                  false
                }
                hideEyeIcon={
                  staffAccountId && !Number.isNaN(+staffAccountId)
                    ? showEditForm && watchPassword !== dummyPassword
                      ? false
                      : true
                    : false
                }
                onChange={() => {
                  if (
                    !dirtyFields?.password &&
                    staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    showEditForm
                  ) {
                    resetField("password", {
                      defaultValue: "" as unknown as string,
                    });
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[106px]">
              <RoleField
                control={control}
                name="role"
                label="Role"
                readOnly={
                  (staffAccountId &&
                    !Number.isNaN(+staffAccountId) &&
                    !showEditForm) ||
                  false
                }
                args={{
                  filter: {
                    hasFullPrivilege: false,
                  },
                }}
              />
              <div />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && staffAccountId && !Number.isNaN(+staffAccountId)
            ? cancelButton
            : staffAccountId && Number.isNaN(+staffAccountId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              staffAccountId && !Number.isNaN(+staffAccountId)
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
              staffAccountId && !Number.isNaN(+staffAccountId)
                ? !canUpdate
                : !canCreate
            }
          >
            {staffAccountId && !Number.isNaN(+staffAccountId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          staffAccountId && Number.isNaN(+staffAccountId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "staff-form",
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

export default CreateOrEditStaffAccount;
