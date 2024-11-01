import { z } from "zod";

import { saleFormSchema } from "modules/Sales";

type SaleForm = z.infer<typeof saleFormSchema>;

export type { SaleForm };
