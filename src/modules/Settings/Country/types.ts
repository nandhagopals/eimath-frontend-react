import { z } from "zod";

import { defaultZodErrorMessage } from "global/helpers";
import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  FilterString,
  Nullish,
} from "global/types";

type Country = Nullish<{
  id: number;
  name: string;
  code: string;
  isdCode: string;
  currency: string;
  status: string;
}>;

type CountryFieldArgs = {
  isCountryCodeNeed?: boolean;
  isCountryIsdCodeNeed?: boolean;
  isCountryCurrencyNeed?: boolean;
  isCountryStatusNeed?: boolean;
};

type CountryFilterInput = Nullish<{
  id: FilterInteger;
  name: FilterString;
  code: FilterString;
  isdCode: FilterString;
  currency: FilterString;
  status: FilterString;
}>;

type FilterCountiesResponse = Nullish<{
  filterCountries: CursorPaginationReturnType<Country>;
}>;

type FilterCountiesArgs = CursorPaginationArgs<CountryFilterInput> &
  CountryFieldArgs;

type CreateCountryResponse = Nullish<{
  createCountry: Country;
}>;

interface CreateCountryArgs extends CountryFieldArgs {
  name: string;
  code: string;
  isdCode: string;
  currency: string;
}

type UpdateCountryResponse = Nullish<{
  updateCountry: Country;
}>;

interface UpdateCountryArgs extends Partial<CreateCountryArgs> {
  id: number;
  status?: string;
}

type DeleteCountryResponse = Nullish<{ deleteCountry: string }>;

interface DeleteCountryArgs {
  id: number;
}

const countryStringZodSchema = z
  .string(defaultZodErrorMessage)
  .trim()
  .min(1, { message: defaultZodErrorMessage.required_error });

const countryFormSchema = z.object({
  name: countryStringZodSchema,
  code: countryStringZodSchema,
  isdCode: countryStringZodSchema,
  currency: countryStringZodSchema,
});

type CountryForm = z.infer<typeof countryFormSchema>;

export { countryFormSchema };

export type {
  Country,
  CountryFieldArgs,
  FilterCountiesResponse,
  FilterCountiesArgs,
  CreateCountryResponse,
  CreateCountryArgs,
  UpdateCountryResponse,
  UpdateCountryArgs,
  DeleteCountryResponse,
  DeleteCountryArgs,
  CountryForm,
  CountryFilterInput,
};
