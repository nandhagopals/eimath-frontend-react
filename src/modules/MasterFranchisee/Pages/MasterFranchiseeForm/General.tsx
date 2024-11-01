import { FC, Fragment, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useParams } from "@tanstack/react-router";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";

import { ConfirmModal } from "components/Modal";
import { Button } from "components/Buttons";
import { InputField, Switch } from "components/Form";

import { toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";
import { useAllowedResource, useFormWithZod } from "global/hook";

import {
  FILTER_MASTER_FRANCHISEE_GENERALS,
  UPDATE_MASTER_FRANCHISEE_GENERAL,
  MasterFranchiseeGeneralFieldArgs,
  MasterFranchiseeGeneralForm,
  UpdateMasterFranchiseeGeneralArgs,
  masterFranchiseeGeneralFormSchema,
  Page,
  MasterFranchiseeInformation,
} from "modules/MasterFranchisee";

const fieldArgs: MasterFranchiseeGeneralFieldArgs = {
  isMasterFranchiseeGeneralDepositFeeNeed: true,
  isMasterFranchiseeGeneralEnableGSTNeed: true,
  isMasterFranchiseeGeneralGSTPercentageNeed: true,
  isMasterFranchiseeGeneralRegistrationFeeNeed: true,
  isMasterFranchiseeGeneralStaffPasswordNeed: true,
  isMasterFranchiseeGeneralStaffEmailNeed: true,
};

interface Props {
  navigateMasterFranchiseeTabHandler: (page: Page) => void;
  masterFranchiseeInformation: MasterFranchiseeInformation | null | undefined;
}

const General: FC<Props> = ({ masterFranchiseeInformation }) => {
  const { canUpdate } = useAllowedResource("MasterFranchiseeGeneral", true);
  const { infoId } = useParams({
    from: "/private-layout/master-franchisee/$infoId",
  });

  const [fetchMasterFranchiseeGeneral, { data, loading }] = useLazyQuery(
    FILTER_MASTER_FRANCHISEE_GENERALS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const masterFranchiseeGeneral =
    data?.filterMasterFranchiseeGenerals?.edges?.[0]?.node || null;
  const dummyPassword = "pas    s";

  const {
    control,
    clearErrors,
    formState: { isValid, dirtyFields },
    resetField,
  } = useFormWithZod({
    schema: masterFranchiseeGeneralFormSchema,
    defaultValues: async () => {
      const masterFranchiseeGeneral =
        infoId && !Number.isNaN(+infoId)
          ? await fetchMasterFranchiseeGeneral({
              variables: {
                filter: {
                  masterFranchiseeId: {
                    number: +infoId,
                  },
                },
                ...fieldArgs,
              },
            })
              .then(({ data }) => {
                return data?.filterMasterFranchiseeGenerals?.edges?.[0]?.node;
              })
              .catch(() => {
                return null;
              })
          : null;

      return {
        depositFee:
          masterFranchiseeGeneral?.depositFee ?? (null as unknown as number),
        enableGST: masterFranchiseeGeneral?.enableGST ?? false,
        gstPercentage:
          masterFranchiseeGeneral?.gstPercentage ?? (null as unknown as number),
        registrationFee:
          masterFranchiseeGeneral?.registrationFee ??
          (null as unknown as number),
        staffPassword: masterFranchiseeGeneral?.staffPassword
          ? dummyPassword
          : (null as unknown as string),
        staffEmail:
          (masterFranchiseeGeneral?.staffEmail &&
          masterFranchiseeGeneral?.staffEmail?.length > 0
            ? masterFranchiseeGeneral?.staffEmail
            : (null as unknown as string)) ?? (null as unknown as string),
      };
    },
  });

  const [watchStaffPassword] = useWatch({
    control,
    name: ["staffPassword"],
  });

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_FRANCHISEE_GENERAL
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

  const saveButtonHandler = () => {
    clearErrors();
    setShowConfirmModal(true);
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
        }
      }}
      isDisabled={updateLoading}
    >
      CANCEL
    </Button>
  );

  const submitHandler: FormSubmitHandler<MasterFranchiseeGeneralForm> = ({
    data: {
      depositFee,
      enableGST,
      gstPercentage,
      registrationFee,
      staffPassword,
      staffEmail,
    },
  }) => {
    if (masterFranchiseeGeneral?.id) {
      const args: UpdateMasterFranchiseeGeneralArgs = {
        id: masterFranchiseeGeneral?.id,
        depositFee: depositFee ?? null,
        enableGST: enableGST ?? null,
        gstPercentage: gstPercentage ?? null,
        registrationFee: registrationFee ?? null,
        staffPassword:
          staffEmail?.trim() && staffEmail?.trim()?.length > 3
            ? masterFranchiseeGeneral?.id && staffPassword === dummyPassword
              ? undefined!
              : staffPassword
            : null,
        staffEmail:
          staffEmail?.trim() && staffEmail?.trim()?.length > 3
            ? staffEmail?.trim()
            : null,
        ...fieldArgs,
      };
      updateMutation({
        variables: {
          ...args,
        },
      })
        .then(({ data }) => {
          if (data?.updateMasterFranchiseeGeneral?.id) {
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
    }
  };

  return (
    <Form
      control={control}
      onSubmit={submitHandler}
      className="space-y-6 py-6 @container"
      id={"general"}
    >
      <p className="text-xs font-normal text-primary-text">GST Setting</p>
      <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-x-6 @2xl:gap-x-12 gap-y-6">
        {loading ? (
          Array.from({ length: 1 })?.map((_, index) => (
            <div
              className="w-full min-h-[56px] rounded  border shimmer-animation"
              key={index}
            />
          ))
        ) : (
          <div className="flex gap-6 items-center">
            <InputField
              control={control}
              name="gstPercentage"
              label="Percentage (%)"
              type="number"
              readOnly={
                masterFranchiseeGeneral?.id
                  ? (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                  : true
              }
            />
            <Switch
              control={control}
              name="enableGST"
              readOnly={
                masterFranchiseeGeneral?.id
                  ? (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                  : true
              }
            />
          </div>
        )}
      </div>
      <p className="text-xs font-normal text-primary-text">Charges</p>
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
              name="registrationFee"
              label={`Registration Fee  ${
                masterFranchiseeInformation?.currencyCountry?.currency
                  ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
                  : ""
              }`}
              type="number"
              readOnly={
                masterFranchiseeGeneral?.id
                  ? (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                  : true
              }
            />
            <InputField
              control={control}
              name="depositFee"
              label={`Deposit Fee  ${
                masterFranchiseeInformation?.currencyCountry?.currency
                  ? `(${masterFranchiseeInformation?.currencyCountry?.currency})`
                  : ""
              }`}
              type="number"
              readOnly={
                masterFranchiseeGeneral?.id
                  ? (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                  : true
              }
            />
          </Fragment>
        )}
      </div>
      <p className="text-xs font-normal text-primary-text">Staff Information</p>

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
              name="staffEmail"
              label="Email"
              readOnly={
                masterFranchiseeGeneral?.id
                  ? (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                  : true
              }
            />
            <InputField
              control={control}
              name="staffPassword"
              label="Password"
              type="password"
              readOnly={
                masterFranchiseeGeneral?.id
                  ? (infoId && !Number.isNaN(+infoId) && !showEditForm) || false
                  : true
              }
              hideEyeIcon={
                masterFranchiseeGeneral?.id &&
                watchStaffPassword !== dummyPassword &&
                showEditForm
                  ? false
                  : (infoId && !Number.isNaN(+infoId)) || false
              }
              onChange={() => {
                if (
                  !dirtyFields?.staffPassword &&
                  infoId &&
                  !Number.isNaN(+infoId) &&
                  showEditForm
                ) {
                  resetField("staffPassword", {
                    defaultValue: "" as unknown as string,
                  });
                }
              }}
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
          isDisabled={masterFranchiseeGeneral?.id ? !canUpdate : true}
        >
          {infoId && !Number.isNaN(+infoId)
            ? showEditForm
              ? "SAVE"
              : "EDIT"
            : "CONFIRM"}
        </Button>
      </div>
      <ConfirmModal
        message={`Confirm ${
          infoId && Number.isNaN(+infoId) ? "Create" : "Save Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: updateLoading,
            type: "submit",
            form: "general",
          },
          secondary: {
            isDisabled: updateLoading,
          },
        }}
        isOpen={showConfirmModal}
        loading={updateLoading}
      />
    </Form>
  );
};

export default General;
