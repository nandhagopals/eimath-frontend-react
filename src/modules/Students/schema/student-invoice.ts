import { z } from "zod";

import { nameZodSchema } from "global/helpers";

const studentBillingSchema = z.object({
  remarks: nameZodSchema().nullish(),
});

export { studentBillingSchema };
