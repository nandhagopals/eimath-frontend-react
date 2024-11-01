import { format, parse } from "date-fns";
import {
  parseDateTime,
  getLocalTimeZone,
  DateFormatter,
} from "@internationalized/date";
import { DateValue } from "react-aria-components";

const supportedFormat = [
  "yyyy-MM-dd hh:mm:ss a",
  "yyyy-MM-dd hh:mm a",
  "yyyy-MM-dd hh a",
  "yyyy-MM-dd a",
  "yyyy-MM a",
  "yyyy a",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd HH",
  "yyyy-MM-dd",
  "yyyy-MM",
  "yyyy",
  "H:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
  "hh:mm a",
  "hh:mm:ss a",
  "hh:m:s a",
  "hh:mm a",
  "HH:mm:ss",
  "H:m:s",
  "HH:mm",
  "h:mm:ss a",
  "h:mm:s a",
  "h:m:ss a",
  "h:mm a",
  "h:m a",
  "h:m:s a",
] as const;

const desiredOutputFormat = [
  "MMM dd, yyyy 'at' hh:mm:ss a",
  "MMM dd, yyyy 'at' hh:mm a",
  "MMM dd, yyyy 'at' hh a",
  "MMM dd, yyyy 'at' a",
  "MMM yyyy 'at' a",
  "yyyy 'at' a",
  "MMM dd, yyyy 'at' HH:mm:ss",
  "MMM dd, yyyy 'at' HH:mm",
  "MMM dd, yyyy 'at' HH",
  "MMM dd, yyyy",
  "MMM yyyy",
  "yyyy",
  "H:mm:ss",
  "MMM dd, yyyy 'at' HH:mm:ss",
  "hh:mm a",
  "hh:mm:ss a",
  "hh:m:s a",
  "hh:mm a",
  "HH:mm:ss",
  "H:m:s",
  "HH:mm",
  "h:mm:ss a",
  "h:mm:s a",
  "h:m:ss a",
  "h:mm a",
  "h:m a",
  "h:m:s a",
] as const;

const setDate = (date: string | null | undefined) => {
  if (date) {
    for (let i = 0; i < supportedFormat.length; i++) {
      try {
        const parsedDate = parse(date, supportedFormat[i], new Date());

        const formattedDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss");

        return formattedDate &&
          formattedDate?.toLowerCase()?.replaceAll(" ", "") !== "invaliddate" &&
          formattedDate?.toLowerCase()?.replaceAll(" ", "") !==
            "invaliddate." &&
          formattedDate !== "Invalid date" &&
          formattedDate !== "Invalid date."
          ? parseDateTime(formattedDate)
          : undefined;
      } catch {
        /* empty */
      }
    }

    return undefined;
  } else {
    return undefined;
  }
};

const dateTimeSubmitFormat = (
  date: DateValue | null | undefined,
  time?: true,
  seconds?: true
) => {
  if (date) {
    const formate = new DateFormatter("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12: true,
    });

    if (time) {
      return `${date?.toString()?.slice(0, 10)} ${formate
        .format(date?.toDate(getLocalTimeZone()))
        ?.toString()
        ?.slice(12)}`;
    } else return date?.toString()?.slice(0, 10);
  } else {
    return null;
  }
};

const formatDate = (
  inputDateString: string | undefined | null,
  formate?: (typeof desiredOutputFormat)[number] | string
) => {
  if (inputDateString) {
    for (let i = 0; i < supportedFormat.length; i++) {
      try {
        const parsedDate = parse(
          inputDateString,
          supportedFormat[i],
          new Date()
        );
        const formattedDate = format(
          parsedDate,
          formate ? formate : desiredOutputFormat[i]
        );
        return formattedDate;
      } catch {
        /* empty */
      }
    }

    return undefined;
  } else {
    return undefined;
  }
};

export { setDate, dateTimeSubmitFormat, formatDate };
