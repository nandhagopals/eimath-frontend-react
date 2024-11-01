import { MenuType } from "components/SideBar";

import DashboardIcon from "global/assets/images/space-dashboard-filled.svg?react";
import SettingsIcon from "global/assets/images/settings-filled.svg?react";
import PersonIcon from "global/assets/images/person-filled.svg?react";
import PersonSettingIcon from "global/assets/images/person-setting.svg?react";
import EngineeringIcon from "global/assets/images/engineering-filled.svg?react";
import RoyaltiesIcon from "global/assets/images/royalties.svg?react";
import OrdersIcon from "global/assets/images/orders.svg?react";
import SalesIcon from "global/assets/images/sales.svg?react";
import PaymentVouchersIcon from "global/assets/images/payment-vouchers.svg?react";
import PointsManagementIcon from "global/assets/images/points-management.svg?react";
import StudentsIcon from "global/assets/images/students.svg?react";
import TeacherIcon from "global/assets/images/people-filled.svg?react";
import MasterFranchiseeIcon from "global/assets/images/master-franchisee.svg?react";
import EducationMaterialsIcon from "global/assets/images/menu-book-filled.svg?react";
import WorkbookManagementIcon from "global/assets/images/warehouse-filled.svg?react";
import EducationLevelsIcon from "global/assets/images/clear-all-filled.svg?react";
import EducationCategoryIcon from "global/assets/images/design-services-filled.svg?react";
import EducationTermsIcon from "global/assets/images/menu-open-filled.svg?react";
import ProductCategoryIcon from "global/assets/images/create-new-folder-filled.svg?react";
import ProductsIcon from "global/assets/images/book-filled.svg?react";
import ReportIcon from "global/assets/images/reports.svg?react";
import SalesReportIcon from "global/assets/images/sales-report.svg?react";
import StudentReportIcon from "global/assets/images/student-report.svg?react";
import PaymentReportIcon from "global/assets/images/payment-report.svg?react";
import RoyaltiesReportIcon from "global/assets/images/royalties-report.svg?react";
import CreditConsumptionsReportIcon from "global/assets/images/credit-consumption-report.svg?react";
import InfoIcon from "global/assets/images/info.svg?react";

export const menuList: MenuType[] = [
  {
    icon: DashboardIcon,
    title: "Dashboard",
    aclNames: ["Profile"],
    subMenus: [],
    to: "/dash-board",
  },
  {
    icon: RoyaltiesIcon,
    title: "Royalties",
    aclNames: ["Royalty"],
    subMenus: [],
    to: "/royalties",
  },
  {
    icon: OrdersIcon,
    title: "Orders",
    aclNames: ["Profile"],
    subMenus: [],
    to: "/orders",
  },
  {
    icon: SalesIcon,
    title: "Sales",
    aclNames: ["Sales"],
    subMenus: [],
    to: "/sales",
  },
  {
    icon: PaymentVouchersIcon,
    title: "Payment Vouchers",
    aclNames: ["PaymentVoucher"],
    subMenus: [],
    to: "/payment-vouchers",
  },
  {
    icon: PointsManagementIcon,
    title: "Points Management",
    aclNames: ["ReadMasterFranchiseePointInformation"],
    subMenus: [],
    to: "/points-management",
  },
  {
    icon: StudentsIcon,
    title: "Students",
    aclNames: ["StudentAccount"],
    subMenus: [],
    to: "/students",
  },
  {
    icon: TeacherIcon,
    title: "Teacher",
    aclNames: ["TeacherAccount"],
    subMenus: [],
    to: "/teacher",
  },
  {
    icon: MasterFranchiseeIcon,
    title: "Master Franchisee",
    aclNames: ["MasterFranchiseeInformation"],
    subMenus: [],
    to: "/master-franchisee",
  },
  {
    icon: MasterFranchiseeIcon,
    title: "Franchisee",
    aclNames: ["FranchiseeInformation"],
    subMenus: [],
    to: "/franchisee",
  },
  {
    icon: ProductsIcon,
    title: "Products",
    aclNames: ["Product"],
    subMenus: [],
    to: "/products",
  },
  {
    icon: EducationMaterialsIcon,
    title: "Education",
    subTitle: "Materials",
    aclNames: ["EducationalMaterial"],
    subMenus: [
      {
        icon: WorkbookManagementIcon,
        title: "Workbook Management",
        aclNames: ["WorkbookInformation"],
        to: "/education-materials/workbook-management",
      },
      {
        icon: EducationTermsIcon,
        title: "Terms",
        aclNames: ["EducationalTerm"],
        to: "/education-materials/terms",
      },
      {
        icon: EducationLevelsIcon,
        title: "Levels",
        aclNames: ["EducationalLevel"],
        to: "/education-materials/levels",
      },
      {
        icon: EducationCategoryIcon,
        title: "Educational Category",
        aclNames: ["EducationalCategory"],
        to: "/education-materials/educational-categories",
      },
    ],
  },
  {
    icon: ReportIcon,
    title: "Reports",
    aclNames: [
      "ReadSalesReportInformation",
      "ReadPaymentReportInformation",
      "ReadForecastReportInformation",
      "ReadStudentReportInformation",
      "ReadRoyaltyReportInformation",
      "ReadStudentWithdrawnReportInformation",
    ],
    subMenus: [
      {
        icon: SalesReportIcon,
        title: "Sales Volume",
        aclNames: ["ReadSalesReportInformation"],
        to: "/reports/sales-reports",
      },
      {
        icon: PaymentReportIcon,
        title: "Payment Report",
        aclNames: ["ReadPaymentReportInformation"],
        to: "/reports/payment-reports",
      },
      {
        icon: CreditConsumptionsReportIcon,
        title: "Forecast Report",
        aclNames: ["ReadForecastReportInformation"],
        to: "/reports/forecast-reports",
      },
      {
        icon: StudentReportIcon,
        title: "Student Report",
        aclNames: ["ReadStudentReportInformation"],
        to: "/reports/student-reports",
      },
      {
        icon: RoyaltiesReportIcon,
        title: "Royalties Report",
        aclNames: ["ReadRoyaltyReportInformation"],
        to: "/reports/royalties-reports",
      },
      {
        icon: InfoIcon,
        title: "Withdrawn Report",
        aclNames: ["ReadStudentWithdrawnReportInformation"],
        to: "/reports/withdrawn-reports",
      },
    ],
  },
  {
    icon: EngineeringIcon,
    title: "Accounts",
    aclNames: ["Account"],
    subMenus: [
      {
        icon: PersonSettingIcon,
        title: "Role & Access",
        aclNames: ["Role"],
        to: "/accounts/role-access",
      },
      {
        icon: PersonIcon,
        title: "Staff Account",
        aclNames: ["Users"],
        to: "/accounts/staff-account",
      },
      {
        icon: PersonSettingIcon,
        title: "Master Franchisee Access",
        aclNames: ["MasterFranchiseePrivilege"],
        to: "/accounts/master-franchisee-access",
      },
      {
        icon: PersonSettingIcon,
        title: "Franchisee Access",
        aclNames: ["FranchiseePrivilege"],
        to: "/accounts/franchisee-access",
      },
    ],
  },
  {
    icon: SettingsIcon,
    title: "Master Setting",
    aclNames: ["AdminMasterSetting"],
    subMenus: [
      {
        icon: SettingsIcon,
        title: "Country",
        aclNames: ["Country"],
        to: "/settings/countries",
      },
      {
        icon: SettingsIcon,
        title: "General Setting",
        aclNames: ["AdminMasterGeneralSetting"],
        to: "/settings/general-setting",
      },
      {
        icon: ProductCategoryIcon,
        title: "Product Category",
        aclNames: ["ProductCategory"],
        to: "/settings/product-categories",
      },
    ],
  },
  {
    icon: SettingsIcon,
    title: "Master Setting",
    aclNames: [
      "MasterFranchiseeGeneral",
      "MasterFranchiseeEducationalTerm",
      "MasterFranchiseeWorkBook",
      "MasterFranchiseeProduct",
    ],
    subMenus: [],
    to: "/master-setting",
  },
];
