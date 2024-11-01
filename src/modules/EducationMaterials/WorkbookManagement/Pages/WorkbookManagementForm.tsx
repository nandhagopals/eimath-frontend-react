import { Fragment, useState } from "react";
import { Form, FormSubmitHandler } from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { FileUpload } from "components/Form/FileUpload";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, notEmpty, urlToOtherType } from "global/helpers";

import {
  CREATE_WORKBOOK_INFORMATION,
  FILTER_WORKBOOK_INFORMATION,
  UPDATE_WORKBOOK_INFORMATION,
  WorkbookInformationForm,
  workbookInformationFormSchema,
} from "modules/EducationMaterials/WorkbookManagement";
import { CountryField } from "modules/Settings/Country";

const fieldArgs = {
  isPriceNeed: true,
  isCountryDetailsNeed: true,
  isStatusNeed: true,
  isRemarksNeed: true,
  isWorkbookFilesNeed: true,
  isWorkbookAnswerFilesNeed: true,
};

const WorkbookManagementForm = () => {
  const { canCreate, canUpdate } = useAllowedResource(
    "WorkbookInformation",
    true
  );

  const navigate = useNavigate();

  const { workbookId } = useParams({
    from: "/private-layout/education-materials/workbook-management/$workbookId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchWorkbookInformation, { loading, data }] = useLazyQuery(
    FILTER_WORKBOOK_INFORMATION,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const workbook = data?.filterWorkbookInformation?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_WORKBOOK_INFORMATION
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_WORKBOOK_INFORMATION
  );

  const {
    control,
    formState: { isValid },
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: workbookInformationFormSchema,
    defaultValues: async () => {
      const workbook =
        workbookId && !Number.isNaN(+workbookId)
          ? await fetchWorkbookInformation({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +workbookId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterWorkbookInformation) {
                  return (
                    data?.filterWorkbookInformation?.edges?.[0]?.node || null
                  );
                }

                if (error || !data?.filterWorkbookInformation) {
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

      const workbookFilesPromises =
        workbook?.workbookFiles && workbook?.workbookFiles?.length > 0
          ? workbook?.workbookFiles?.map(async (item, index) => {
              const file = item?.fileURL
                ? await urlToOtherType(
                    item?.fileURL,
                    item?.originalFileName ||
                      `File ${index + 1}.${
                        item?.mimeType?.split("/")[1] || "png"
                      }`,
                    item?.mimeType ?? undefined
                  )
                : null;
              if (item?.id && file?.file) {
                return {
                  id: item?.id,
                  file: file?.file,
                };
              } else {
                return null;
              }
            })
          : [];

      const workbookFiles = (await Promise.all(workbookFilesPromises)).filter(
        notEmpty
      );

      const workbookAnswerFilesPromises =
        workbook?.workbookAnswerFiles &&
        workbook?.workbookAnswerFiles?.length > 0
          ? workbook?.workbookAnswerFiles?.map(async (item, index) => {
              const file = item?.fileURL
                ? await urlToOtherType(
                    item?.fileURL,
                    item?.originalFileName ||
                      `File ${index + 1}.${
                        item?.mimeType?.split("/")[1] || "png"
                      }`,
                    item?.mimeType ?? undefined
                  )
                : null;
              if (item?.id && file?.file) {
                return {
                  id: item?.id,
                  file: file?.file,
                };
              } else {
                return null;
              }
            })
          : [];

      const workbookAnswerFiles = (
        await Promise.all(workbookAnswerFilesPromises)
      ).filter(notEmpty);

      return {
        name: workbook?.name ?? "",
        country: workbook?.country?.id
          ? {
              id: workbook?.country?.id,
              name: workbook?.country?.name ?? "N/A",
              status: workbook?.country?.status,
            }
          : (null as unknown as { id: number; name: string; status: string }),
        price: workbook?.price ?? (null as unknown as number),
        workbookFiles: workbookFiles ?? (null as unknown as []),
        workbookAnswerFiles: workbookAnswerFiles as unknown as [],
        remarks: workbook?.remarks ?? "",
      };
    },
  });

  const submitHandler: FormSubmitHandler<WorkbookInformationForm> = ({
    data: { name, country, price, workbookFiles, workbookAnswerFiles, remarks },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      countryId: country?.id,
      price,
      workbookFiles: workbookFiles?.map((fileDetails) => fileDetails?.file),
      workbookAnswerFiles: workbookAnswerFiles?.map(
        (fileDetails) => fileDetails?.file
      ),
      remarks: remarks,
    };

    if (workbook?.id) {
      updateMutation({
        variables: {
          id: workbook?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateWorkbookInformation?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/workbook-management",
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
          if (data?.createWorkbookInformation?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/workbook-management",
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

        workbookId && Number.isNaN(+workbookId)
          ? navigate({
              to: "/education-materials/workbook-management",
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
      id={"workbook-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          workbookId && !Number.isNaN(+workbookId)
            ? "Edit Workbook"
            : "Create Workbook"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Education Materials",
            to: "/education-materials/workbook-management",
          },
          {
            name: "Workbook Management",
            to: "/education-materials/workbook-management",
          },
          {
            name:
              workbookId && !Number.isNaN(+workbookId)
                ? "Edit Workbook"
                : "Create Workbook",
            to: "/education-materials/workbook-management/$workbookId",
            params: { workbookId: workbookId as unknown as undefined },
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
            <p className="font-normal text-xs">Workbook Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="name"
                label="Workbook Name"
                readOnly={
                  (workbookId && !Number.isNaN(+workbookId) && !showEditForm) ||
                  false
                }
              />
              <CountryField
                control={control}
                name="country"
                label="Country"
                readOnly={
                  (workbookId && !Number.isNaN(+workbookId) && !showEditForm) ||
                  false
                }
                args={{
                  filter: {
                    status: {
                      inArray: ["Active"],
                    },
                  },
                  isCountryStatusNeed: true,
                }}
                classNameForParent={(value) =>
                  value?.id && value?.status !== "Active"
                    ? "border-error-main hover:border-error-main"
                    : ""
                }
                classNameForLabel={(value) =>
                  value?.id && value?.status !== "Active"
                    ? "text-error-main"
                    : ""
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="price"
                label="Price (Points)"
                type="number"
                readOnly={
                  (workbookId && !Number.isNaN(+workbookId) && !showEditForm) ||
                  false
                }
              />
            </div>
            <p className="font-normal text-xs">Additional Information</p>
            <FileUpload
              control={control}
              label={"Workbook"}
              name={"workbookFiles"}
              multiple
              canClear
              readOnly={
                (workbookId && !Number.isNaN(+workbookId) && !showEditForm) ||
                false
              }
            />
            <FileUpload
              control={control}
              label={"Answer Book"}
              name={"workbookAnswerFiles"}
              multiple
              canClear
              readOnly={
                (workbookId && !Number.isNaN(+workbookId) && !showEditForm) ||
                false
              }
            />
            <div className="grid grid-cols-1 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                readOnly={
                  (workbookId && !Number.isNaN(+workbookId) && !showEditForm) ||
                  false
                }
              />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && workbookId && !Number.isNaN(+workbookId)
            ? cancelButton
            : workbookId && Number.isNaN(+workbookId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              workbookId && !Number.isNaN(+workbookId)
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
              workbookId && !Number.isNaN(+workbookId) ? !canUpdate : !canCreate
            }
          >
            {workbookId && !Number.isNaN(+workbookId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          workbookId && Number.isNaN(+workbookId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "workbook-form",
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

export default WorkbookManagementForm;
