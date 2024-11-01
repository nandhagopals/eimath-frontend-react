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

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, notEmpty } from "global/helpers";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";

import { CountryField } from "modules/Settings/Country";
import {
  educationalLevelFormSchema,
  CREATE_EDUCATIONAL_LEVEL,
  EducationalLevelForm,
  FILTER_EDUCATIONAL_LEVELS,
  UPDATE_EDUCATIONAL_LEVEL,
} from "modules/EducationMaterials/Levels";
import EducationTermsField from "modules/EducationMaterials/Terms/helpers/EducationTermsField";

const fieldArgs = {
  isPriceNeed: true,
  isCountryDetailsNeed: true,
  isStatusNeed: true,
  isRemarksNeed: true,
  isEducationalTermsNeed: true,
};

const LevelForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("EducationalLevel", true);
  const navigate = useNavigate();

  const { eductionLevelId } = useParams({
    from: "/private-layout/education-materials/levels/$eductionLevelId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchLevel, { loading, data }] = useLazyQuery(
    FILTER_EDUCATIONAL_LEVELS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const level = data?.filterEducationalLevels?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] = useMutation(
    CREATE_EDUCATIONAL_LEVEL
  );

  const [updateMutation, { loading: updateLoading }] = useMutation(
    UPDATE_EDUCATIONAL_LEVEL
  );

  const {
    control,
    formState: { isValid },
    resetField,
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: educationalLevelFormSchema,
    defaultValues: async () => {
      const level =
        eductionLevelId && !Number.isNaN(+eductionLevelId)
          ? await fetchLevel({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +eductionLevelId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterEducationalLevels) {
                  return (
                    data?.filterEducationalLevels?.edges?.[0]?.node || null
                  );
                }

                if (error || !data?.filterEducationalLevels) {
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

      const educationalLevelTerms =
        (level?.educationalLevelTerms &&
          level?.educationalLevelTerms
            .map((educationalTerm) => {
              if (educationalTerm?.educationalTerm?.id) {
                return {
                  educationalTerm: {
                    id: educationalTerm?.educationalTerm?.id,
                    name: educationalTerm?.educationalTerm?.name || "N/A",
                    status: educationalTerm?.educationalTerm?.status,
                  },
                  position: educationalTerm?.position || 1,
                };
              } else {
                return null;
              }
            })
            .filter(notEmpty)) ||
        [];

      return {
        name: level?.name ?? "",
        country: level?.country?.id
          ? {
              id: level?.country?.id,
              name: level?.country?.name ?? "N/A",
              status: level?.country?.status,
            }
          : (null as unknown as { id: number; name: string; status: string }),
        remarks: level?.remarks ?? "",
        educationalTerms:
          educationalLevelTerms?.length > 0
            ? [
                ...educationalLevelTerms,
                {
                  educationalTerm: null as unknown as {
                    id: number;
                    name: string;
                    status: string;
                  },
                  position: educationalLevelTerms?.length || 1,
                },
              ]
            : [
                {
                  educationalTerm: null as unknown as {
                    id: number;
                    name: string;
                    status: string;
                  },
                  position: 1,
                },
              ],
      };
    },
  });

  const [watchEducationalTerms, watchCountry] = useWatch({
    control,
    name: ["educationalTerms", "country"],
  });

  const educationLevelSubmitHandler: FormSubmitHandler<
    EducationalLevelForm
  > = ({ data: { name, country, remarks, educationalTerms } }) => {
    const commonArgs = {
      name: name?.trim(),
      countryId: country?.id,
      remarks: remarks,
      educationalTerms:
        educationalTerms && educationalTerms?.length > 0
          ? educationalTerms
              ?.map((educationalTerm, index) => {
                if (
                  educationalTerm?.educationalTerm?.id &&
                  // educationalTerm?.educationalTerm?.status === "Active" &&
                  educationalTerm?.position
                ) {
                  return {
                    termId: educationalTerm?.educationalTerm?.id,
                    position: index + 1,
                  };
                } else {
                  // resetField(`educationalTerms.${index}.educationalTerm`, {
                  //   defaultValue: null,
                  // });
                  // remove(index);
                  return null;
                }
              })
              ?.filter(notEmpty)
          : [],
    };

    if (level?.id) {
      updateMutation({
        variables: {
          id: level?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateEducationalLevel?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/levels",
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
          if (data?.createEducationalLevel?.id) {
            closeConfirmModal();

            navigate({
              to: "/education-materials/levels",
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

        eductionLevelId && Number.isNaN(+eductionLevelId)
          ? navigate({
              to: "/education-materials/levels",
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "educationalTerms",
  });

  return (
    <Form
      id={"level-form"}
      control={control}
      onSubmit={educationLevelSubmitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          eductionLevelId && !Number.isNaN(+eductionLevelId)
            ? "Edit Level"
            : "Create Level"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Education Materials",
            to: "/education-materials/levels",
          },
          {
            name: "Levels",
            to: "/education-materials/levels",
          },
          {
            name:
              eductionLevelId && !Number.isNaN(+eductionLevelId)
                ? "Edit Level"
                : "Create Level",
            to: "/education-materials/levels/$eductionLevelId",
            params: {
              eductionLevelId: eductionLevelId as unknown as undefined,
            },
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
            <p className="font-normal text-xs">Level Information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                control={control}
                name="name"
                label="Level Name"
                readOnly={
                  (eductionLevelId &&
                    !Number.isNaN(+eductionLevelId) &&
                    !showEditForm) ||
                  false
                }
              />
              <CountryField
                control={control}
                name="country"
                label="Country"
                readOnly={
                  (eductionLevelId &&
                    !Number.isNaN(+eductionLevelId) &&
                    !showEditForm) ||
                  false
                }
                onChange={() => {
                  resetField("educationalTerms", {
                    defaultValue: [
                      {
                        educationalTerm: null as unknown as {
                          id: number;
                          name: string;
                        },
                        position: 1 as unknown as number,
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
            <p className="font-normal text-xs">Additional Information</p>
            <div className="grid grid-cols-1 gap-6">
              {fields?.map((field, index) => {
                const educationalTerm =
                  watchEducationalTerms?.[index]?.educationalTerm;
                return eductionLevelId &&
                  !Number.isNaN(+eductionLevelId) &&
                  !showEditForm &&
                  (educationalTerm?.id === null ||
                    educationalTerm?.id === undefined) ? null : (
                  <div className="flex gap-2 items-center" key={field?.id}>
                    <p className="text-[15px] font-medium w-[42px] h-[42px] flex justify-center items-center">
                      {index + 1}
                    </p>
                    <EducationTermsField
                      control={control}
                      name={`educationalTerms.${index}.educationalTerm`}
                      label="Terms"
                      readOnly={
                        watchCountry?.id
                          ? (eductionLevelId &&
                              !Number.isNaN(+eductionLevelId) &&
                              !showEditForm) ||
                            false
                          : true
                      }
                      onChange={(educationalTerm) => {
                        if (
                          educationalTerm?.id &&
                          fields?.length - 1 === index
                        ) {
                          append({
                            educationalTerm: null as unknown as {
                              id: number;
                              name: string;
                            },
                            position: fields?.length,
                          });
                        }
                      }}
                      canClear={false}
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
                      classNameForParent={
                        educationalTerm?.id &&
                        educationalTerm?.status !== "Active"
                          ? "border-error-main hover:border-error-main"
                          : ""
                      }
                      classNameForLabel={
                        educationalTerm?.id &&
                        educationalTerm?.status !== "Active"
                          ? "text-error-main"
                          : ""
                      }
                    />
                    {educationalTerm?.id &&
                      !(
                        eductionLevelId &&
                        !Number.isNaN(+eductionLevelId) &&
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
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-6">
              <InputField
                control={control}
                name="remarks"
                label="Remarks"
                readOnly={
                  (eductionLevelId &&
                    !Number.isNaN(+eductionLevelId) &&
                    !showEditForm) ||
                  false
                }
              />
            </div>
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && eductionLevelId && !Number.isNaN(+eductionLevelId)
            ? cancelButton
            : eductionLevelId && Number.isNaN(+eductionLevelId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              eductionLevelId && !Number.isNaN(+eductionLevelId)
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
              eductionLevelId && !Number.isNaN(+eductionLevelId)
                ? !canUpdate
                : !canCreate
            }
          >
            {eductionLevelId && !Number.isNaN(+eductionLevelId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          eductionLevelId && Number.isNaN(+eductionLevelId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "level-form",
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

export default LevelForm;
