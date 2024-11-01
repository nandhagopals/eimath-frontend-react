import { ToastNotification } from "global/cache";

const defaultZodErrorMessage = {
  invalid_type_error: "This is required field.",
  required_error: "This is required field.",
};

const messageHelper = (
  value:
    | {
        message: string;
        type: "success" | "error";
      }
    | {
        error: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message: any;
          name?: string;
        };
      }
): ToastNotification[] => {
  if ("message" in value) {
    return [
      {
        message: value?.message,
        messageType: value?.type ?? "error",
      },
    ];
  } else if (value?.error?.name !== "AbortError") {
    return [
      {
        messageType: "error",
        message: value?.error?.message,
      },
    ];
  } else {
    return [];
  }
};

const accessDeniedMessage: ToastNotification[] = [
  {
    messageType: "error",
    message: "Access denied",
  },
];

const somethingWentWrongMessage: ToastNotification[] = [
  {
    messageType: "error",
    message: "Something went wrong",
  },
];

const createSuccessMessage: ToastNotification[] = [
  {
    messageType: "success",
    message: "Your new entry has been successfully saved",
  },
];

const updateSuccessMessage: ToastNotification[] = [
  {
    messageType: "success",
    message: "Your changes updated",
  },
];

const deleteSuccessMessage: ToastNotification[] = [
  {
    messageType: "success",
    message: "You have successfully deleted your record",
  },
];

const notFoundMessage = "Sorry we couldn't found any results";

export {
  defaultZodErrorMessage,
  messageHelper,
  accessDeniedMessage,
  somethingWentWrongMessage,
  createSuccessMessage,
  updateSuccessMessage,
  deleteSuccessMessage,
  notFoundMessage,
};
