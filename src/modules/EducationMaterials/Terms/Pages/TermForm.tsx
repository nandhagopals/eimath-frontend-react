import { Fragment, useState } from "react";
import { Form, FormSubmitHandler, useWatch } from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";
import { notEmpty } from "global/helpers/array-methods";

import { CountryField } from "modules/Settings/Country";
import {
  CREATE_EDUCATIONAL_TERM,
  EducationalTermForm,
  EducationalTermsFieldArgs,
  FILTER_EDUCATIONAL_TERMS,
  UPDATE_EDUCATIONAL_TERM,
  educationTermFormSchema,
} from "modules/EducationMaterials/Terms";
import { WorkbookManagementField } from "modules/EducationMaterials/WorkbookManagement";

const fieldArgs: EducationalTermsFieldArgs = {
  isPriceNeed: true,
  isCountryDetailsNeed: true,
  isStatusNeed: true,
  isRemarksNeed: true,
  isWorkBookInformationNeed: true,
};

const TermForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("EducationalTerm", true);
  const navigate = useNavigate();

  const { eductionTermId } = useParams({
    from: "/private-layout/education-materials/terms/$eductionTermId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchTerm, { loading, data }] = useLazyQuery(
    FILTER_EDUCATIONAL_TERMS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const educationTerm = data?.filterEducationalTerms?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_EDUCATIONAL_TERM
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_EDUCATIONAL_TERM
  );

  const {
    control,
    formState: { isValid },
    resetField,
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: educationTermFormSchema,
    defaultValues: async () => {
      const term =
        eductionTermId && !Number.isNaN(+eductionTermId)
          ? await fetchTerm({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +eductionTermId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterEducationalTerms) {
                  return data?.filterEducationalTerms?.edges?.[0]?.node || null;
                }

                if (error || !data?.filterEducationalTerms) {
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
        name: term?.name ?? "",
        country: term?.country?.id
          ? {
              id: term?.country?.id,
              name: term?.country?.name ?? "N/A",
              status: term?.country?.status,
            }
          : (null as unknown as { id: number; name: string; status: string }),
        price: term?.price ?? (null as unknown as number),
        remarks: term?.remarks ?? "",
        workbookInformation:
          term?.workbookInformation && term?.workbookInformation?.length > 0
            ? term?.workbookInformation
                ?.map((workbook) =>
                  workbook?.id
                    ? {
                        id: workbook?.id,
                        name: workbook?.name || "N/A",
                        status: workbook?.status,
                      }
                    : null
                )
                .filter(notEmpty)
            : (null as unknown as { id: number; name: string }[]),
      };
    },
  });

  const [watchCountry] = useWatch({
    control,
    name: ["country"],
  });

  const educationTermSubmitHandler: FormSubmitHandler<EducationalTermForm> = ({
    data: { name, country, price, workbookInformation, remarks },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      countryId: country?.id,
      price,
      remarks: remarks,
      workbookInformationIds:
        workbookInformation && workbookInformation?.length > 0
          ? workbookInformation?.map(
              (workbookInformation) => workbookInformation?.id
            )
          : [],
    };

    if (educationTerm?.id) {
      updateMutation({
        variables: {
          id: educationTerm?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateEducationalTerm?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/terms",
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
          if (data?.createEducationalTerm?.id) {
            navigate({
              to: "/education-materials/terms",
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

        eductionTermId && Number.isNaN(+eductionTermId)
          ? navigate({
              to: "/education-materials/terms",
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
      id={"term-form"}
      control={control}
      onSubmit={educationTermSubmitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          eductionTermId && !Number.isNaN(+eductionTermId)
            ? "Edit Term"
            : "Create Term"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Education Materials",
            to: "/education-materials/terms",
          },
          {
            name: "Terms",
            to: "/education-materials/terms",
          },
          {
            name:
              eductionTermId && !Number.isNaN(+eductionTermId)
                ? "Edit Terms"
                : "Create Term",
            to: "/education-materials/terms/$eductionTermId",
            params: { eductionTermId: eductionTermId as unknown as undefined },
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
            <p className="font-normal text-xs">Term Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="name"
                label="Term Name"
                readOnly={
                  (eductionTermId &&
                    !Number.isNaN(+eductionTermId) &&
                    !showEditForm) ||
                  false
                }
              />
              <CountryField
                control={control}
                name="country"
                label="Country"
                readOnly={
                  (eductionTermId &&
                    !Number.isNaN(+eductionTermId) &&
                    !showEditForm) ||
                  false
                }
                onChange={() => {
                  resetField("workbookInformation", { defaultValue: [] });
                }}
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
                  (eductionTermId &&
                    !Number.isNaN(+eductionTermId) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
            <p className="font-normal text-xs">Additional Information</p>
            <div className="grid grid-cols-1 gap-6 lg:gap-12">
              <WorkbookManagementField
                control={control}
                name="workbookInformation"
                label="Workbook"
                readOnly={
                  watchCountry?.id
                    ? (eductionTermId &&
                        !Number.isNaN(+eductionTermId) &&
                        !showEditForm) ||
                      false
                    : true
                }
                multiple
                args={{
                  filter: {
                    countryId: watchCountry?.id
                      ? {
                          number: watchCountry?.id,
                        }
                      : undefined,
                    status: {
                      inArray: ["Active"],
                    },
                  },
                  isStatusNeed: true,
                }}
                classNameForMultipleValueItem={(workbook) => {
                  return workbook?.status !== "Active"
                    ? "border-error-main"
                    : "";
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                readOnly={
                  (eductionTermId &&
                    !Number.isNaN(+eductionTermId) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && eductionTermId && !Number.isNaN(+eductionTermId)
            ? cancelButton
            : eductionTermId && Number.isNaN(+eductionTermId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              eductionTermId && !Number.isNaN(+eductionTermId)
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
              eductionTermId && !Number.isNaN(+eductionTermId)
                ? !canUpdate
                : !canCreate
            }
          >
            {eductionTermId && !Number.isNaN(+eductionTermId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          eductionTermId && Number.isNaN(+eductionTermId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "term-form",
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

export default TermForm;
