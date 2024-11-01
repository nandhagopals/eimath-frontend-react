import {
  ComponentPropsWithRef,
  FC,
  FunctionComponent,
  useEffect,
  useState,
} from "react";

import FileIcon from "global/assets/images/reports.svg?react";
import { combineClassName } from "global/helpers";

type Props = Omit<ComponentPropsWithRef<"img">, "src"> & {
  src: string;
  loadingComponentProps?: ComponentPropsWithRef<"div">;
  errorComponentProps?: ComponentPropsWithRef<"div">;
  classNameForErrorImageSVG?: string;
  errorSVG?: FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  classNameForErrorParent?: string;
};

const ImageComponent: FC<Props> = (props) => {
  const [imageLoading, setImageLoading] = useState(true);

  const [imageError, setImageError] = useState(false);

  const imageLoadingHandler = () => {
    setImageLoading(false);
  };

  const imageErrorHandler = () => {
    setImageError(true);
    setImageLoading(false);
  };

  useEffect(() => {
    const img = new Image();
    img.src = props?.src;

    img.onload = () => {
      setImageLoading(false);
    };

    img.onerror = () => {
      setImageError(true);
      setImageLoading(false);
    };
  }, [props?.src]);

  const {
    loadingComponentProps,
    errorComponentProps,
    classNameForErrorImageSVG,
    errorSVG,
    classNameForErrorParent,
    ...imageProps
  } = props;

  const ErrorIcon = errorSVG || FileIcon;

  return imageLoading ? (
    <div
      className={combineClassName(
        "w-full h-full object-cover border rounded-xl flex justify-center items-center overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:border-t before:border-slate-200 before:bg-gradient-to-r before:from-transparent before:via-slate-200 before:to-transparent",
        loadingComponentProps?.className || props?.className || ""
      )}
    />
  ) : imageError ? (
    <div
      className={combineClassName(
        "w-10 h-10 p-2 rounded-full shadow flex justify-center items-center",
        classNameForErrorParent ||
          errorComponentProps?.className ||
          props?.className ||
          ""
      )}
    >
      <ErrorIcon
        className={combineClassName(
          "w-10 h-10 text-secondary-text",
          classNameForErrorImageSVG
        )}
      />
    </div>
  ) : (
    <img
      onLoad={imageLoadingHandler}
      onError={imageErrorHandler}
      className={combineClassName(
        "w-full h-full object-cover",
        props?.className || ""
      )}
      loading={props?.loading || "lazy"}
      {...imageProps}
      alt={props?.alt || "Image"}
    />
  );
};

ImageComponent.displayName = "Image";

export default ImageComponent;
