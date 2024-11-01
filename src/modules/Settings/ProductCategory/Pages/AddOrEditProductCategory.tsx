import { Fragment, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Form, FormSubmitHandler } from "react-hook-form";

import { Button } from "components/Buttons";
import { InputField } from "components/Form";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { ConfirmModal } from "components/Modal";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";

import {
  CREATE_PRODUCT_CATEGORY,
  FILTER_PRODUCT_CATEGORIES,
  ProductCategoryForm,
  UPDATE_PRODUCT_CATEGORY,
  productCategoryFormSchema,
} from "modules/Settings/ProductCategory";

const AddOrEditProductCategory = () => {
  const { canCreate, canUpdate } = useAllowedResource("ProductCategory", true);
  const navigate = useNavigate();
  const { productCategoryId } = useParams({
    from: "/private-layout/settings/product-categories/$productCategoryId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchProductCategory, { loading, data }] = useLazyQuery(
    FILTER_PRODUCT_CATEGORIES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const productCategory =
    data?.filterProductCategories?.edges?.[0]?.node || null;

  const [createProductCategory, { loading: createLoading }] = useMutation(
    CREATE_PRODUCT_CATEGORY
  );

  const [updateProductCategory, { loading: updateLoading }] = useMutation(
    UPDATE_PRODUCT_CATEGORY
  );

  const {
    control,
    formState: { isValid },
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: productCategoryFormSchema,
    defaultValues: async () => {
      const productCategory =
        productCategoryId && !Number.isNaN(+productCategoryId)
          ? await fetchProductCategory({
              variables: {
                filter: {
                  id: {
                    number: +productCategoryId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterProductCategories) {
                  return (
                    data?.filterProductCategories?.edges?.[0]?.node || null
                  );
                }

                if (error || !data?.filterProductCategories) {
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
        name: productCategory?.name ?? "",
      };
    },
  });

  const productCategorySubmitHandler: FormSubmitHandler<
    ProductCategoryForm
  > = ({ data: { name } }) => {
    const commonArgs = {
      name: name?.trim(),
    };

    if (productCategory?.id) {
      updateProductCategory({
        variables: {
          id: productCategory?.id,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateProductCategory?.id) {
            navigate({
              to: "/settings/product-categories",
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
      createProductCategory({
        variables: {
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createProductCategory?.id) {
            navigate({
              to: "/settings/product-categories",
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

        productCategoryId && Number.isNaN(+productCategoryId)
          ? navigate({
              to: "/settings/product-categories",
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
      onSubmit={productCategorySubmitHandler}
      className="max-w-4xl"
    >
      <div className="py-2">
        <TitleAndBreadcrumb
          title={
            productCategoryId && !Number.isNaN(+productCategoryId)
              ? "Edit Product Category"
              : "Add Product Category"
          }
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Master Setting",
              to: "/settings/product-categories",
            },
            { name: "Product Categories", to: "/settings/product-categories" },
            {
              name:
                productCategoryId && !Number.isNaN(+productCategoryId)
                  ? "Edit Product Category"
                  : "Add Product Category",
              to: "/settings/product-categories/$productCategoryId",
              params: {
                productCategoryId: productCategoryId as unknown as undefined,
              },
            },
          ]}
        />
      </div>
      <div className="border rounded bg-primary-contrast p-4 md:p-8 mt-6 space-y-3 md:space-y-6">
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
                (productCategoryId &&
                  !Number.isNaN(+productCategoryId) &&
                  !showEditForm) ||
                false
              }
            />
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm &&
          productCategoryId &&
          !Number.isNaN(+productCategoryId)
            ? cancelButton
            : productCategoryId && Number.isNaN(+productCategoryId)
            ? cancelButton
            : null}
          <Button
            type={isValid ? "button" : "submit"}
            className={"w-[100px]"}
            onPress={() => {
              productCategoryId && !Number.isNaN(+productCategoryId)
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
              productCategoryId && !Number.isNaN(+productCategoryId)
                ? !canUpdate
                : !canCreate
            }
          >
            {productCategoryId && !Number.isNaN(+productCategoryId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CREATE"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          productCategoryId && Number.isNaN(+productCategoryId)
            ? "Create"
            : "Edit"
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

export default AddOrEditProductCategory;
