import { Fragment, useEffect, useState } from "react";
import { Form, FormSubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "components/Buttons";
import { InputField } from "components/Form";

import { useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { JWTDecoded, messageHelper } from "global/helpers";

import {
  AuthPageLayout,
  UPDATE_PASSWORD,
  updatePasswordFormSchema,
  UpdatePasswordForm,
  CREATE_MF_PASSWORD,
  CREATE_FRANCHISEE_PASSWORD,
} from "modules/Authentication";

const UpdatePassword = () => {
  const { control } = useFormWithZod({
    schema: updatePasswordFormSchema,
  });

  const search = useSearch({
    strict: false,
  });

  const path = location.pathname;

  const [authTokenDetails, setAuthTokenDetails] = useState({
    id: null as unknown as number,
    type: "None",
    token: "auth" in search ? search?.auth : null,
    isExpired: false,
  });

  const auth = "auth" in search ? search?.auth : null;

  useEffect(() => {
    if (auth) {
      const authDecoded = jwtDecode<JWTDecoded>(auth);
      const expiredDate = new Date(authDecoded?.exp * 1000);
      const currentDate = new Date();

      setAuthTokenDetails({
        id: authDecoded?.id,
        type: authDecoded?.type,
        token: auth,
        isExpired: currentDate > expiredDate,
      });
    }
  }, [auth]);

  const navigate = useNavigate();

  const [updatePassword, { loading }] = useMutation(UPDATE_PASSWORD);

  const [createMFPassword, { loading: createMFPasswordLoading }] =
    useMutation(CREATE_MF_PASSWORD);

  const [
    createFranchiseePassword,
    { loading: createFranchiseePasswordLoading },
  ] = useMutation(CREATE_FRANCHISEE_PASSWORD);

  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);

  const resetPasswordHandler: FormSubmitHandler<UpdatePasswordForm> = ({
    data: { confirmNewPassword },
  }) => {
    if (auth) {
      const commonArgs = {
        id: authTokenDetails?.id,
        password: confirmNewPassword,
      };

      switch (authTokenDetails?.type) {
        case "User": {
          updatePassword({
            variables: {
              ...commonArgs,
              resetToken: auth,
            },
          })
            .then(() => {
              setResetPasswordSuccess(true);
            })
            .catch((error) => toastNotification(messageHelper(error)));
          break;
        }

        case "MF": {
          createMFPassword({
            variables: {
              ...commonArgs,
              confirmationToken: auth,
            },
          })
            .then(() => {
              setResetPasswordSuccess(true);
            })
            .catch((error) => toastNotification(messageHelper(error)));
          break;
        }

        case "Franchisee": {
          createFranchiseePassword({
            variables: {
              ...commonArgs,
              confirmationToken: auth,
            },
          })
            .then(() => {
              setResetPasswordSuccess(true);
            })
            .catch((error) => toastNotification(messageHelper(error)));
          break;
        }
        default: {
          updatePassword({
            variables: {
              ...commonArgs,
              resetToken: auth,
            },
          })
            .then(() => {
              setResetPasswordSuccess(true);
            })
            .catch((error) => toastNotification(messageHelper(error)));
          break;
          break;
        }
      }
    }
  };

  return (
    <Fragment>
      {authTokenDetails?.isExpired ? (
        <AuthPageLayout
          title={
            <span className="flex flex-col">
              <span>Link Expired!</span>
            </span>
          }
          className="bg-gradient-to-tr from-linear-primary to-linear-gradient-secondary"
          classNameForTitle="pb-8"
        >
          <div className="w-full mb-4 px-4">
            <Button
              className={"h-[42px] "}
              type="submit"
              loading={
                loading ||
                createMFPasswordLoading ||
                createFranchiseePasswordLoading
              }
              onPress={() => {
                navigate({
                  to: "/",
                });
              }}
            >
              GO TO LOG IN
            </Button>
          </div>
        </AuthPageLayout>
      ) : resetPasswordSuccess ? (
        <AuthPageLayout
          title={
            <span className="flex flex-col">
              <span>Password</span>
              <span>{`Successfully ${
                path?.includes("create") ? "Created" : "Updated"
              }!`}</span>
            </span>
          }
          className="bg-gradient-to-tr from-linear-primary to-linear-gradient-secondary"
          classNameForTitle="pb-8"
        >
          <div className="w-full mb-4 px-4">
            <Button
              className={"h-[42px]"}
              type="submit"
              loading={
                loading ||
                createMFPasswordLoading ||
                createFranchiseePasswordLoading
              }
              onPress={() => {
                navigate({
                  to: "/",
                });
              }}
            >
              LOG IN NOW
            </Button>
          </div>
        </AuthPageLayout>
      ) : (
        <AuthPageLayout
          title="New Password!"
          className="bg-gradient-to-tr from-linear-primary to-linear-gradient-secondary"
          classNameForTitle="py-0"
        >
          <Fragment>
            <Form
              control={control}
              className="p-4 space-y-4 grid mt-4"
              onSubmit={resetPasswordHandler}
            >
              <InputField
                type="password"
                name={"newPassword"}
                control={control}
                label={"New Password"}
              />
              <InputField
                type="password"
                name={"confirmNewPassword"}
                control={control}
                label={"Confirm New Password"}
              />
              <Button
                className={"h-[42px]"}
                type="submit"
                loading={
                  loading ||
                  createMFPasswordLoading ||
                  createFranchiseePasswordLoading
                }
              >
                CONFIRM {path?.includes("create") ? "CREATE" : "CHANGE"}
              </Button>
            </Form>
          </Fragment>
        </AuthPageLayout>
      )}
    </Fragment>
  );
};

export default UpdatePassword;
