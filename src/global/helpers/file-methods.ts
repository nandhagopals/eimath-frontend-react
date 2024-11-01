import { toastNotification } from "global/cache";
import { somethingWentWrongMessage } from "global/helpers";

const urlToOtherType = async (
  url: string,
  filename: string,
  type?: string
): Promise<{ file: File | null; blob: Blob | null; base64: string | null }> => {
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Network response was not ok: ${response.statusText}`);
    return {
      base64: null,
      blob: null,
      file: null,
    };
  }
  const blob = await response.blob();
  const file = new File([blob], filename, { type: type ?? blob.type });
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => reader?.result;

  return {
    blob: blob || null,
    file: file || null,
    base64: (reader?.result || null) as string | null,
  };
};

const fileDownload = async (url) => {
  try {
    // Make an HTTP request to get the file data
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    // Get the blob data from the response
    const blob = await response.blob();

    // Create a URL for the blob data
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = url?.slice(url?.lastIndexOf("/"))?.replace("/", ""); // Specify the filename here
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

const validateAndDownloadFile = (file?: string | null | undefined) => {
  if (
    file !== null &&
    file !== undefined &&
    file?.length > 5 &&
    !file?.toLowerCase()?.trim()?.replaceAll(" ", "")?.includes("nodatafound")
  ) {
    fileDownload(file);
  } else if (
    file !== null &&
    file !== undefined &&
    file?.length > 5 &&
    file?.toLowerCase()?.trim()?.replaceAll(" ", "")?.includes("nodatafound")
  ) {
    toastNotification([
      {
        messageType: "error",
        message: "No data found",
      },
    ]);
  } else {
    toastNotification(somethingWentWrongMessage);
  }
};

export { urlToOtherType, fileDownload, validateAndDownloadFile };
