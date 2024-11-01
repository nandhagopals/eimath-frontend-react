/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Form, useWatch, type FormSubmitHandler } from "react-hook-form";

import { Select } from "components/Form";
import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { ConfirmModal } from "components/Modal";

import { useFormWithZod, usePreLoading } from "global/hook";
import { toastNotification } from "global/cache";
import { combineClassName, messageHelper } from "global/helpers";
import useCheckboxTree, { flattenNodes } from "global/hook/useCheckboxTree";

import { ACL_TREE } from "modules/Accounts/RoleAccess";
import Role from "modules/Accounts/RoleAccess/Page/RoleAccessForm/ACL/Role";
import {
  GET_MASTER_FRANCHISEE_PRIVILEGE,
  MasterFranchiseePrivilegeForm,
  masterFranchiseePrivilegeFormSchema,
  MANAGE_MASTER_FRANCHISEE_PRIVILEGE,
} from "modules/Accounts/MasterFranchiseePrivilege";

const MasterFranchiseePrivilege = () => {
  const {
    control,
    formState: { isValid },
  } = useFormWithZod({
    schema: masterFranchiseePrivilegeFormSchema,
    defaultValues: {
      type: "MF Owner",
    },
  });

  const watchType = useWatch({
    control,
    name: "type",
  });

  const { data: getMasterFranchiseePrivilege, loading } = useQuery(
    GET_MASTER_FRANCHISEE_PRIVILEGE,
    {
      skip: watchType ? false : true,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      variables: {
        type: watchType || "MF Owner",
      },
    }
  );

  const { data } = useQuery(ACL_TREE, {
    variables: {
      isMyRole: false,
      isACLTreeResourceIdNeed: true,
    },
    fetchPolicy: "no-cache",
  });

  const [
    manageMasterFranchiseePrivilege,
    { loading: manageMasterFranchiseePrivilegeLoading },
  ] = useMutation(MANAGE_MASTER_FRANCHISEE_PRIVILEGE);

  const [confirmEdit, setConfirmEdit] = useState<{
    type: "create";
    showModal: boolean;
  }>({
    type: "create",
    showModal: false,
  });

  const masterFranchiseePrivilegeHandler: FormSubmitHandler<
    MasterFranchiseePrivilegeForm
  > = ({ data: { type } }) => {
    if (!manageMasterFranchiseePrivilegeLoading) {
      manageMasterFranchiseePrivilege({
        variables: {
          type,
          allowedResourceIds: checked && checked?.length > 0 ? checked : [],
          intermediateResourceIds:
            indeterminate && indeterminate?.length > 0 ? indeterminate : [],
        },
      })
        .then(() => {
          setConfirmEdit((prev) => ({
            ...prev,
            showModal: false,
          }));
        })
        .catch((error) => toastNotification(messageHelper(error)));
    }
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
      getMasterFranchiseePrivilege?.getMasterFranchiseePrivilege?.resourceId ||
      data?.aclTree?.resourceId
    ) {
      setAclTree(
        getMasterFranchiseePrivilege?.getMasterFranchiseePrivilege?.resourceId
          ? getMasterFranchiseePrivilege?.getMasterFranchiseePrivilege
              ?.resourceId || []
          : data?.aclTree?.resourceId || []
      );
      const nodes: any = [
        ...flattenNodes(
          getMasterFranchiseePrivilege?.getMasterFranchiseePrivilege?.resourceId
            ? (getMasterFranchiseePrivilege?.getMasterFranchiseePrivilege
                ?.resourceId as any) || []
            : (data?.aclTree?.resourceId as any) || []
        ).values(),
      ]
        .filter((node) => node?.isAllowed)
        .map((node) => `${node?.id}`);

      setChecked(nodes);
    }
  }, [
    getMasterFranchiseePrivilege?.getMasterFranchiseePrivilege?.resourceId,
    data,
    setChecked,
  ]);

  const preLoading = usePreLoading(loading);

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
          title="Master Franchisee & Access"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Accounts",
              to: "/accounts/master-franchisee-access",
            },
            {
              name: "Master Franchisee & Access",
              to: "/accounts/master-franchisee-access",
            },
          ]}
        />
      </div>
      <Form
        control={control}
        onSubmit={masterFranchiseePrivilegeHandler}
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
            <div className={`w-full space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:gap-10 gap-4 justify-between">
                <Select
                  control={control}
                  name="type"
                  options={["MF Owner", "MF Staff"]}
                />
                <Button
                  type="button"
                  children={expandAll ? "Collapse All" : "Expand All"}
                  onPress={expandAllClickHandler}
                  className="w-min whitespace-nowrap max-h-[56px]"
                />
              </div>
              <Role
                expandAll={expandAll}
                expandAllClickHandler={expandAllClickHandler}
                aclTree={aclTree}
                selectNode={selectNode}
                state={state}
                hideExpandAll
              />
              <div className="flex justify-end">
                <Button
                  className={"w-[100px] px-0"}
                  onPress={() => {
                    if (confirmEdit.type === "create" && watchType) {
                      setConfirmEdit((prev) => ({
                        ...prev,
                        showModal: true,
                      }));
                    }
                  }}
                  type={isValid ? "button" : "submit"}
                >
                  Save
                </Button>
              </div>
            </div>
          </Fragment>
        )}
      </Form>
      <ConfirmModal
        message="Confirm Save?"
        onClose={closeConfirmModal}
        button={{
          primary: {
            loading: manageMasterFranchiseePrivilegeLoading,
            type: "submit",
            form: "confirm-form",
          },
          secondary: {
            isDisabled: manageMasterFranchiseePrivilegeLoading,
          },
        }}
        isOpen={confirmEdit?.showModal}
        loading={manageMasterFranchiseePrivilegeLoading}
      />
    </div>
  );
};

export default MasterFranchiseePrivilege;
