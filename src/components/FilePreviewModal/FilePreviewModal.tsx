import { type FC, Fragment, useState, useEffect } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Button } from "react-aria-components";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { pdfjs, Document, Page } from "react-pdf";

import type { FilePreview } from "components/FilePreviewModal/types";
import Image from "components/Image";
import { Tooltip } from "components/Tooltip";
import { Modal } from "components/Modal";

import { combineClassName, imageMimeTypes } from "global/helpers";
import { filePreview } from "global/cache/cache";
import CloseIcon from "global/assets/images/cancel-filled.svg?react";
import ZoomInIcon from "global/assets/images/zoom-in.svg?react";
import ZoomOutIcon from "global/assets/images/zoom-out.svg?react";
import ResetIcon from "global/assets/images/image-reset.svg?react";
import CenterIcon from "global/assets/images/arrow-align-center.svg?react";
import DownloadIcon from "global/assets/images/download.svg?react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const FilePreviewModal: FC<FilePreview> = ({ data, title }) => {
  const downloadImage = async () => {
    if (dataURL) {
      try {
        const response = await fetch(dataURL);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data?.name || `File.${data?.type?.split("/")[1]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    }
  };

  const onClose = () => {
    filePreview(null);
  };
  const [dataURL, setDataURL] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(true);

  useEffect(() => {
    if (data) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDataURL(
          typeof e?.target?.result === "string" ? e?.target?.result : null
        );
        setFileLoading(false);
      };
      reader.readAsDataURL(data);
    }
  }, [data]);

  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }
  return (
    <Modal
      onClose={onClose}
      isOpen={!!data}
      name="File preview"
      className="max-w-min p-2 md:p-4 rounded-md md:rounded-xl"
    >
      <div className={"bg-white rounded-md"}>
        <div className="py-3 flex justify-between items-center border-b gap-2 bg-secondary-container rounded-t-[inherit]">
          <p className="text-base text-on-background truncate flex-1 text-start max-w-xl">
            {title ? title : "File preview"}
          </p>
          <Button
            onPress={onClose}
            className={({ isFocusVisible }) =>
              combineClassName(
                "text-black/25 focus:outline-none rounded-full",
                isFocusVisible ? "bg-secondary-button-hover" : ""
              )
            }
          >
            <CloseIcon />
          </Button>
        </div>
        <div className="p-2 flex flex-col justify-center items-center">
          {dataURL && data?.type ? (
            <Fragment>
              {imageMimeTypes?.includes(data?.type) ? (
                <TransformWrapper>
                  {({ zoomIn, zoomOut, centerView, resetTransform }) => (
                    <Fragment>
                      <div className="flex gap-5 flex-wrap justify-center items-center p-3">
                        <Tooltip renderer={"Zoom In"} isArrow>
                          <ZoomInIcon
                            onClick={() => {
                              zoomIn();
                            }}
                            className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                          />
                        </Tooltip>
                        <Tooltip renderer={"Zoom Out"} isArrow>
                          <ZoomOutIcon
                            onClick={() => {
                              zoomOut();
                            }}
                            className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                          />
                        </Tooltip>
                        <Tooltip renderer={"Center"} isArrow>
                          <CenterIcon
                            onClick={() => {
                              centerView();
                            }}
                            className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                          />
                        </Tooltip>
                        <Tooltip renderer={"Reset"} isArrow>
                          <ResetIcon
                            className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                            onClick={() => {
                              resetTransform();
                            }}
                          />
                        </Tooltip>
                        <Tooltip renderer={"Download"} isArrow>
                          <DownloadIcon
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage();
                            }}
                            className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                          />
                        </Tooltip>
                      </div>
                      <TransformComponent contentClass="min-w-[80vw] max-w-[80vw] mx-auto min-h-[80dvh] max-h-[80dvh]">
                        <Image
                          src={dataURL}
                          className="object-fill rounded-md shadow-md mx-auto w-max h-max"
                        />
                      </TransformComponent>
                    </Fragment>
                  )}
                </TransformWrapper>
              ) : data?.type === "application/pdf" ? (
                <div className="min-h-[80vh] max-h-[80vh] min-w-[80vw] overflow-y-auto overflow-x-auto w-full">
                  <div className="flex gap-5 flex-wrap justify-center items-center p-3 sticky top-0 z-20">
                    <Tooltip renderer={"Download"} isArrow>
                      <DownloadIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage();
                        }}
                        className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                      />
                    </Tooltip>
                  </div>
                  <Document
                    file={dataURL}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="min-h-[70vh] w-full shimmer-animation flex justify-center items-center">
                        Loading...
                      </div>
                    }
                    error={
                      <div className="min-h-[70vh] w-full flex justify-center items-center">
                        No data found.
                      </div>
                    }
                    className={"w-full space-y-6"}
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <TransformWrapper>
                        {({ zoomIn, zoomOut, centerView, resetTransform }) => (
                          <div className="border flex justify-center items-center flex-col rounded-lg pb-5">
                            <div className="flex gap-5 flex-wrap justify-center items-center p-3">
                              <Tooltip renderer={"Zoom In"} isArrow>
                                <ZoomInIcon
                                  onClick={() => {
                                    zoomIn();
                                  }}
                                  className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                                />
                              </Tooltip>
                              <Tooltip renderer={"Zoom Out"} isArrow>
                                <ZoomOutIcon
                                  onClick={() => {
                                    zoomOut();
                                  }}
                                  className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                                />
                              </Tooltip>
                              <Tooltip renderer={"Center"} isArrow>
                                <CenterIcon
                                  onClick={() => {
                                    centerView();
                                  }}
                                  className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                                />
                              </Tooltip>
                              <Tooltip renderer={"Reset"} isArrow>
                                <ResetIcon
                                  className="cursor-pointer w-6 h-6 sm:w-8 sm:h-8 p-0.5 sm:p-1 bg-white border shadow-md rounded-full text-secondary-text"
                                  onClick={() => {
                                    resetTransform();
                                  }}
                                />
                              </Tooltip>
                            </div>
                            <TransformComponent contentClass="w-full flex justify-center items-center rounded-md">
                              <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                              />
                            </TransformComponent>
                          </div>
                        )}
                      </TransformWrapper>
                    ))}
                  </Document>
                </div>
              ) : (
                <object
                  className={combineClassName(
                    "rounded-[inherit] min-w-[80vw] max-w-[80vw] mx-auto min-h-[80dvh] max-h-[80dvh]"
                  )}
                  data={dataURL}
                >
                  <a
                    href={dataURL}
                    download={data?.name || `File.${data?.type?.split("/")[1]}`}
                    className="cursor-pointer"
                    target="_blank"
                    rel="noreferrer"
                  >
                    File missing. Click to download.
                  </a>
                </object>
              )}
            </Fragment>
          ) : (
            <p
              className={
                "min-w-[80vw] max-w-[80vw] mx-auto min-h-[80dvh] max-h-[80dvh] flex justify-center items-center"
              }
            >
              {fileLoading ? "Loading..." : "File missing"}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FilePreviewModal;
