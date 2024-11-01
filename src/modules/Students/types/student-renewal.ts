import { z } from "zod";

import { studentRenewalFormSchema } from "modules/Students";

type StudentRenewalForm = z.infer<typeof studentRenewalFormSchema>;




export type { StudentRenewalForm };
