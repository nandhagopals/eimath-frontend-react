import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

import { Country } from "modules/Settings/Country";

type WorkbookFileDetails = Nullish<{
  id: number;
  originalFileName: string;
  fileURL: string;
  mimeType: string;
}>;

type WorkbookInformation = Nullish<{
  id: number;
  name: string;
  price: number;
  country: Country;
  status: string;
  remarks: string;
  workbookFiles: WorkbookFileDetails[];
  workbookAnswerFiles: WorkbookFileDetails[];
}>;

type WorkbookInformationFieldArgs = Nullish<{
  isPriceNeed: boolean;
  isCountryDetailsNeed: boolean;
  isStatusNeed: boolean;
  isRemarksNeed: boolean;
  isWorkbookFilesNeed: boolean;
  isWorkbookAnswerFilesNeed: boolean;
}>;

type WorkbookInformationFilterInput = Nullish<{
  id: FilterInteger;
  status: FilterString;
  countryId: FilterInteger;
  countryName: FilterString;
}>;

type FilterWorkbookInformationResponse = Nullish<{
  filterWorkbookInformation: CursorPaginationReturnType<WorkbookInformation>;
}>;

type FilterWorkbookInformationArgs = CursorPaginationArgs<
  WorkbookInformationFilterInput,
  "id" | "name" | "country" | "price"
> &
  WorkbookInformationFieldArgs;

type DeleteWorkbookInformationResponse = Nullish<{
  deleteWorkbookInformation: string;
}>;

interface DeleteWorkbookInformationArgs {
  id: number;
}

export type {
  WorkbookInformation,
  WorkbookInformationFieldArgs,
  WorkbookInformationFilterInput,
  FilterWorkbookInformationResponse,
  FilterWorkbookInformationArgs,
  DeleteWorkbookInformationResponse,
  DeleteWorkbookInformationArgs,
};
