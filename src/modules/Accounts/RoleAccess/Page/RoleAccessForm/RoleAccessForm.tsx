/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Form, type FormSubmitHandler, useWatch } from "react-hook-form";

import { InputField, Switch, TextArea } from "components/Form";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { ConfirmModal } from "components/Modal";

import { useFormWithZod, usePreLoading } from "global/hook";
import { toastNotification } from "global/cache";
import { combineClassName, messageHelper } from "global/helpers";
import useCheckboxTree, { flattenNodes } from "global/hook/useCheckboxTree";

import {
  ACL_TREE,
  CREATE_ROLE,
  FILTER_ROLES,
  UPDATE_ROLE,
  RoleForm,
  roleFormSchema,
} from "modules/Accounts/RoleAccess";
import Role from "modules/Accounts/RoleAccess/Page/RoleAccessForm/ACL/Role";

const RoleAccessForm = () => {
  // const { canUpdate, canCreate } = useAllowedResource("Role", true);

  const { roleAccessId } = useParams({
    from: "/private-layout/accounts/role-access/$roleAccessId",
  });

  const navigate = useNavigate();

  const [fetchRole, { data: filterRoles, loading }] = useLazyQuery(
    FILTER_ROLES,
    {
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    }
  );

  const role =
    filterRoles?.filterRoles?.edges &&
    filterRoles?.filterRoles?.edges?.length > 0 &&
    filterRoles?.filterRoles?.edges[0]
      ? filterRoles?.filterRoles?.edges[0]
      : undefined;

  const {
    control,
    formState: { isValid },
  } = useFormWithZod({
    schema: roleFormSchema,
    defaultValues: async () => {
      const role =
        roleAccessId && !Number.isNaN(+roleAccessId)
          ? await fetchRole({
              variables: {
                filter: {
                  id: {
                    number: +roleAccessId,
                  },
                },
                isRoleDescriptionNeed: true,
                isRoleHasFullPrivilegeNeed: true,
                isRoleResourceIdsNeed: true,
                isRoleAllowedResourceIdsNeed: true,
              },
            })
              .then(({ data }) => {
                return data?.filterRoles?.edges &&
                  data?.filterRoles?.edges?.length > 0 &&
                  data?.filterRoles?.edges[0]?.node
                  ? data?.filterRoles?.edges[0]?.node
                  : undefined;
              })
              .catch((error) => {
                toastNotification(messageHelper(error));
                return undefined;
              })
          : undefined;

      return {
        name: role?.name || (null as unknown as string),
        description: role?.description || null,
        hasFullPrivilege: role?.hasFullPrivilege || false,
      };
    },
  });

  const [hasFullPrivilege] = useWatch({
    control,
    name: ["hasFullPrivilege"],
  });

  const { data } = useQuery(ACL_TREE, {
    variables: {
      isMyRole: false,
      isACLTreeResourceIdNeed: true,
    },
    fetchPolicy: "no-cache",
  });

  const [createRole, { loading: createLoading }] = useMutation(CREATE_ROLE);
  const [updateRole, { loading: updateLoading }] = useMutation(UPDATE_ROLE);

  const closeHandler = () => {
    navigate({
      to: "/accounts/role-access",
      search: true,
    });
  };

  const [confirmEdit, setConfirmEdit] = useState<
    | { type: "create"; showModal: boolean }
    | { type: "update"; isEdit: boolean; id: number; showModal: boolean }
  >(
    roleAccessId && !Number?.isNaN(+roleAccessId)
      ? {
          type: "update",
          id: +roleAccessId!,
          isEdit: false,
          showModal: false,
        }
      : {
          type: "create",
          showModal: false,
        }
  );
  const roleSubmitHandler: FormSubmitHandler<RoleForm> = ({
    data: { name, description, hasFullPrivilege },
  }) => {
    const commonArgs = {
      name: name?.trim(),
      description: description ? description : null,
      allowedResourceIds: hasFullPrivilege
        ? null
        : checked && checked?.length > 0
        ? checked
        : [],
      intermediateResourceIds: hasFullPrivilege
        ? null
        : indeterminate && indeterminate?.length > 0
        ? indeterminate
        : [],
      hasFullPrivilege,
    };
    if (roleAccessId && !Number.isNaN(+roleAccessId)) {
      updateRole({
        variables: {
          id: +roleAccessId,
          ...commonArgs,
        },
      })
        .then(({ data }) => {
          if (data?.updateRole?.id) {
            setPage("form");
            setConfirmEdit((prev) => ({
              ...prev,
              showModal: false,
            }));
            closeHandler();
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
    } else
      createRole({
        variables: {
          ...commonArgs,
        },
      })
        .then(closeHandler)
        .catch((error) => toastNotification(messageHelper(error)));
  };

  const [expandAll, setExpandAll] = useState(false);

  const expandAllClickHandler = () => {
    setExpandAll(!expandAll);
  };

  const [aclTree, setAclTree] = useState<any[]>([]);

  const { checked, selectNode, state, setChecked, indeterminate } =
    useCheckboxTree<string>(aclTree, []);

  useEffect(() => {
    if (
      role?.node?.allowedResourceIds?.resourceId ||
      data?.aclTree?.resourceId
    ) {
      setAclTree(
        role?.node?.allowedResourceIds?.resourceId
          ? role?.node?.allowedResourceIds?.resourceId || []
          : data?.aclTree?.resourceId || []
      );
      const nodes: any = [
        ...flattenNodes(
          role?.node?.allowedResourceIds?.resourceId
            ? (role?.node?.allowedResourceIds?.resourceId as any) || []
            : (data?.aclTree?.resourceId as any) || []
        ).values(),
      ]
        .filter((node) => node?.isAllowed)
        .map((node) => `${node?.id}`);

      setChecked(nodes);
    }
  }, [data, role, setChecked]);

  const preLoading = usePreLoading(loading);

  const [page, setPage] = useState<"form" | "aclTree">("form");

  const closeConfirmModal = () => {
    setConfirmEdit((prev) => ({
      ...prev,
      showModal: false,
    }));
  };

  return (
    <div className="min-h-[calc(100vh-14vh)]">
      <div className="py-2">
        <TitleAndBreadcrumb
          title={role?.node?.id ? "Edit Role & Access" : "Create Role & Access"}
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Accounts",
              to: "/accounts/role-access",
            },
            {
              name: "Role & Access",
              to: "/accounts/role-access",
            },
            {
              name: role?.node?.id
                ? "Edit Role & Access"
                : "Create Role & Access",
              to: "/accounts/role-access",
            },
          ]}
        />
      </div>
      <Form
        control={control}
        onSubmit={roleSubmitHandler}
        className={combineClassName(
          "max-w-lg rounded bg-primary-contrast p-4 md:p-8 shadow-card-outline mt-6"
        )}
        id="confirm-form"
      >
        {preLoading ? (
          <div className="grid gap-5">
            {Array.from({ length: 4 }).map((_, i) => {
              return (
                <div
                  key={i}
                  className="min-h-[56px] animate-pulse bg-slate-200 rounded-lg"
                />
              );
            })}
          </div>
        ) : (
          <Fragment>
            <div
              className={`space-y-6 ${page === "form" ? "block" : "hidden"}`}
            >
              <InputField control={control} name="name" label="Name" />
              <Switch
                control={control}
                label="Is super admin?"
                name="hasFullPrivilege"
                className="mb-6"
              />
              <TextArea
                control={control}
                name="description"
                label="Description"
              />

              <div className="flex justify-end gap-2.5">
                <Button
                  className={
                    "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
                  }
                  onPress={() => {
                    if (confirmEdit?.type === "update" && confirmEdit?.isEdit) {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        isEdit: false,
                      }));
                    } else {
                      navigate({
                        to: "/accounts/role-access",
                      });
                    }
                  }}
                >
                  {confirmEdit?.type === "update" && confirmEdit?.isEdit
                    ? "CANCEL"
                    : "BACK"}
                </Button>
                <Button
                  className={"w-[100px]"}
                  onPress={() => {
                    if (!hasFullPrivilege && isValid) {
                      setPage("aclTree");
                    } else if (confirmEdit?.type === "create" && isValid) {
                      setConfirmEdit({
                        type: "create",
                        showModal: true,
                      });
                    } else if (
                      confirmEdit?.type === "update" &&
                      confirmEdit?.isEdit &&
                      isValid
                    ) {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        showModal: true,
                      }));
                    } else if (confirmEdit?.type === "update" && isValid) {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        isEdit: true,
                      }));
                    }
                  }}
                  type={isValid ? "button" : "submit"}
                >
                  {hasFullPrivilege
                    ? role?.node?.id
                      ? confirmEdit?.type === "update"
                        ? confirmEdit?.isEdit
                          ? "SAVE"
                          : "EDIT"
                        : "EDIT"
                      : "CREATE"
                    : "NEXT"}
                </Button>
              </div>
            </div>
            <div
              className={`w-full space-y-4 ${
                page === "aclTree" ? "block" : "hidden"
              }`}
            >
              <Role
                expandAll={expandAll}
                expandAllClickHandler={expandAllClickHandler}
                aclTree={aclTree}
                selectNode={selectNode}
                state={state}
              />

              <div className="flex justify-end gap-2.5">
                <Button
                  className={
                    "w-[100px] bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover px-0"
                  }
                  onPress={() => {
                    if (
                      confirmEdit.type === "create" ||
                      (confirmEdit?.type === "update" && !confirmEdit?.isEdit)
                    ) {
                      setPage("form");
                    } else if (confirmEdit?.isEdit) {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        isEdit: false,
                      }));
                    }
                  }}
                >
                  {confirmEdit?.type === "create" ||
                  (confirmEdit?.type === "update" && !confirmEdit?.isEdit)
                    ? "BACK"
                    : "CANCEL"}
                </Button>
                <Button
                  className={"w-[100px] px-0"}
                  onPress={() => {
                    if (
                      confirmEdit.type === "create" ||
                      (confirmEdit?.type === "update" && confirmEdit?.isEdit)
                    ) {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        showModal: true,
                      }));
                    } else {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        isEdit: true,
                      }));
                    }
                  }}
                  type={isValid ? "button" : "submit"}
                >
                  {confirmEdit?.type === "create"
                    ? "CONFIRM"
                    : confirmEdit?.isEdit
                    ? "SAVE"
                    : "EDIT"}
                </Button>
              </div>
            </div>
          </Fragment>
        )}
      </Form>
      <ConfirmModal
        message={`Confirm ${
          confirmEdit?.type === "update" ? "Edit" : "Create"
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
        isOpen={confirmEdit?.showModal}
        loading={createLoading || updateLoading}
      />
    </div>
  );
};

export default RoleAccessForm;
