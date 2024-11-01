import { FC, Fragment } from "react";
import { Link, LinkOptions } from "@tanstack/react-router";

import Separator from "global/assets/images/separator.svg?react";
import { combineClassName } from "global/helpers";

interface Props {
  title: string;
  breadcrumbs: ({
    name: string;
  } & LinkOptions)[];
}

const TitleAndBreadcrumb: FC<Props> = ({ breadcrumbs, title }) => {
  return (
    <div className={"grid grid-cols-1 gap-2"}>
      <p className="text-primary-text font-sunbird text-[20px] font-normal leading-8 truncate">
        {title}
      </p>
      <div className="text-secondary-text flex text-base flex-wrap text-[16px] font-roboto tracking-[.15px]">
        {breadcrumbs?.map(({ name, ...linkProps }, i) => {
          return (
            <Fragment key={i}>
              <Link
                {...(linkProps as unknown as any)}
                className={combineClassName(
                  "outline-none focus-visible:ring-1 focus-visible:ring-primary-main focus-visible:ring-offset-1 rounded focus-visible:text-primary-main",
                  i === breadcrumbs?.length - 1 ? "text-primary-text" : ""
                )}
              >
                {name}
              </Link>{" "}
              {i === breadcrumbs?.length - 1 ? null : (
                <Separator className="size-6 min-w-6 min-h-6" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TitleAndBreadcrumb;
