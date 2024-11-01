import { combineClassName } from "global/helpers";
import { FC } from "react";

interface Props {
  title: string;
  totalCount: number;
  percentage: number;
  isNegative?: boolean;
  borderColor: string;
  loading: boolean;
}

const DashboardCard: FC<Props> = ({
  title,
  totalCount,
  percentage,
  isNegative = false,
  borderColor,
}) => {
  const percentageValue = `${percentage === 0 ? "" : "+"} ${percentage}%`;
  return (
    <div
      className={combineClassName(
        "border rounded-2xl p-4 md:p-8 w-full",
        borderColor ?? "border-primary-main"
      )}
    >
      <h4 className="font-roboto text-[16px] font-normal leading-6 text-primary-main tracking-[.15px] truncate">
        {title}
      </h4>
      <div className="flex justify-between items-center gap-2">
        <p
          className={combineClassName(
            "font-sunbird leading-[42px] tracking-[.25px] text-[34px] truncate",
            isNegative ? "text-error-main" : "text-secondary-dark"
          )}
        >
          {totalCount}
        </p>

        <div className="text-right font-roboto font-normal grid grid-cols-1 min-h-[44px]">
          <p
            className={combineClassName(
              "text-[16px] leading-6 tracking-[.15px] truncate",
              isNegative ? "text-error-dark" : "text-success-main"
            )}
          >
            {percentageValue}
          </p>

          <p className="text-[12px] leading-5 tracking-[.4px] text-primary-main">
            From Previous Year
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
