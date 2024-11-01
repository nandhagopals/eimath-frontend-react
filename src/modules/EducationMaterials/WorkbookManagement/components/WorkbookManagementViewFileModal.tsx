import { FC, useState } from "react";
import { useQuery } from "@apollo/client";

import { Modal } from "components/Modal";
import FileRender from "components/Form/FileUpload/FileRender";

import { combineClassName, notEmpty, urlToOtherType } from "global/helpers";
import { usePreLoading } from "global/hook";

import { FILTER_WORKBOOK_INFORMATION } from "modules/EducationMaterials/WorkbookManagement";

interface Props {
  modalType: "workbook" | "answer";
  id: number;
  onClose: () => void;
  isOpen: boolean;
}

const WorkbookManagementViewFileModal: FC<Props> = ({
  id,
  modalType,
  isOpen,
  onClose,
}) => {
  const [fileList, setFileList] = useState<
    { file: File; id: number | string }[]
  >([]);

  const [fileLoading, setFileLoading] = useState(true);
  const { loading } = useQuery(FILTER_WORKBOOK_INFORMATION, {
    variables: {
      filter: {
        id: {
          number: id,
        },
      },
      isWorkbookAnswerFilesNeed: modalType === "answer",
      isWorkbookFilesNeed: modalType === "workbook",
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    onCompleted: async ({ filterWorkbookInformation }) => {
      const workbook = filterWorkbookInformation?.edges?.[0]?.node;
      const workbookFilesPromises =
        workbook?.workbookFiles && workbook?.workbookFiles?.length > 0
          ? workbook?.workbookFiles?.map(async (item, index) => {
              const file = item?.fileURL
                ? await urlToOtherType(
                    item?.fileURL,
                    item?.originalFileName ||
                      `File ${index + 1}.${
                        item?.mimeType?.split("/")[1] || "png"
                      }`,
                    item?.mimeType ?? undefined
                  )
                : null;
              if (item?.id && file?.file) {
                return {
                  id: item?.id,
                  file: file?.file,
                };
              } else {
                return null;
              }
            })
          : [];

      const workbookFiles =
        (await Promise.all(workbookFilesPromises)).filter(notEmpty) || [];

      const workbookAnswerFilesPromises =
        workbook?.workbookAnswerFiles &&
        workbook?.workbookAnswerFiles?.length > 0
          ? workbook?.workbookAnswerFiles?.map(async (item, index) => {
              const file = item?.fileURL
                ? await urlToOtherType(
                    item?.fileURL,
                    item?.originalFileName ||
                      `File ${index + 1}.${
                        item?.mimeType?.split("/")[1] || "png"
                      }`,
                    item?.mimeType ?? undefined
                  )
                : null;
              if (item?.id && file?.file) {
                return {
                  id: item?.id,
                  file: file?.file,
                };
              } else {
                return null;
              }
            })
          : [];

      const workbookAnswerFiles =
        (await Promise.all(workbookAnswerFilesPromises)).filter(notEmpty) || [];

      if (modalType === "answer") {
        setFileList(workbookAnswerFiles);
        setFileLoading(false);
      }
      if (modalType === "workbook") {
        setFileList(workbookFiles);
        setFileLoading(false);
      }
    },
  });

  const preLoading = usePreLoading(loading || fileLoading);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name="Add"
      className={"grid place-content-center gap-4 w-auto"}
      loading={preLoading}
      modalClassName={"px-20 py-4 sm:py-10 gap-y-4"}
    >
      <p className="text-xl text-primary-text font-sunbird leading-8 text-center">
        {modalType === "answer"
          ? "View/Download Answer"
          : "View/Download Workbook"}
      </p>
      <div
        className={combineClassName(
          "border border-outline border-dashed min-w-xs min-h-36 max-w-3xl border-outline-border rounded-lg w-full flex flex-col justify-center items-center gap-2 outline-offset-4 outline-primary-main p-8",
          preLoading ? "shimmer-animation" : "",
          fileList?.length > 0 ? "" : "text-disable-text"
        )}
      >
        {fileList?.length > 0 ? (
          <div className="flex flex-wrap gap-4 max-h-96 overflow-y-auto empty:hidden justify-center">
            {fileList?.map((file, index) => {
              return file?.file && file?.id ? (
                <FileRender
                  value={undefined}
                  onChange={() => {}}
                  key={index}
                  file={file?.file}
                  id={file?.id}
                  multiple={true}
                  canClear={false}
                  disabled={false}
                  readOnly={false}
                />
              ) : null;
            })}
          </div>
        ) : loading ? (
          ""
        ) : (
          "No files available."
        )}
      </div>
    </Modal>
  );
};

export default WorkbookManagementViewFileModal;
