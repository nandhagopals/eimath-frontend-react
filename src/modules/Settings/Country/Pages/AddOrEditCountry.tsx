import { Fragment, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Form, FormSubmitHandler } from "react-hook-form";

import { Button } from "components/Buttons";
import { InputField } from "components/Form";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

import { useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";

import {
  CREATE_COUNTRY,
  FILTER_COUNTRIES,
  UPDATE_COUNTRY,
  countryFormSchema,
  type CountryForm,
} from "modules/Settings/Country";
import { ConfirmModal } from "components/Modal";

const fieldArgs = {
  isCountryCodeNeed: true,
  isCountryCurrencyNeed: true,
  isCountryIsdCodeNeed: true,
};

const AddOrEditCountry = () => {
  const navigate = useNavigate();
  const { countryId } = useParams({
    from: "/private-layout/settings/countries/$countryId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchCountries, { loading, data }] = useLazyQuery(FILTER_COUNTRIES, {
    fetchPolicy: "cache-and-network",
  });

  const country = data?.filterCountries?.edges?.[0]?.node || null;

  const [createCountry, { loading: createLoading }] =
    useMutation(CREATE_COUNTRY);

  const [updateCountry, { loading: updateLoading }] =
    useMutation(UPDATE_COUNTRY);

  const {
    control,
    formState: { isValid },
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: countryFormSchema,
    defaultValues: async () => {
      const country =
        countryId && !Number.isNaN(+countryId)
          ? await fetchCountries({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +countryId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterCountries) {
                  return data?.filterCountries?.edges?.[0]?.node || null;
                }

                if (error || !data?.filterCountries) {
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
        code: country?.code ?? "",
        currency: country?.currency ?? "",
        isdCode: country?.isdCode ?? "",
        name: country?.name ?? "",
      };
    },
  });

  const countrySubmitHandler: FormSubmitHandler<CountryForm> = ({
    data: { code, currency, isdCode, name },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      code: code?.trim(),
      isdCode: isdCode?.trim(),
      currency: currency?.trim(),
    };

    if (country?.id) {
      updateCountry({
        variables: {
          id: country?.id,
          ...fieldArgs,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateCountry?.id) {
            closeConfirmModal();

            navigate({
              to: "/settings/countries",
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
      createCountry({
        variables: {
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createCountry?.id) {
            navigate({
              to: "/settings/countries",
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

        countryId && Number.isNaN(+countryId)
          ? navigate({
              to: "/settings/countries",
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
      id="confirm-form"
      control={control}
      onSubmit={countrySubmitHandler}
      className="max-w-md"
    >
      <div className="py-2">
        <TitleAndBreadcrumb
          title={
            countryId && !Number.isNaN(+countryId)
              ? "Edit Country"
              : "Add Country"
          }
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Master Setting",
              to: "/settings/countries",
            },
            {
              name: "Countries",
              to: "/settings/countries",
            },
            {
              name:
                countryId && !Number.isNaN(+countryId)
                  ? "Edit Country"
                  : "Add Country",
              to: "/settings/countries/$countryId",
              params: { countryId: countryId as unknown as undefined },
            },
          ]}
        />
      </div>
      <div className="border rounded bg-primary-contrast p-4 md:p-8 shadow-card-outline mt-6 space-y-3 md:space-y-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => {
            return (
              <div
                key={i}
                className="min-h-[56px] animate-pulse bg-slate-200 rounded-lg"
              />
            );
          })
        ) : (
          <Fragment>
            <InputField
              control={control}
              name="name"
              label="Name"
              readOnly={
                (countryId && !Number.isNaN(+countryId) && !showEditForm) ||
                false
              }
            />
            <InputField
              control={control}
              name="code"
              label="Code"
              readOnly={
                (countryId && !Number.isNaN(+countryId) && !showEditForm) ||
                false
              }
            />
            <InputField
              control={control}
              name="isdCode"
              label="ISD code"
              readOnly={
                (countryId && !Number.isNaN(+countryId) && !showEditForm) ||
                false
              }
            />
            <InputField
              control={control}
              name="currency"
              label="Currency"
              readOnly={
                (countryId && !Number.isNaN(+countryId) && !showEditForm) ||
                false
              }
            />
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && countryId && !Number.isNaN(+countryId)
            ? cancelButton
            : countryId && Number.isNaN(+countryId)
            ? cancelButton
            : null}
          <Button
            type={isValid ? "button" : "submit"}
            className={"w-[100px]"}
            onPress={() => {
              countryId && !Number.isNaN(+countryId)
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
            {countryId && !Number.isNaN(+countryId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CREATE"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          countryId && Number.isNaN(+countryId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "confirm-form",
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

export default AddOrEditCountry;
