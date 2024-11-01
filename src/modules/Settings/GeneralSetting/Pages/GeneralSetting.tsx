import { Fragment, useState } from "react";
import { Form, FormSubmitHandler } from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField, Switch } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";

import { useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";

import {
  CREATE_MASTER_GENERAL_SETTING,
  FILTER_MASTER_GENERAL_SETTING,
  MasterGeneralSettingForm,
  UPDATE_MASTER_GENERAL_SETTING,
  masterGeneralSettingFormSchema,
} from "modules/Settings/GeneralSetting";

const GeneralSetting = () => {
  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchMasterGeneralSetting, { loading, data }] = useLazyQuery(
    FILTER_MASTER_GENERAL_SETTING,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const generalSetting =
    data?.filterMasterGeneralSettings?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_MASTER_GENERAL_SETTING
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_MASTER_GENERAL_SETTING
  );

  const {
    control,
    formState: { isValid },
    clearErrors,
  } = useFormWithZod({
    schema: masterGeneralSettingFormSchema,
    defaultValues: async () => {
      const generalSetting = await fetchMasterGeneralSetting()
        .then(({ data, error }) => {
          if (data?.filterMasterGeneralSettings) {
            return data?.filterMasterGeneralSettings?.edges?.[0]?.node || null;
          }
          if (error || !data?.filterMasterGeneralSettings) {
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
        });

      return {
        enableGst: generalSetting?.enableGst ? true : false,
        gstPercentage:
          generalSetting?.gstPercentage ?? (null as unknown as number),
        pricePerPoint:
          generalSetting?.pricePerPoint ?? (null as unknown as number),
      };
    },
  });

  const submitHandler: FormSubmitHandler<MasterGeneralSettingForm> = ({
    data: { enableGst, gstPercentage, pricePerPoint },
  }) => {
    const commonArgs = {
      enableGst,
      gstPercentage,
      pricePerPoint,
    };

    if (generalSetting?.id) {
      updateMutation({
        variables: {
          id: generalSetting?.id,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateMasterGeneralSetting?.id) {
            closeConfirmModal();
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
      createMutation({
        variables: {
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createMasterGeneralSetting?.id) {
            closeConfirmModal();
            fetchMasterGeneralSetting();
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

  const editButtonHandler = () => {
    setShowEditForm(true);
  };

  const saveButtonHandler = () => {
    clearErrors();
    setShowConfirmModal(true);
  };

  return (
    <Form
      id={"general-setting-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          generalSetting?.id && !Number.isNaN(+generalSetting?.id)
            ? "Edit General Setting"
            : "Create General Setting"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Master Setting",
            to: "/settings/general-setting",
          },
          {
            name: "General Setting",
            to: "/settings/general-setting",
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
            <p className="font-normal text-xs">GST Setting</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <InputField
                control={control}
                name="gstPercentage"
                label="Percentage (%)"
                readOnly={
                  (generalSetting?.id &&
                    !Number.isNaN(+generalSetting?.id) &&
                    !showEditForm) ||
                  false
                }
                type="number"
              />
              <Switch
                control={control}
                name="enableGst"
                readOnly={
                  (generalSetting?.id &&
                    !Number.isNaN(+generalSetting?.id) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
            <p className="font-normal text-xs">Point Setting</p>
            <div className="flex items-center gap-2.5">
              <span className="whitespace-nowrap">1 Point =</span>
              <InputField
                control={control}
                name="pricePerPoint"
                label="Dollars ($)"
                readOnly={
                  (generalSetting?.id &&
                    !Number.isNaN(+generalSetting?.id) &&
                    !showEditForm) ||
                  false
                }
                type="number"
                className="max-w-[400px]"
              />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              generalSetting?.id && !Number.isNaN(+generalSetting?.id)
                ? showEditForm
                  ? isValid
                    ? saveButtonHandler()
                    : undefined
                  : editButtonHandler()
                : isValid
                ? saveButtonHandler()
                : undefined;
            }}
          >
            {generalSetting?.id && !Number.isNaN(+generalSetting?.id)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          generalSetting?.id && Number.isNaN(+generalSetting?.id)
            ? "Create"
            : "Save"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "general-setting-form",
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

export default GeneralSetting;
