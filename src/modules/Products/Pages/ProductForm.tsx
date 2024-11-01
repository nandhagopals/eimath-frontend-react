import { Fragment, useState } from "react";
import {
  Form,
  FormSubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { InputField, Switch, TextArea } from "components/Form";
import { Button } from "components/Buttons";
import { ConfirmModal } from "components/Modal";
import { FileUpload } from "components/Form/FileUpload";

import { useAllowedResource, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper, notEmpty, urlToOtherType } from "global/helpers";
import AddIcon from "global/assets/images/add-filled.svg?react";
import DeleteIcon from "global/assets/images/delete-forever-filled.svg?react";

import {
  CREATE_PRODUCT,
  FILTER_PRODUCTS,
  ProductForm as ProductFormType,
  ProductsFieldArgs,
  UPDATE_PRODUCT,
  productFormSchema,
  ProductCategoryField,
} from "modules/Products";

const fieldArgs: ProductsFieldArgs = {
  isDescriptionNeed: true,
  isHasVarianceNeed: true,
  isPointsNeed: true,
  isProductCategoryNeed: true,
  isProductImageNeed: true,
  isProductVarianceNeed: true,
  isIsComesUnderRoyaltyNeed: true,
};

const ProductForm = () => {
  const { canCreate, canUpdate } = useAllowedResource("Product", true);
  const navigate = useNavigate();

  const { productId } = useParams({
    from: "/private-layout/products/$productId",
  });

  const [showEditForm, setShowEditForm] = useState(false);

  const [fetchProduct, { loading, data }] = useLazyQuery(FILTER_PRODUCTS, {
    fetchPolicy: "cache-and-network",
  });

  const product = data?.filterProducts?.edges?.[0]?.node || null;

  const [createMutation, { loading: createLoading }] =
    useMutation(CREATE_PRODUCT);

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_PRODUCT);

  const {
    control,
    formState: { isValid },
    clearErrors,
    reset,
  } = useFormWithZod({
    schema: productFormSchema,
    defaultValues: async () => {
      const product =
        productId && !Number.isNaN(+productId)
          ? await fetchProduct({
              variables: {
                ...fieldArgs,
                filter: {
                  id: {
                    number: +productId,
                  },
                },
              },
            })
              .then(({ data, error }) => {
                if (data?.filterProducts) {
                  return data?.filterProducts?.edges?.[0]?.node || null;
                }

                if (error || !data?.filterProducts) {
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

      const productImagePromises =
        product?.productImages && product?.productImages?.length > 0
          ? product?.productImages?.map(async (item, index) => {
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

      const productImageFiles = (
        await Promise.all(productImagePromises)
      )?.filter(notEmpty);

      const productImage =
        productImageFiles && productImageFiles?.length > 0
          ? productImageFiles[0]
          : null;

      return {
        name: product?.name ?? "",
        points: product?.points || (null as unknown as number),
        productCategories:
          product?.productCategory && product?.productCategory?.length > 0
            ? product?.productCategory
                ?.map((productCategory) =>
                  productCategory?.id && productCategory?.name
                    ? {
                        id: productCategory?.id,
                        name: productCategory?.name,
                      }
                    : null
                )
                ?.filter(notEmpty)
            : [],
        description: product?.description,
        hasVariance: product?.hasVariance ? true : false,
        productImage:
          productImage ||
          (null as unknown as {
            id: number;
            file: File;
          }),
        productVariances:
          product?.productVariance && product?.productVariance?.length > 0
            ? [
                ...(product?.productVariance
                  ?.map((productVariance) =>
                    productVariance?.id && productVariance?.name
                      ? {
                          id: productVariance?.id,
                          name: productVariance?.name,
                        }
                      : null
                  )
                  ?.filter(notEmpty) || []),
                { name: "" },
              ]
            : [
                {
                  name: "",
                },
              ],
        isComesUnderRoyalty: product?.isComesUnderRoyalty ?? false,
      };
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productVariances",
  });

  const watchHasVariance = useWatch({
    control,
    name: "hasVariance",
  });

  const addVarianceTypeHandler = () => {
    if (showEditForm || productId === "new") {
      append({
        name: "",
      });
    }
  };

  const submitHandler: FormSubmitHandler<ProductFormType> = ({
    data: {
      name,
      points,
      productCategories,
      description,
      hasVariance,
      productImage,
      productVariances,
      isComesUnderRoyalty,
    },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      points,
      productCategoryIds: productCategories?.map(
        (productCategory) => productCategory?.id
      ),
      productImage: productImage?.file
        ? productImage?.file
        : product?.id
        ? null
        : undefined,
      description: description?.trim() || undefined,
      hasVariance: hasVariance ? true : false,
      productVariances: productVariances
        ?.map((productVariance) =>
          productVariance?.name
            ? {
                id: productVariance?.id,
                name: productVariance?.name,
              }
            : null
        )
        ?.filter(notEmpty),
      isComesUnderRoyalty,
    };

    if (product?.id) {
      updateMutation({
        variables: {
          id: product?.id,
          ...commonArgs,
          ...fieldArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateProduct?.id) {
            navigate({
              to: "/products",
            });
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
          ...fieldArgs,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.createProduct?.id) {
            navigate({
              to: "/products",
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

        productId && Number.isNaN(+productId)
          ? navigate({
              to: "/products",
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
      id={"product-form"}
      control={control}
      onSubmit={submitHandler}
      className="max-w-4xl pt-2"
    >
      <TitleAndBreadcrumb
        title={
          productId && !Number.isNaN(+productId)
            ? "Edit Product"
            : "Create Product"
        }
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Products",
            to: "/products",
          },
          {
            name:
              productId && !Number.isNaN(+productId)
                ? "Edit Product"
                : "Create Product",
            to: "/products/$productId",
            params: { productId: productId as unknown as undefined },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="name"
                label="Product Name"
                readOnly={
                  (productId && !Number.isNaN(+productId) && !showEditForm) ||
                  false
                }
              />
              <ProductCategoryField
                control={control}
                name="productCategories"
                label="Category"
                readOnly={
                  (productId && !Number.isNaN(+productId) && !showEditForm) ||
                  false
                }
                multiple
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
              <InputField
                control={control}
                name="points"
                label="Points"
                type="number"
                readOnly={
                  (productId && !Number.isNaN(+productId) && !showEditForm) ||
                  false
                }
              />
              <div className="flex gap-3.5 items-center">
                <p className="text-[#202223] text-xs">Variance?</p>
                <Switch
                  control={control}
                  name="hasVariance"
                  readOnly={
                    (productId && !Number.isNaN(+productId) && !showEditForm) ||
                    false
                  }
                />
              </div>
            </div>
            <div className="flex gap-3.5 items-center my-3">
              <p className="text-[#202223] text-xs">Is comes under royalty?</p>
              <Switch
                control={control}
                name="isComesUnderRoyalty"
                readOnly={
                  (productId && !Number.isNaN(+productId) && !showEditForm) ||
                  false
                }
              />
            </div>
            <TextArea
              control={control}
              name="description"
              label="Description/Information"
              className="pb-6 border-b border-standard-input-line"
              readOnly={
                (productId && !Number.isNaN(+productId) && !showEditForm) ||
                false
              }
            />
            {watchHasVariance &&
              fields?.map((field, index) => (
                <div
                  key={field?.id}
                  className={`${
                    index + 1 === fields?.length
                      ? "pb-6 border-b border-standard-input-line "
                      : ""
                  } flex items-center gap-3.5`}
                >
                  <InputField
                    control={control}
                    name={`productVariances.${index}.name`}
                    label="Variance Type"
                    type="text"
                    readOnly={
                      (productId &&
                        !Number.isNaN(+productId) &&
                        !showEditForm) ||
                      false
                    }
                  />
                  {index + 1 === fields?.length ? (
                    <Button
                      className={`w-min bg-none whitespace-nowrap bg-secondary-button mr-2 rounded-full text-primary-text hover:bg-secondary-button-hover ${
                        showEditForm || productId === "new"
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                      onPress={addVarianceTypeHandler}
                      isDisabled={createLoading || updateLoading}
                    >
                      <p className="flex justify-between items-center gap-2 text-primary-text font-medium text-sm">
                        <AddIcon className="w-6 h-6" />
                        <span>VARIANCE TYPE</span>
                      </p>
                    </Button>
                  ) : (
                    <div className={``}>
                      <DeleteIcon
                        className={`size-6 min-w-6 min-h-6 flex justify-center items-center bg-transparent focus:outline-none focus:bg-action-hover rounded-full text-action-active hover:bg-action-hover ${
                          showEditForm || productId === "new"
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                        onClick={() => {
                          (showEditForm || productId === "new") &&
                            remove(index);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            <FileUpload
              control={control}
              label={"Product Image"}
              name={"productImage"}
              canClear
              readOnly={
                (productId && !Number.isNaN(+productId) && !showEditForm) ||
                false
              }
            />
          </Fragment>
        )}
        <div className="flex justify-end gap-y-6 gap-2.5">
          {showEditForm && productId && !Number.isNaN(+productId)
            ? cancelButton
            : productId && Number.isNaN(+productId)
            ? cancelButton
            : null}

          <Button
            type={isValid ? "button" : "submit"}
            className={"w-min"}
            onPress={() => {
              productId && !Number.isNaN(+productId)
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
              productId && !Number.isNaN(+productId) ? !canUpdate : !canCreate
            }
          >
            {productId && !Number.isNaN(+productId)
              ? showEditForm
                ? "SAVE"
                : "EDIT"
              : "CONFIRM"}
          </Button>
        </div>
      </div>

      <ConfirmModal
        message={`Confirm ${
          productId && Number.isNaN(+productId) ? "Create" : "Edit"
        }?`}
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: createLoading || updateLoading,
            type: "submit",
            form: "product-form",
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

export default ProductForm;
