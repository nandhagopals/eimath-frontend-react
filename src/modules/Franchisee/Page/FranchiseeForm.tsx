import { Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { Fragment, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useLazyQuery, useMutation } from "@apollo/client";

import { Button } from "components/Buttons";
import { InputField, Mobile } from "components/Form";
import { ConfirmModal } from "components/Modal";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import { useAllowedResource, useAuth, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import {
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  CREATE_FRANCHISEE,
  FILTER_FRANCHISEES,
  FranchiseeFieldArgs,
  FranchiseeForm as IFranchiseeForm,
  UPDATE_FRANCHISEE,
  franchiseeFormSchema,
} from "modules/Franchisee";
import { CountryField } from "modules/Settings/Country";
import { MasterFranchiseeEducationalCategoryField } from "modules/EducationMaterials/EducationalCategory";
import { MasterFranchiseeField } from "modules/MasterFranchisee";

const fieldArgs: FranchiseeFieldArgs = {
  isFranchiseeCompanyUENNeed: true,
  isFranchiseeCountryNeed: true,
  isFranchiseeOwnerEmailNeed: true,
  isFranchiseeOwnerHomeAddressNeed: true,
  isFranchiseeOwnerIsdCodeNeed: true,
  isFranchiseeOwnerMobileNumberNeed: true,
  isFranchiseeOwnerNameNeed: true,
  isFranchiseePrefixNeed: true,
  isFranchiseeStatusNeed: true,
  isFranchiseeAddressNeed: true,
  isFranchiseePostalCodeNeed: true,
  isFranchiseePostalCountryNeed: true,
  isFranchiseeEducationalCategoriesNeed: true,
  isFranchiseeFranchiseeCompanyNameNeed: true,
  isFranchiseeMasterFranchiseeInformationNeed: true,
};

const FranchiseeForm = () => {
  const { canCreate, canUpdate } = useAllowedResource(
    "FranchiseeInformation",
    true
  );
  const navigate = useNavigate();
  const { authUserDetails } = useAuth();
  const masterFranchiseeId =
    authUserDetails?.type === "MF Owner" || authUserDetails?.type === "MF Staff"
      ? authUserDetails?.id
      : null;
  const isMasterFranchiseeUser =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";

  const { franchiseeId } = useParams({
    from: "/private-layout/franchisee/$franchiseeId",
  });

  const [fetchFranchisee, { data, loading }] = useLazyQuery(
    FILTER_FRANCHISEES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const franchisee = data?.filterFranchisees?.edges?.[0]?.node || null;

  const {
    control,
    clearErrors,
    formState: { isValid },
    reset,
    resetField,
  } = useFormWithZod({
    schema: franchiseeFormSchema,
    defaultValues: async () => {
      const franchisee =
        franchiseeId && !Number.isNaN(+franchiseeId)
          ? await fetchFranchisee({
              variables: {
                filter: {
                  id: {
                    number: +franchiseeId,
                  },
                },
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                return data?.filterFranchisees?.edges?.[0]?.node;
              })
              .catch(() => {
                return null;
              })
          : null;

      const educationalCategories =
        franchisee?.educationalCategories &&
        franchisee?.educationalCategories?.length > 0 &&
        franchisee?.educationalCategories
          ?.map((educationalCategory) => {
            if (educationalCategory?.id) {
              return {
                id: educationalCategory?.id,
                name: educationalCategory?.name ?? "N/A",
              };
            } else {
              return null;
            }
          })
          ?.filter(notEmpty) &&
        franchisee?.educationalCategories
          ?.map((educationalCategory) => {
            if (educationalCategory?.id) {
              return {
                id: educationalCategory?.id,
                name: educationalCategory?.name ?? "N/A",
              };
            } else {
              return null;
            }
          })
          ?.filter(notEmpty)?.length > 0
          ? franchisee?.educationalCategories
              ?.map((educationalCategory) => {
                if (educationalCategory?.id) {
                  return {
                    id: educationalCategory?.id,
                    name: educationalCategory?.name ?? "N/A",
                  };
                } else {
                  return null;
                }
              })
              ?.filter(notEmpty)
          : [];

      return {
        companyName: franchisee?.companyName ?? "",
        companyUEN: franchisee?.companyUEN ?? "",
        email: franchisee?.ownerEmail ?? "",
        mobile: {
          country: franchisee?.country?.id
            ? {
                id: franchisee?.country?.id,
                isdCode: franchisee?.country?.isdCode ?? "N/A",
                name: franchisee?.country?.name ?? "N/A",
              }
            : (null as unknown as {
                id: number;
                name: string;
                isdCode: string;
              }),
          mobileNumber: franchisee?.ownerMobileNumber ?? "",
        },
        name: franchisee?.ownerName ?? "",
        prefix: franchisee?.prefix ?? "",
        bankAccountNumber: franchisee?.bankAccountNumber ?? "",
        homeAddress: franchisee?.ownerHomeAddress ?? "",
        address: franchisee?.address ?? (null as unknown as string),
        postalCode: franchisee?.postalCode
          ? {
              country: franchisee?.postalCountry?.id
                ? {
                    id: franchisee?.postalCountry?.id,
                    name: franchisee?.postalCountry?.name || "N/A",
                    isdCode: franchisee?.postalCountry?.isdCode ?? "N/A",
                  }
                : (null as unknown as {
                    id: number;
                    isdCode: string;
                    name: string;
                  }),
              postalCode: franchisee?.postalCode ?? (null as unknown as string),
            }
          : (null as unknown as {
              country: { id: number; isdCode: string; name: string };
              postalCode: string;
            }),
        educationalCategories,
        franchiseeName:
          franchisee?.franchiseeName ?? (null as unknown as string),
        masterFranchisee: isMasterFranchiseeUser
          ? {
              id: masterFranchiseeId!,
              name: "N/A",
            }
          : franchisee?.masterFranchiseeInformation?.id
          ? {
              id: franchisee?.masterFranchiseeInformation?.id,
              name:
                franchisee?.masterFranchiseeInformation?.masterFranchiseeName ??
                "N/A",
            }
          : (null as unknown as { id: number; name: string }),
      };
    },
  });

  const watchMasterFranchisee = useWatch({ control, name: "masterFranchisee" });

  const [createMutation, { loading: createLoading }] =
    useMutation(CREATE_FRANCHISEE);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_FRANCHISEE);

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

        franchiseeId && Number.isNaN(+franchiseeId)
          ? navigate({
              to: "/franchisee",
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

  const submitHandler: FormSubmitHandler<IFranchiseeForm> = ({
    data: {
      companyName,
      companyUEN,
      email,
      homeAddress,
      mobile,
      name,
      prefix,
      // bankAccountNumber,
      address,
      postalCode,
      educationalCategories,
      franchiseeName,
      masterFranchisee,
    },
  }) => {
    const commonArgs = {
      companyName: companyName?.trim(),
      companyUEN: companyUEN?.trim(),
      // bankAccountNumber: bankAccountNumber?.trim(),
      countryId: mobile?.country.id,
      ownerEmail: email?.trim(),
      ownerHomeAddress: homeAddress?.trim(),
      ownerMobileNumber: mobile?.mobileNumber?.trim(),
      ownerName: name?.trim(),
      prefix: prefix?.trim(),
      address,
      postalCode: postalCode?.postalCode,
      postalCountryId: postalCode?.country?.id,
      educationalCategoryIds:
        educationalCategories?.map(
          (educationalCategory) => educationalCategory?.id
        ) ?? [],
      franchiseeName: franchiseeName?.trim(),
    };

    if (typeof franchiseeId === "number" && franchisee?.id) {
      updateMutation({
        variables: {
          id: franchisee?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateFranchisee?.id) {
            closeConfirmModal();
            navigate({
              to: "/franchisee",
              search: true,
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else if (franchiseeId === "new") {
      createMutation({
        variables: {
          masterFranchiseeInformationId:
            (masterFranchisee && masterFranchisee?.id) ??
            masterFranchiseeId ??
            0,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createFranchisee?.id) {
            closeConfirmModal();
            navigate({
              to: "/franchisee",
              search: true,
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else {
      toastNotification(somethingWentWrongMessage);
    }
  };

  return (
    <div className="grid grid-cols-1 max-w-[904px] gap-6 py-2">
      <TitleAndBreadcrumb
        title={
          franchiseeId && !Number.isNaN(+franchiseeId)
            ? "Edit Franchisee Account"
            : "Create Franchisee Account"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Franchisee Account",
            to: "/franchisee",
          },
          {
            name:
              franchiseeId && !Number.isNaN(+franchiseeId)
                ? "Edit Franchisee Account"
                : "Create Franchisee Account",
            to: "/franchisee/$franchiseeId",
            params: {
              franchiseeId,
            },
          },
        ]}
      />
      <Form
        control={control}
        onSubmit={submitHandler}
        className="space-y-6 @container bg-white p-8 shadow-card-outline"
        id={"franchisee"}
      >
        <p className="text-xs font-normal text-dark-jungle-green">
          Personal Information
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
                label="Name"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
              <InputField
                control={control}
                name="email"
                label="Email"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
            </Fragment>
          )}
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-x-6 @2xl:gap-x-12 items-start  gap-y-6">
          {loading ? (
            Array.from({ length: 2 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              <Mobile
                control={control}
                name="mobile"
                countryLabel="Country"
                inputLabel="Mobile Number"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
              <InputField
                control={control}
                name="homeAddress"
                label="Home Address"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
            </Fragment>
          )}
        </div>
        <p className="text-xs font-normal text-dark-jungle-green">
          Franchisee Information
        </p>

        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-x-6 @2xl:gap-x-12 items-start gap-y-6">
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
                name="companyName"
                label="Company Name"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
              <InputField
                control={control}
                name="companyUEN"
                label="Company UEN"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
            </Fragment>
          )}
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-x-6 @2xl:gap-x-12 items-start gap-y-6">
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
                name="franchiseeName"
                label="Franchisee Name"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
              <InputField
                control={control}
                name="prefix"
                label="Prefix"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
            </Fragment>
          )}
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
          <InputField
            control={control}
            name={"address"}
            label="Address"
            readOnly={
              (franchiseeId && !Number.isNaN(+franchiseeId) && !showEditForm) ||
              false
            }
          />
          <div className={"w-full bg-white"}>
            <div className={"grid grid-cols-2 gap-2.5 items-start"}>
              <CountryField
                control={control}
                name={"postalCode.country"}
                label="Country"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
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
                name={"postalCode.postalCode"}
                label="Postal Code"
                readOnly={
                  (franchiseeId &&
                    !Number.isNaN(+franchiseeId) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-x-6 @2xl:gap-x-12 items-start gap-y-6">
          {loading ? (
            Array.from({ length: 2 })?.map((_, index) => (
              <div
                className="w-full min-h-[56px] rounded  border shimmer-animation"
                key={index}
              />
            ))
          ) : (
            <Fragment>
              {!isMasterFranchiseeUser && (
                <MasterFranchiseeField
                  control={control}
                  name="masterFranchisee"
                  label="Master Franchisee"
                  readOnly={
                    (franchiseeId && !Number.isNaN(+franchiseeId)) || false
                  }
                  args={{
                    filter: {
                      status: {
                        inArray: ["Active"],
                      },
                    },
                  }}
                  onChange={() => {
                    resetField("educationalCategories", {
                      defaultValue: [],
                    });
                  }}
                />
              )}
              <MasterFranchiseeEducationalCategoryField
                control={control}
                name="educationalCategories"
                label="Education Categories"
                multiple
                readOnly={
                  isMasterFranchiseeUser && masterFranchiseeId
                    ? (franchiseeId &&
                        !Number.isNaN(+franchiseeId) &&
                        !showEditForm) ||
                      false
                    : watchMasterFranchisee?.id
                    ? (franchiseeId &&
                        !Number.isNaN(+franchiseeId) &&
                        !showEditForm) ||
                      false
                    : true
                }
                args={{
                  masterFranchiseeId: isMasterFranchiseeUser
                    ? masterFranchiseeId!
                    : watchMasterFranchisee?.id,
                  filter: {
                    status: {
                      inArray: ["Active"],
                    },
                  },
                }}
              />
            </Fragment>
          )}
        </div>

        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && franchiseeId && !Number.isNaN(+franchiseeId)
            ? cancelButton
            : franchiseeId && Number.isNaN(+franchiseeId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              franchiseeId && !Number.isNaN(+franchiseeId)
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
              franchiseeId && !Number.isNaN(+franchiseeId)
                ? !canUpdate
                : !canCreate
            }
          >
            {franchiseeId && !Number.isNaN(+franchiseeId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
        <ConfirmModal
          message={`Confirm ${
            franchiseeId && Number.isNaN(+franchiseeId) ? "Create" : "Save Edit"
          }?`}
          onClose={closeConfirmModal}
          button={{
            primary: {
              loading: createLoading || updateLoading,
              type: "submit",
              form: "franchisee",
            },
            secondary: {
              isDisabled: createLoading || updateLoading,
            },
          }}
          isOpen={showConfirmModal}
          loading={createLoading || updateLoading}
        />
      </Form>
    </div>
  );
};

export default FranchiseeForm;
