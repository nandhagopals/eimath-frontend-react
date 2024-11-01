import { FC } from "react";

import AuthScreenLogo from "global/assets/images/logo-100.svg?react";
import { combineClassName } from "global/helpers";

interface Props {
  title: string | JSX.Element;
  children: JSX.Element;
  className?: string;
  classNameForTitle?: string;
}

const AuthPageLayout: FC<Props> = ({
  title,
  children,
  className,
  classNameForTitle,
}) => {
  return (
    <main
      className={combineClassName(
        "w-full h-full bg-gradient-to-tr from-linear-primary to-linear-secondary min-h-dvh grid place-content-center gap-16",
        className
      )}
    >
      <AuthScreenLogo className="mx-auto" />
      <div className="bg-primary-contrast rounded-[10px] p-4 min-w-xs max-w-[543px] sm:min-w-[543px] transition-all">
        <h2
          className={combineClassName(
            "text-2xl p-4 font-sunbird font-normal",
            classNameForTitle
          )}
        >
          {title}
        </h2>
        {children}
      </div>
    </main>
  );
};

export default AuthPageLayout;
