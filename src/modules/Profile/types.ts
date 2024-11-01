import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  Nullish,
} from "global/types";

import { Country } from "modules/Settings/Country";
import { profileFormSchema } from "modules/Profile";

type HQProfileInformation = Nullish<{
  id: number;
  name: string;
  companyName: string;
  companyUEN: string;
  bankAccountNumber: string;
  address: string;
  email: string;
  password: string;
  mobileNumber: string;
  country: Country;
  postalCode: string;
  postalCountry: Country;
}>;

type HQProfileInformationFieldArgs = Nullish<{
  isHQProfileInformationCompanyNameNeed: boolean;
  isHQProfileInformationCompanyUENNeed: boolean;
  isHQProfileInformationBankAccountNumberNeed: boolean;
  isHQProfileInformationAddressNeed: boolean;
  isHQProfileInformationEmailNeed: boolean;
  isHQProfileInformationIsdCountryNeed: boolean;
  isHQProfileInformationMobileNumberNeed: boolean;
  isHQProfileInformationPostalCodeNeed: boolean;
  isHQProfileInformationPostalCountryNeed: boolean;
}>;

type FilterHQProfileInformationResponse = Nullish<{
  getHQProfiles: CursorPaginationReturnType<HQProfileInformation>;
}>;

type FilterHQProfileInformationArgs = CursorPaginationArgs<object> &
  HQProfileInformationFieldArgs;

type CreateHQProfileResponse = Nullish<{
  createHQProfile: HQProfileInformation;
}>;

interface CreateHQProfileArgs extends HQProfileInformationFieldArgs {
  name: string;
  companyName: string;
  companyUEN: string;
  bankAccountNumber?: string | null;
  email: string;
  isdCountryId: number;
  mobileNumber: string;
  address: string;
  postalCode: string;
  postalCountryId: number;
}

type UpdateHQProfileResponse = Nullish<{
  updateHQProfile: HQProfileInformation;
}>;

interface UpdateHQProfileArgs extends Partial<CreateHQProfileArgs> {
  id: number;
}

type ProfileForm = z.infer<typeof profileFormSchema>;

export type {
  HQProfileInformation,
  HQProfileInformationFieldArgs,
  FilterHQProfileInformationResponse,
  FilterHQProfileInformationArgs,
  CreateHQProfileResponse,
  CreateHQProfileArgs,
  UpdateHQProfileResponse,
  UpdateHQProfileArgs,
  ProfileForm,
};
