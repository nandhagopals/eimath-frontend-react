import { flushSync } from "react-dom";
import { Form, FormSubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@apollo/client";

import { InputField } from "components/Form";
import { Button } from "components/Buttons";

import { useAuth, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import {
  isAuthorizedUser,
  messageHelper,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  AuthPageLayout,
  LOGIN,
  LoginForm,
  loginFormSchema,
} from "modules/Authentication";

const Login = () => {
  const auth = useAuth();
  const navigation = useNavigate();

  const { control } = useFormWithZod({
    schema: loginFormSchema,
  });

  const [login, { loading }] = useMutation(LOGIN);

  const loginSubmitHandler: FormSubmitHandler<LoginForm> = ({
    data: { email, password },
  }) => {
    login({
      variables: {
        email: email?.trim(),
        password,
      },
    })
      .then(({ data }) => {
        if (data?.login?.token && data?.login?.token?.length > 50) {
          localStorage.setItem("token", data?.login?.token);
          if (isAuthorizedUser()?.id && (isAuthorizedUser()?.id || 0) > 0) {
            flushSync(() => {
              auth.setAuthUserDetails({
                id: isAuthorizedUser()?.id || -1,
                type: isAuthorizedUser()?.type || "None",
              });
            });
            navigation({
              to: "/dash-board",
            });
          } else {
            navigation({
              to: "/",
            });
            toastNotification(somethingWentWrongMessage);
          }
        } else {
          toastNotification(somethingWentWrongMessage);
        }
      })
      .catch((error) => {
        toastNotification(messageHelper({ error }));
      });
  };

  return (
    <AuthPageLayout title="Welcome Back!">
      <Form
        control={control}
        className="p-4 space-y-4 grid"
        onSubmit={loginSubmitHandler}
      >
        <InputField name={"email"} control={control} label={"Email"} />
        <InputField
          type="password"
          name={"password"}
          control={control}
          label={"Password"}
        />
        <Button className={"h-[42px]"} type="submit" loading={loading}>
          LOG IN
        </Button>
        <Link
          className="text-primary-main text-sm underline font-roboto font-normal leading-5 w-min whitespace-nowrap"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to={"/forgot-password" as any}
        >
          Forgot password
        </Link>
      </Form>
    </AuthPageLayout>
  );
};

export default Login;
