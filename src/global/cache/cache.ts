import { makeVar } from "@apollo/client";
import { FilePreview } from "components/FilePreviewModal/types";

import { ToastNotification } from "global/cache/type";

const toastNotification = makeVar<ToastNotification[]>([]);

const paginationDefaultCount = makeVar<number>(5);

const allowedResourceIds = makeVar<string[]>([]);

const filePreview = makeVar<FilePreview | null>(null);

export {
  toastNotification,
  paginationDefaultCount,
  allowedResourceIds,
  filePreview,
};
