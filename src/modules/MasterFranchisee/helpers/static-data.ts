import {
  General,
  Information,
  ProductFees,
  TermFees,
  WorkBookFees,
} from "modules/MasterFranchisee/Pages/MasterFranchiseeForm";

const tabPanels = [Information, General, TermFees, WorkBookFees, ProductFees];

const tabs = [
  {
    id: 0,
    name: "INFORMATION" as const,
    aclName: "MasterFranchiseeInformation",
  },
  {
    id: 1,
    name: "GENERAL" as const,
    aclName: "MasterFranchiseeGeneral",
  },
  {
    id: 2,
    name: "TERM FEES" as const,
    subTitle: "(TO PARENT)",
    aclName: "MasterFranchiseeEducationalTerm",
  },
  {
    id: 3,
    name: "WORKBOOK FEES" as const,
    subTitle: "(TO FRANCHISEE)",
    aclName: "MasterFranchiseeWorkBook",
  },
  {
    id: 4,
    name: "PRODUCT FEES" as const,
    aclName: "MasterFranchiseeProduct",
  },
];

export { tabs, tabPanels };
