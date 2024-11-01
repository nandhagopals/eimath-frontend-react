import { Fragment } from "react";
import { Form, FormSubmitHandler } from "react-hook-form";
import { useMutation } from "@apollo/client";

import { Button } from "components/Buttons";
import { InputField } from "components/Form";

import { useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import { messageHelper } from "global/helpers";

import {
  AuthPageLayout,
  SEND_FORGOT_PASSWORD_MAIL,
  ForgotPasswordForm,
  forgotPasswordFormSchema,
} from "modules/Authentication";
import { useNavigate } from "@tanstack/react-router";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { control } = useFormWithZod({
    schema: forgotPasswordFormSchema,
  });

  const [forgotPassword, { loading }] = useMutation(SEND_FORGOT_PASSWORD_MAIL);

  const resetPasswordHandler: FormSubmitHandler<ForgotPasswordForm> = ({
    data: { email },
  }) => {
    forgotPassword({
      variables: {
        email,
      },
    })
      .then(() => {
        navigate({
          to: "/",
        });
        toastNotification([
          {
            message: "Password reset link sent successfully.",
            messageType: "success",
          },
        ]);
      })
      .catch((error) => toastNotification(messageHelper(error)));
  };

  return (
    <AuthPageLayout
      title="Reset Password"
      className="bg-gradient-to-tr from-linear-primary to-linear-gradient-secondary"
      classNameForTitle="py-0"
    >
      <Fragment>
        <p className="pl-4 flex flex-col text-secondary-text text-sm mb-4">
          <span> We will send you a link to reset</span>
          <span> your password via email</span>
        </p>
        <Form
          control={control}
          className="p-4 space-y-4 grid"
          onSubmit={resetPasswordHandler}
        >
          <InputField name={"email"} control={control} label={"Email"} />
          <Button className={"h-[42px]"} type="submit" loading={loading}>
            SEND ME THE RESET LINK
          </Button>
        </Form>
      </Fragment>
    </AuthPageLayout>
  );
};

export default ForgotPassword;
