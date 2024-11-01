import { Fragment, useState } from "react";
import {
  Form,
  FormSubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button as _Button } from "react-aria-components";

import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { CheckBox, InputField } from "components/Form";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { combineClassName, messageHelper, notEmpty } from "global/helpers";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";

import {
  CREATE_EDUCATIONAL_CATEGORY,
  FILTER_EDUCATIONAL_CATEGORIES,
  UPDATE_EDUCATIONAL_CATEGORY,
  educationalCategoryFormSchema,
  EducationalCategoryForm as IEducationalCategoryForm,
  EducationalCategoryFieldArgs,
} from "modules/EducationMaterials/EducationalCategory";
import { CountryField } from "modules/Settings/Country";
import {EducationLevelsField} from "modules/EducationMaterials/Levels";

const fieldArgs: EducationalCategoryFieldArgs = {
  isEducationalCategoryCountryNeed: true,
  isEducationalCategoryEducationalLevelsNeed: true,
  isEducationalCategoryStatusNeed: true,
  isEducationalCategoryRemarksNeed: true,
};

const EducationalCategoryForm = () => {
  const { canCreate, canUpdate } = useAllowedResource(
    "EducationalCategory",
    true
  );
  const navigate = useNavigate();

  const { eductionCategoryId } = useParams({
    from: "/private-layout/education-materials/educational-categories/$eductionCategoryId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchEducationalCategory, { loading, data }] = useLazyQuery(
    FILTER_EDUCATIONAL_CATEGORIES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const educationalCategory =
    data?.filterEducationalCategories?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_EDUCATIONAL_CATEGORY
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_EDUCATIONAL_CATEGORY
  );

  const {
    control,
    formState: {
      isValid,
      errors: { educationCategoryLevels },
    },
    resetField,
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: educationalCategoryFormSchema,
    defaultValues: async () => {
      const educationalCategory =
        eductionCategoryId && !Number.isNaN(+eductionCategoryId)
          ? await fetchEducationalCategory({
              variables: {
                filter: {
                  id: {
                    number: +eductionCategoryId,
                  },
                },
                ...fieldArgs,
              },
            })
              .then(({ data, error }) => {
                if (data?.filterEducationalCategories) {
                  return (
                    data?.filterEducationalCategories?.edges?.[0]?.node || null
                  );
                }

                if (error || !data?.filterEducationalCategories) {
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

      const educationalCategoryLevels =
        (educationalCategory?.educationalCategoryLevels &&
          educationalCategory?.educationalCategoryLevels
            .map((educationalCategory) => {
              if (educationalCategory?.educationalLevel?.id) {
                return {
                  educationalLevel: {
                    id: educationalCategory?.educationalLevel?.id,
                    name: educationalCategory?.educationalLevel?.name || "N/A",
                    status: educationalCategory?.educationalLevel?.status,
                  },
                  position: educationalCategory?.position || 1,
                  isFinalTerm: educationalCategory?.isFinalTerm ?? false,
                };
              } else {
                return null;
              }
            })
            .filter(notEmpty)) ||
        [];

      return {
        name: educationalCategory?.name ?? "",
        remarks: educationalCategory?.remarks ?? "",
        country: educationalCategory?.country?.id
          ? {
              id: educationalCategory?.country?.id,
              name: educationalCategory?.country?.name || "N/A",
              status: educationalCategory?.country?.status,
            }
          : (null as unknown as { id: number; name: string; status: string }),
        educationCategoryLevels:
          educationalCategoryLevels?.length > 0
            ? [
                ...educationalCategoryLevels,
                {
                  educationalLevel: null as unknown as {
                    id: number;
                    name: string;
                    status: string;
                  },
                  isFinalTerm: false,
                },
              ]
            : [
                {
                  educationalLevel: null as unknown as {
                    id: number;
                    name: string;
                    status: string;
                  },
                  isFinalTerm: false,
                },
              ],
      };
    },
  });

  const submitHandler: FormSubmitHandler<IEducationalCategoryForm> = ({
    data: { name, country, educationCategoryLevels, remarks },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      countryId: country?.id,
      remarks: remarks?.trim(),
      educationalLevels:
        educationCategoryLevels && educationCategoryLevels?.length > 0
          ? educationCategoryLevels
              ?.map((educationCategoryLevel, index) => {
                if (educationCategoryLevel?.educationalLevel?.id) {
                  return {
                    levelId: educationCategoryLevel?.educationalLevel?.id,
                    position: index + 1,
                    isFinalTerm: educationCategoryLevel?.isFinalTerm ?? false,
                  };
                } else {
                  return null;
                }
              })
              ?.filter(notEmpty)
          : [],
    };

    if (educationalCategory?.id) {
      updateMutation({
        variables: {
          id: educationalCategory?.id,
          ...commonArgs,
          isEducationalCategoryStatusNeed: false,
        },
      })
        .then(({ data }) => {
          if (data?.updateEducationalCategory?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/educational-categories",
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
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createEducationalCategory?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/educational-categories",
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

        eductionCategoryId && Number.isNaN(+eductionCategoryId)
          ? navigate({
              to: "/education-materials/educational-categories",
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

  const [watchEducationalCategoryLevels, watchCountry] = useWatch({
    control,
    name: ["educationCategoryLevels", "country"],
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "educationCategoryLevels",
  });

  return (
    <Form
      id={"workbook-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          eductionCategoryId && !Number.isNaN(+eductionCategoryId)
            ? "Edit Educational Category"
            : "Create Educational Category"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Education Materials",
            to: "/education-materials/workbook-management",
          },
          {
            name: "Educational Category",
            to: "/education-materials/educational-categories",
          },
          {
            name:
              eductionCategoryId && !Number.isNaN(+eductionCategoryId)
                ? "Edit Educational Category"
                : "Create Educational Category",
            to: "/education-materials/educational-categories/$eductionCategoryId",
            params: { eductionCategoryId },
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
            <p className="text-xs font-normal">
              Educational Category Information
            </p>
            <div className="grid grid-cols-1 gap-6">
              <InputField
                control={control}
                name="name"
                label="Category Name"
                readOnly={
                  (eductionCategoryId &&
                    !Number.isNaN(+eductionCategoryId) &&
                    !showEditForm) ||
                  false
                }
              />
              <CountryField
                control={control}
                name="country"
                label="Country"
                readOnly={
                  (eductionCategoryId &&
                    !Number.isNaN(+eductionCategoryId) &&
                    !showEditForm) ||
                  false
                }
                onChange={() => {
                  resetField("educationCategoryLevels", {
                    defaultValue: [
                      {
                        educationalLevel: null as unknown as {
                          id: number;
                          name: string;
                        },
                        isFinalTerm: false,
                      },
                    ],
                  });
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
            <p className="text-xs font-normal">Additional Information</p>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 gap-6">
                {fields?.map((field, index) => {
                  const educationalLevel =
                    watchEducationalCategoryLevels?.[index]?.educationalLevel;
                  const isFinalTerm =
                    watchEducationalCategoryLevels?.[index]?.isFinalTerm ??
                    false;

                  return eductionCategoryId &&
                    !Number.isNaN(+eductionCategoryId) &&
                    !showEditForm &&
                    (educationalLevel?.id === null ||
                      educationalLevel?.id === undefined) ? null : (
                    <div key={index} className="grid grid-cols-1 gap-0.5">
                      <div
                        className="flex gap-2 items-center group"
                        key={field?.id}
                      >
                        <p className="text-[15px] font-medium w-[42px] h-[42px] min-w-[42px] flex justify-center items-center">
                          {index + 1}
                        </p>
                        <EducationLevelsField
                          control={control}
                          name={`educationCategoryLevels.${index}.educationalLevel`}
                          label="Level"
                          readOnly={
                            watchCountry?.id
                              ? (eductionCategoryId &&
                                  !Number.isNaN(+eductionCategoryId) &&
                                  !showEditForm) ||
                                false
                              : true
                          }
                          onChange={(educationalLevel) => {
                            if (
                              educationalLevel?.id &&
                              fields?.length - 1 === index
                            ) {
                              append({
                                educationalLevel: null as unknown as {
                                  id: number;
                                  name: string;
                                },
                                isFinalTerm: false,
                              });

                              fields?.forEach((_field, i) => {
                                resetField(
                                  `educationCategoryLevels.${i}.isFinalTerm`,
                                  { defaultValue: false }
                                );
                              });
                            }
                          }}
                          canClear={false}
                          args={{
                            filter: {
                              countryId: {
                                number: watchCountry?.id,
                              },
                              status: {
                                inArray: ["Active"],
                              },
                            },
                            isStatusNeed: true,
                          }}
                          classNameForParent={
                            educationalLevel?.id &&
                            educationalLevel?.status !== "Active"
                              ? "border-error-main hover:border-error-main"
                              : ""
                          }
                          classNameForLabel={
                            educationalLevel?.id &&
                            educationalLevel?.status !== "Active"
                              ? "text-error-main"
                              : ""
                          }
                        />
                        {fields?.length - 2 === index ? (
                          <div
                            className={combineClassName(
                              isFinalTerm
                                ? "block"
                                : "hidden group-focus-within:block"
                            )}
                          >
                            <CheckBox
                              control={control}
                              name={`educationCategoryLevels.${index}.isFinalTerm`}
                              label="Final Term"
                              onChange={() => {
                                fields?.forEach((_field, i) => {
                                  if (i !== index) {
                                    resetField(
                                      `educationCategoryLevels.${i}.isFinalTerm`,
                                      { defaultValue: false }
                                    );
                                  }
                                });
                              }}
                              readOnly={
                                watchCountry?.id &&
                                !(
                                  eductionCategoryId &&
                                  !Number.isNaN(+eductionCategoryId) &&
                                  !showEditForm
                                ) &&
                                educationalLevel?.id
                                  ? false
                                  : true
                              }
                            />
                          </div>
                        ) : null}
                        {educationalLevel?.id &&
                          !(
                            eductionCategoryId &&
                            !Number.isNaN(+eductionCategoryId) &&
                            !showEditForm
                          ) && (
                            <_Button
                              className={
                                "size-12 min-w-12 min-h-12 flex justify-center items-center bg-transparent focus:outline-none focus:bg-action-hover rounded-full text-action-active hover:bg-action-hover"
                              }
                              onPress={() => {
                                remove(index);
                              }}
                            >
                              <DeleteIcon />
                            </_Button>
                          )}
                      </div>
                      {educationCategoryLevels?.message &&
                      fields?.length - 2 === index ? (
                        <p className="text-xs text-error-main">
                          {educationCategoryLevels?.message}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                readOnly={
                  (eductionCategoryId &&
                    !Number.isNaN(+eductionCategoryId) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm &&
          eductionCategoryId &&
          !Number.isNaN(+eductionCategoryId)
            ? cancelButton
            : eductionCategoryId && Number.isNaN(+eductionCategoryId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              eductionCategoryId && !Number.isNaN(+eductionCategoryId)
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
              eductionCategoryId && !Number.isNaN(+eductionCategoryId)
                ? !canUpdate
                : !canCreate
            }
          >
            {eductionCategoryId && !Number.isNaN(+eductionCategoryId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          eductionCategoryId && Number.isNaN(+eductionCategoryId)
            ? "Create"
            : "Edit"
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

export default EducationalCategoryForm;
