import { useForm, useWatch } from "react-hook-form";
import { Fragment } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "components/Buttons";
import { Select } from "components/Form";
import { DashboardCard } from "components/Reports";

import { combineClassName, numberGenerator } from "global/helpers";
import { useAuth, usePreLoading } from "global/hook";

import { GENERATE_DASHBOARD_REPORT } from "modules/Dashboard";
import { FILTER_FRANCHISEES } from "modules/Franchisee";
import { FILTER_MASTER_FRANCHISEE_INFORMATION } from "modules/MasterFranchisee";
import DashboardBarChart, { BarChart } from "modules/Dashboard/Pages/BarChart";

const monthArray = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const Dashboard = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const { control } = useForm({ defaultValues: { year: currentYear } });

  const watchYear = useWatch({
    control,
    name: "year",
  });

  const { authUserDetails } = useAuth();
  const isAdmin = authUserDetails?.type === "User";
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";
  const isFranchisee = authUserDetails?.type === "Franchisee";

  const { data, loading } = useQuery(GENERATE_DASHBOARD_REPORT, {
    variables: {
      year: watchYear?.toString(),
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const { data: masterFranchiseeData, loading: masterFranchiseeLoading } =
    useQuery(FILTER_MASTER_FRANCHISEE_INFORMATION, {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: !isMasterFranchisee,
      variables: {
        isMasterFranchiseeInformationCurrencyNeed: true,
      },
    });

  const { data: franchiseeData, loading: franchiseeLoading } = useQuery(
    FILTER_FRANCHISEES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network",
      skip: !isFranchisee,
      variables: {
        isFranchiseeMasterFranchiseeInformationNeed: true,
      },
    }
  );

  const currentYearData =
    data?.generateDashboardReport?.givenYearMonthWiseRevenue ?? [];
  const pastYearData =
    data?.generateDashboardReport?.previousYearMonthWiseRevenue ?? [];

  const getCurrentYearAndPreviousYear = (month: BarChart["month"]) => {
    return {
      currentYear:
        currentYearData?.find((currentYear) => {
          return currentYear?.month?.toLowerCase() == month?.toLowerCase();
        })?.totalAmount ?? 0,
      pastYear:
        pastYearData?.find((pastYear) => {
          return pastYear?.month?.toLowerCase() == month?.toLowerCase();
        })?.totalAmount ?? 0,
    };
  };

  const dashboardData: BarChart[] = monthArray.map((month) => ({
    month,
    ...getCurrentYearAndPreviousYear(month),
  }));

  const preLoading = usePreLoading(
    loading || masterFranchiseeLoading || franchiseeLoading
  );

  const currency = isMasterFranchisee
    ? masterFranchiseeData
      ? masterFranchiseeData?.filterMasterFranchiseeInformation?.edges?.[0]
          ?.node?.currency ?? null
      : null
    : isFranchisee
    ? franchiseeData
      ? franchiseeData?.filterFranchisees?.edges?.[0]?.node
          ?.masterFranchiseeInformation?.currency ?? null
      : null
    : isAdmin
    ? "$"
    : null;

  return (
    <div className="space-y-6 w-full sm:max-w-6xl">
      <div className="bg-white border border-outline-light shadow p-4 md:p-8 rounded grid gap-y-4 sm:gap-y-8 transition-all duration-500">
        <div className="flex gap-2.5 justify-between">
          <p className="text-primary-text font-sunbird text-[20px] font-normal leading-8 truncate py-2">
            {isAdmin ? "HQ" : isMasterFranchisee ? "MF" : ""}{" "}
            {isFranchisee ? "" : "-"} Dashboard
          </p>
          <Select
            options={numberGenerator(true, 10, "DESC")}
            control={control}
            name="year"
            label="Year"
            variant="small"
            className="w-min"
          />
        </div>

        <div
          className={combineClassName(
            "grid grid-cols-1  gap-7",
            isAdmin
              ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : isMasterFranchisee
              ? "lg:grid-cols-3"
              : isFranchisee
              ? "sm:grid-cols-2"
              : ""
          )}
        >
          {preLoading ? (
            Array.from({
              length: isAdmin ? 4 : isMasterFranchisee ? 3 : 2,
            }).map((_, i) => {
              return (
                <div
                  key={i}
                  className="w-full rounded-2xl min-h-[141px] max-h-[141px] border shimmer-animation"
                />
              );
            })
          ) : (
            <Fragment>
              {isAdmin && (
                <DashboardCard
                  title={"Active Master"}
                  totalCount={
                    data?.generateDashboardReport?.givenYearTotalMF ?? 0
                  }
                  percentage={
                    data?.generateDashboardReport?.masterFranchiseePercentage ??
                    0
                  }
                  borderColor={"border-primary-main"}
                  loading={preLoading}
                />
              )}
              {(isMasterFranchisee || isAdmin) && (
                <DashboardCard
                  title={"Active Franchisee"}
                  totalCount={
                    data?.generateDashboardReport?.givenYearTotalFranchisee ?? 0
                  }
                  percentage={
                    data?.generateDashboardReport?.franchiseePercentage ?? 0
                  }
                  borderColor={"border-secondary-dark"}
                  loading={preLoading}
                />
              )}
              <DashboardCard
                title={"Total Students"}
                totalCount={
                  data?.generateDashboardReport?.givenYearTotalStudents ?? 0
                }
                percentage={
                  data?.generateDashboardReport?.activeStudentsPercentage ?? 0
                }
                borderColor={"border-primary-main"}
                loading={preLoading}
              />
              <DashboardCard
                title={"Withdrawal"}
                totalCount={
                  data?.generateDashboardReport
                    ?.givenYearTotalWithdrawnStudents ?? 0
                }
                percentage={
                  data?.generateDashboardReport?.withdrawnStudentsPercentage ??
                  0
                }
                isNegative
                borderColor={"border-secondary-dark"}
                loading={preLoading}
              />
            </Fragment>
          )}
        </div>
        <div className="bg-white border border-outline-light shadow-md p-2 sm:p-4 rounded-2xl">
          <div className="grid gap-4 p-2">
            <h4 className="text-primary-dark font-sunbird text-[24px] font-normal leading-8">
              Revenue
            </h4>
            <div className="flex flex-col sm:flex-row justify-between">
              {preLoading ? (
                <span className="block min-w-[150px] max-w-[150px] min-h-[42px] max-h-[42px] rounded  border shimmer-animation" />
              ) : (
                <p className="font-sunbird font-normal text-[34px] leading-[42px] whitespace-nowrap mb-4 sm:mb-0 truncate">
                  {currency ?? ""}{" "}
                  {data?.generateDashboardReport?.givenYearTotalRevenue &&
                  Number.isInteger(
                    data?.generateDashboardReport?.givenYearTotalRevenue
                  )
                    ? data?.generateDashboardReport?.givenYearTotalRevenue
                    : data?.generateDashboardReport?.givenYearTotalRevenue?.toFixed(
                        2
                      ) ?? 0}
                </p>
              )}
              <div>
                <Button
                  className={"flex items-center px-4 w-min whitespace-nowrap"}
                  onPress={() => {
                    navigate({
                      to: "/reports/sales-reports",
                    });
                  }}
                >
                  View Report
                </Button>
              </div>
            </div>
            <div className="text-[12px] font-normal leading-5 text-primary-dark/50 flex items-center gap-1">
              {preLoading ? (
                <span className="inline-block min-w-[20px] max-w-[20px] min-h-[15px] max-h-[15px] rounded  border shimmer-animation" />
              ) : (
                <span className="text-success-main">
                  {data?.generateDashboardReport?.revenuePercentage ?? 0}%{" "}
                </span>
              )}{" "}
              vs last year
            </div>
            <p className="text-[14px] font-normal leading-5 tracking-[.17px] text-black/50">
              Sales from Jan - Dec, {watchYear}
            </p>

            {preLoading ? (
              <div className="w-full min-h-[250px] rounded  border shimmer-animation" />
            ) : (
              <div className="overflow-x-auto">
                <DashboardBarChart data={dashboardData} currency={currency} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
