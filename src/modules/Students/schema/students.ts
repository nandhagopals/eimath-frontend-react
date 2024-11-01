import { z } from "zod";

import {
  defaultZodErrorMessage,
  idAndNameSchema,
  nameZodSchema,
} from "global/helpers";

const studentsSortBySchema = z
  .object({
    column: z
      .union([
        z.literal("id"),
        z.literal("name"),
        z.literal("level"),
        z.literal("prefix"),
      ])
      .nullish(),
    direction: z
      .union([z.literal("ascending"), z.literal("descending")])
      .nullish(),
  })
  .nullish();

const studentsFilterSchema = z
  .object({
    pageType: z
      .union([
        z.literal("isAdmin"),
        z.literal("isMasterFranchisee"),
        z.literal("isFranchisee"),
      ])
      .nullish(),
    search: z.string().nullish().catch(null),
    level: idAndNameSchema(z.number()).nullish().catch(null),
    status: z
      .union([z.literal("Withdrawn"), z.literal("Graduated")])
      .nullish()
      .catch(null),
    franchisee: idAndNameSchema(z.number())
      .and(
        z.object({
          prefix: z.string().nullish(),
        })
      )
      .nullish()
      .catch(null),
    pageStatus: z
      .union([z.literal("ACTIVE"), z.literal("PAST"), z.literal("ARCHIVED")])
      .nullish()
      .catch("ACTIVE"),
    pageSize: z.number().nullish().catch(null),
    cursor: z
      .object({
        type: z.union([z.literal("before"), z.literal("after")]).nullish(),
        cursor: z.string().nullish(),
      })
      .nullish()
      .catch(null),
    sortBy: studentsSortBySchema.nullish().catch(null),
    currentTermOrRenewalTerm: z
      .union([z.literal("CURRENT TERM"), z.literal("PENDING RENEWAL")])
      .nullish(),
    studentBunkAction: z
      .union([
        z.literal("Renewal"),
        z.literal("Archive"),
        z.literal("Proceed"),
        z.literal("Withdraw"),
      ])
      .nullish(),
  })
  .catch({
    pageStatus: "ACTIVE",
  });

const remarksFilterAndFormSchema = z.object({
  pageSize: z.number().nullish(),
  remarks: nameZodSchema(true),
});

const withdrawRemarkFormSchema = z.object({
  remark: z.string(defaultZodErrorMessage).nullish(),
});

export {
  studentsFilterSchema,
  studentsSortBySchema,
  remarksFilterAndFormSchema,
  withdrawRemarkFormSchema,
};
