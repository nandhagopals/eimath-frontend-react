import {
  General,
  ProductFees,
  TermFees,
  WorkBookFees,
} from "modules/MasterFranchiseeMasterSetting/Pages";

const tabPanels = [General, TermFees, WorkBookFees, ProductFees];

const tabs = [
  {
    id: 0,
    name: "GENERAL" as const,
    aclName: "MasterFranchiseeGeneral",
  },
  {
    id: 1,
    name: "TERM FEES" as const,
    subTitle: "(TO PARENT)",
    aclName: "MasterFranchiseeEducationalTerm",
  },
  {
    id: 2,
    name: "WORKBOOK FEES" as const,
    subTitle: "(TO FRANCHISEE)",
    aclName: "MasterFranchiseeWorkBook",
  },
  {
    id: 3,
    name: "PRODUCT FEES" as const,
    aclName: "MasterFranchiseeProduct",
  },
];

export { tabPanels, tabs };
