/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@apollo/client";
import { Fragment, useEffect, useState } from "react";
import { Form } from "react-hook-form";
import { z } from "zod";

import { Button } from "components/Buttons";
import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { ConfirmModal } from "components/Modal";

import { useFormWithZod, usePreLoading } from "global/hook";
import { toastNotification } from "global/cache";
import { combineClassName, messageHelper } from "global/helpers";
import useCheckboxTree, { flattenNodes } from "global/hook/useCheckboxTree";

import Role from "modules/Accounts/RoleAccess/Page/RoleAccessForm/ACL/Role";
import {
  GET_FRANCHISEE_PRIVILEGE,
  MANAGE_FRANCHISEE_PRIVILEGE,
} from "modules/Accounts/FranchiseePrivilege";

const FranchiseePrivilege = () => {
  // const { canUpdate, canCreate } = useAllowedResource("Role", true);

  const {
    control,
    formState: { isValid },
  } = useFormWithZod({
    schema: z.object({}),
  });

  const { data: getFranchiseePrivilege, loading } = useQuery(
    GET_FRANCHISEE_PRIVILEGE,
    {
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [
    manageFranchiseePrivilege,
    { loading: manageFranchiseePrivilegeLoading },
  ] = useMutation(MANAGE_FRANCHISEE_PRIVILEGE);

  const [confirmEdit, setConfirmEdit] = useState<{
    type: "create";
    showModal: boolean;
  }>({
    type: "create",
    showModal: false,
  });

  const franchiseePrivilegeHandler = () => {
    if (!manageFranchiseePrivilegeLoading) {
      manageFranchiseePrivilege({
        variables: {
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
    if (getFranchiseePrivilege?.getFranchiseePrivilege?.resourceId) {
      setAclTree(
        getFranchiseePrivilege?.getFranchiseePrivilege?.resourceId || []
      );
      const nodes: any = [
        ...flattenNodes(
          (getFranchiseePrivilege?.getFranchiseePrivilege?.resourceId as any) ||
            []
        ).values(),
      ]
        .filter((node) => node?.isAllowed)
        .map((node) => `${node?.id}`);
      setChecked(nodes);
    }
  }, [getFranchiseePrivilege?.getFranchiseePrivilege?.resourceId, setChecked]);

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
          title="Franchisee & Access"
          breadcrumbs={[
            { name: "Home", to: "/dash-board" },
            {
              name: "Accounts",
              to: "/accounts/franchisee-access",
            },
            {
              name: "Franchisee & Access",
              to: "/accounts/franchisee-access",
            },
          ]}
        />
      </div>
      <Form
        control={control}
        onSubmit={franchiseePrivilegeHandler}
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
              <Role
                expandAll={expandAll}
                expandAllClickHandler={expandAllClickHandler}
                aclTree={aclTree}
                selectNode={selectNode}
                state={state}
              />
              <div className="flex justify-end">
                <Button
                  className={"w-[100px] px-0"}
                  onPress={() => {
                    if (confirmEdit.type === "create") {
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
            loading: manageFranchiseePrivilegeLoading,
            type: "submit",
            form: "confirm-form",
          },
          secondary: {
            isDisabled: manageFranchiseePrivilegeLoading,
          },
        }}
        isOpen={confirmEdit?.showModal}
        loading={manageFranchiseePrivilegeLoading}
      />
    </div>
  );
};

export default FranchiseePrivilege;
