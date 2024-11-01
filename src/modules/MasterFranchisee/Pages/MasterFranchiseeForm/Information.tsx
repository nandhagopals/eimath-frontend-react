/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, Fragment, useState } from "react";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useLazyQuery, useMutation } from "@apollo/client";

import { Button } from "components/Buttons";
import { InputField, Mobile, RadioGroup } from "components/Form";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, notEmpty } from "global/helpers";

import { CountryField } from "modules/Settings/Country";
import {
  CREATE_MASTER_FRANCHISEE_INFORMATION,
  FILTER_MASTER_FRANCHISEE_INFORMATION,
  MasterFranchiseeInformation,
  MasterFranchiseeInformationFieldArgs,
  MasterFranchiseeInformationForm,
  UPDATE_MASTER_FRANCHISEE_INFORMATION,
  masterFranchiseeInformationFormSchema,
} from "modules/MasterFranchisee";
import { EducationalCategoryField } from "modules/EducationMaterials/EducationalCategory";
import { Page } from "modules/MasterFranchisee/types/master-franchisee";

const fieldArgs: MasterFranchiseeInformationFieldArgs = {
  isMasterFranchiseeInformationBankAccountNumberNeed: true,
  isMasterFranchiseeInformationCompanyNameNeed: true,
  isMasterFranchiseeInformationCompanyUENNeed: true,
  isMasterFranchiseeInformationCurrencyCountryNeed: true,
  isMasterFranchiseeInformationCurrencyNeed: true,
  isMasterFranchiseeInformationEducationCategoryNeed: true,
  isMasterFranchiseeInformationInSingaporeNeed: true,
  isMasterFranchiseeInformationIsdCountryNeed: true,
  isMasterFranchiseeInformationOwnerEmailNeed: true,
  isMasterFranchiseeInformationOwnerIsdCodeNeed: true,
  isMasterFranchiseeInformationOwnerMobileNumberNeed: true,
  isMasterFranchiseeInformationOwnerNameNeed: true,
  isMasterFranchiseeInformationPrefixNeed: true,
  isMasterFranchiseeInformationRevenueRoyaltiesNeed: true,
  isMasterFranchiseeInformationRoyaltiesFromFranchiseNeed: true,
  isMasterFranchiseeInformationStatusNeed: true,
  isMasterFranchiseeInformationAddressNeed: true,
  isMasterFranchiseeInformationPostalCodeNeed: true,
  isMasterFranchiseeInformationPostalCountryNeed: true,
  isMasterFranchiseePricePerSGDNeed: true,
};

interface Props {
  navigateMasterFranchiseeTabHandler: (page: Page) => void;
  masterFranchiseeInformation: MasterFranchiseeInformation | null | undefined;
}

const Information: FC<Props> = () => {
  const { canCreate, canUpdate } = useAllowedResource(
    "MasterFranchiseeInformation",
    true
  );
  const navigate = useNavigate();

  const { infoId } = useParams({
    from: "/private-layout/master-franchisee/$infoId",
  });

  const [fetchMasterFranchiseeInformation, { data, loading }] = useLazyQuery(
    FILTER_MASTER_FRANCHISEE_INFORMATION,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const masterFranchiseeInformation =
    data?.filterMasterFranchiseeInformation?.edges?.[0]?.node || null;

  const {
    control,
    clearErrors,
    formState: { isValid },
    resetField,
  } = useFormWithZod({
    schema: masterFranchiseeInformationFormSchema,
    defaultValues: async () => {
      const masterFranchiseeInformation =
        infoId && !Number.isNaN(+infoId)
          ? await fetchMasterFranchiseeInformation({
              variables: {
                filter: {
                  id: {
                    number: +infoId,
                  },
                },
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                return data?.filterMasterFranchiseeInformation?.edges?.[0]
                  ?.node;
              })
              .catch(() => {
                return null;
              })
          : null;

      const educationalCategories =
        masterFranchiseeInformation?.educationalCategories &&
        masterFranchiseeInformation?.educationalCategories?.length > 0 &&
        masterFranchiseeInformation?.educationalCategories
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
        masterFranchiseeInformation?.educationalCategories
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
          ? masterFranchiseeInformation?.educationalCategories
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
        companyName: masterFranchiseeInformation?.companyName ?? "",
        companyUEN: masterFranchiseeInformation?.companyUEN ?? "",
        currencyCountry: masterFranchiseeInformation?.currencyCountry?.id
          ? {
              id: masterFranchiseeInformation?.currencyCountry?.id,
              currency:
                masterFranchiseeInformation?.currencyCountry?.currency || "N/A",
              name: masterFranchiseeInformation?.currencyCountry?.name || "N/A",
            }
          : (null as unknown as { id: number; name: string; currency: string }),
        educationalCategories,
        email: masterFranchiseeInformation?.ownerEmail ?? "",
        inSingapore:
          typeof masterFranchiseeInformation?.inSingapore === "boolean"
            ? masterFranchiseeInformation?.inSingapore
              ? ("Yes" as const)
              : ("No" as const)
            : (null as unknown as "Yes"),
        masterFranchiseeName:
          masterFranchiseeInformation?.masterFranchiseeName ?? "",
        mobile: {
          country: masterFranchiseeInformation?.isdCountry?.id
            ? {
                id: masterFranchiseeInformation?.isdCountry?.id,
                isdCode:
                  masterFranchiseeInformation?.isdCountry?.isdCode ?? "N/A",
                name: masterFranchiseeInformation?.isdCountry?.name ?? "N/A",
              }
            : (null as unknown as {
                id: number;
                name: string;
                isdCode: string;
              }),
          mobileNumber: masterFranchiseeInformation?.ownerMobileNumber ?? "",
        },
        name: masterFranchiseeInformation?.ownerName ?? "",
        prefix: masterFranchiseeInformation?.prefix ?? "",
        revenueRoyalties: masterFranchiseeInformation?.revenueRoyalties ?? 0,
        royaltiesFromFranchisee:
          masterFranchiseeInformation?.royaltiesFromFranchisee ?? 0,
        address:
          masterFranchiseeInformation?.address ?? (null as unknown as string),
        postalCode: masterFranchiseeInformation?.postalCode
          ? {
              country: masterFranchiseeInformation?.postalCountry?.id
                ? {
                    id: masterFranchiseeInformation?.postalCountry?.id,
                    name:
                      masterFranchiseeInformation?.postalCountry?.name || "N/A",
                    isdCode:
                      masterFranchiseeInformation?.postalCountry?.isdCode ??
                      "N/A",
                  }
                : (null as unknown as {
                    id: number;
                    isdCode: string;
                    name: string;
                  }),
              postalCode:
                masterFranchiseeInformation?.postalCode ??
                (null as unknown as string),
            }
          : (null as unknown as {
              country: { id: number; isdCode: string; name: string };
              postalCode: string;
            }),
        pricePerSGD: masterFranchiseeInformation?.pricePerSGD ?? null,
      };
    },
  });

  const watchCountryCurrency = useWatch({
    control,
    name: "currencyCountry",
  });

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_MASTER_FRANCHISEE_INFORMATION
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_FRANCHISEE_INFORMATION
  );

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
        infoId && !Number.isNaN(+infoId)
          ? "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
          : "w-min shadow-none"
      }
      variant={infoId && !Number.isNaN(+infoId) ? undefined : "outlined"}
      onPress={() => {
        if (infoId && !Number.isNaN(+infoId)) {
          clearErrors();
          setShowEditForm(false);
        } else {
          navigate({
            to: "/master-franchisee",
          });
        }
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

  const submitHandler: FormSubmitHandler<MasterFranchiseeInformationForm> = ({
    data: {
      companyName,
      companyUEN,
      currencyCountry,
      educationalCategories,
      email,
      inSingapore,
      masterFranchiseeName,
      mobile,
      name,
      prefix,
      revenueRoyalties,
      royaltiesFromFranchisee,
      address,
      postalCode,
      pricePerSGD,
    },
  }) => {
    const commonArgs = {
      companyName,
      companyUEN,
      currencyCountryId: currencyCountry?.id,
      educationalCategoryIds:
        educationalCategories?.map(
          (educationalCategory) => educationalCategory?.id
        ) ?? [],
      ownerEmail: email,
      inSingapore: inSingapore === "Yes" ? true : false,
      masterFranchiseeName,
      ownerName: name,
      prefix,
      revenueRoyalties: revenueRoyalties ?? 0,
      royaltiesFromFranchisee: royaltiesFromFranchisee ?? 0,
      isdCountryId: mobile?.country?.id,
      ownerMobileNumber: mobile?.mobileNumber,
      address,
      postalCode: postalCode?.postalCode,
      postalCountryId: postalCode?.country?.id,
      pricePerSGD:
        currencyCountry?.name !== "Singapore" ? pricePerSGD : undefined,
    };

    if (masterFranchiseeInformation?.id) {
      updateMutation({
        variables: {
          id: masterFranchiseeInformation?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateMasterFranchiseeInformation?.id) {
            closeConfirmModal();
            toastNotification([
              {
                message: "Master franchisee update successfully",
                messageType: "success",
              },
            ]);
          }
        })
        .catch((err) => toastNotification(messageHelper(err)));
    } else {
      createMutation({
        variables: {
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createMasterFranchiseeInformation?.id) {
            closeConfirmModal();
            navigate({
              to: "/master-franchisee/$infoId",
              params: {
                infoId: data?.createMasterFranchiseeInformation?.id,
              },
              search: true as any,
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
        .catch((err) => toastNotification(messageHelper(err)));
    }
  };

  return (
    <Form
      control={control}
      onSubmit={submitHandler}
      className="space-y-6 py-6 @container"
      id={"information"}
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
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
            />
            <InputField
              control={control}
              name="email"
              label="Email"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
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
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
            />
            <CountryField
              args={{
                isCountryCurrencyNeed: true,
                filter: {
                  status: {
                    inArray: ["Active"],
                  },
                },
              }}
              control={control}
              name="currencyCountry"
              label="Currency"
              valueRenderString={(value) =>
                value?.name && value?.currency
                  ? `${value?.currency} (${value?.name})`
                  : value?.currency
                  ? value?.currency
                  : value?.name ?? ""
              }
              optionRenderString={(option) =>
                option?.name && option?.currency
                  ? `${option?.currency} (${option?.name})`
                  : option?.currency
                  ? option?.currency
                  : option?.name ?? ""
              }
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
              onChange={() => {
                resetField("pricePerSGD", { defaultValue: null });
              }}
            />
          </Fragment>
        )}
      </div>

      {watchCountryCurrency?.name ===
      "Singapore" ? null : watchCountryCurrency?.name ? (
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
              <InputField
                control={control}
                name="pricePerSGD"
                label="1 SGD ="
                readOnly={
                  (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                }
                type="number"
              />
            </Fragment>
          )}
        </div>
      ) : null}
      <p className="text-xs font-normal text-dark-jungle-green">
        Master Franchisee Information
      </p>
      {loading ? (
        <div className="grid gap-2">
          <p className="w-28 border min-h-[24px] rounded shimmer-animation" />
          <div className="flex gap-9">
            <p className="w-24 border min-h-[38px] rounded shimmer-animation" />
            <p className="w-24 border min-h-[38px] rounded shimmer-animation" />
          </div>
        </div>
      ) : (
        <RadioGroup
          control={control}
          name="inSingapore"
          options={["Yes", "No"]}
          label="In Singapore?"
          readOnly={
            (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
          }
        />
      )}
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
              name="masterFranchiseeName"
              label="Master's Franchise Name"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
            />
            <InputField
              control={control}
              name="prefix"
              label="Prefix"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
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
              name="companyName"
              label="Company Name"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
            />
            <InputField
              control={control}
              name="companyUEN"
              label="Company UEN"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
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
            (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
          }
        />
        <div className={"w-full bg-white"}>
          <div className={"grid grid-cols-2 gap-2.5 items-start"}>
            <CountryField
              control={control}
              name={"postalCode.country"}
              label="Country"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
              args={{
                filter: {
                  status: {
                    inArray: ["Active"],
                  },
                },
                isCountryStatusNeed: true,
              }}
            />
            <InputField
              control={control}
              name={"postalCode.postalCode"}
              label="Postal Code"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
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
            <EducationalCategoryField
              control={control}
              name="educationalCategories"
              label="Education Categories"
              multiple
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
              args={{
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
              name="revenueRoyalties"
              label="Royalties % (HQ)"
              type="number"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
            />
            <InputField
              control={control}
              name="royaltiesFromFranchisee"
              label="Royalties % (Master Franchisee)"
              type="number"
              readOnly={
                (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
              }
            />
          </Fragment>
        )}
      </div>

      <div className="flex justify-end gap-y-6 gap-2.5">
        {showEditForm && infoId && !Number.isNaN(+infoId)
          ? cancelButton
          : infoId && Number.isNaN(+infoId)
          ? cancelButton
          : null}

        <Button
          type={isValid ? "button" : "submit"}
          className={"w-min"}
          onPress={() => {
            infoId && !Number.isNaN(+infoId)
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
            infoId && !Number.isNaN(+infoId) ? !canUpdate : !canCreate
          }
        >
          {infoId && !Number.isNaN(+infoId)
            ? showEditForm
              ? "SAVE"
              : "EDIT"
            : "NEXT"}
        </Button>
      </div>

      <ConfirmModal
        message={`Confirm ${
          infoId && Number.isNaN(+infoId) ? "Create" : "Save Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "information",
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

export default Information;
