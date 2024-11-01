/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloLink } from "@apollo/client/link/core/ApolloLink.js";
import { createSignalIfSupported } from "@apollo/client/link/http/createSignalIfSupported.js";
import { parseAndCheckHttpResponse } from "@apollo/client/link/http/parseAndCheckHttpResponse.js";
import { rewriteURIForGET } from "@apollo/client/link/http/rewriteURIForGET.js";
import {
  type HttpOptions,
  defaultPrinter,
  fallbackHttpConfig,
  selectHttpOptionsAndBodyInternal,
} from "@apollo/client/link/http/selectHttpOptionsAndBody.js";
import { selectURI } from "@apollo/client/link/http/selectURI.js";
import { serializeFetchParameter } from "@apollo/client/link/http/serializeFetchParameter.js";
import { Observable } from "@apollo/client/utilities/observables/Observable.js";
import { Kind, OperationTypeNode } from "graphql";

import {
  extractFiles,
  formDataAppendFile,
  isExtractableFile,
} from "global/config/apollo-upload-client";

const createUploadLink = ({
  uri: fetchUri = "/graphql",
  useGETForQueries,
  isExtractableFile: customIsExtractableFile,
  FormData: CustomFormData,
  formDataAppendFile: customFormDataAppendFile = formDataAppendFile,
  print = defaultPrinter,
  fetch: customFetch,
  fetchOptions,
  credentials,
  headers,
  includeExtensions,
}: HttpOptions & {
  FormData?: typeof FormData;
  formDataAppendFile?: typeof formDataAppendFile;
  isExtractableFile?: typeof isExtractableFile;
} = {}) => {
  const linkConfig = {
    http: { includeExtensions },
    options: fetchOptions,
    credentials,
    headers,
  };

  return new ApolloLink((operation) => {
    const context = operation?.getContext();

    const headers = context?.headers;
    const name = context?.clientAwareness?.name;
    const version = context?.clientAwareness?.version;

    const newURI = context?.uri;
    const newURIToken = context?.uriToken;
    const contextHeaders = context?.headers || {};

    const contextConfig = {
      http: context?.http,
      options: context?.fetchOptions,
      credentials: context?.credentials,
      headers:
        Object.entries(contextHeaders)?.length > 0
          ? {
              ...(name && { "apollographql-client-name": name }),
              ...(version && { "apollographql-client-version": version }),
              ...headers,
              ...contextHeaders,
            }
          : {
              ...(name && { "apollographql-client-name": name }),
              ...(version && { "apollographql-client-version": version }),
              ...headers,
              authorization: newURIToken
                ? newURIToken
                : localStorage?.getItem("token")
                ? `Bearer ${localStorage.getItem("token") || ""}`
                : "",
            },
    };

    const { options, body } = selectHttpOptionsAndBodyInternal(
      operation,
      print,
      fallbackHttpConfig,
      linkConfig,
      contextConfig
    );

    const { clone, files } = extractFiles(
      body,
      customIsExtractableFile ? customIsExtractableFile : isExtractableFile,
      ""
    );

    let uri = selectURI(operation, newURI || fetchUri);

    if (files.size) {
      // biome-ignore lint/performance/noDelete: <explanation>
      if (options?.headers) delete options?.headers["content-type"];

      const RuntimeFormData = CustomFormData || FormData;

      const form = new RuntimeFormData();

      form.append("operations", serializeFetchParameter(clone, "Payload"));

      const map: any = {};

      let i = 0;
      files.forEach((paths) => {
        if (paths && Array.isArray(paths)) {
          paths.map((path) => {
            map[i++] = [path];
          });
        } else {
          map[i++] = [paths];
        }
      });

      form.append("map", JSON.stringify(map));

      i = 0;
      files.forEach((paths, file) => {
        if (paths && Array.isArray(paths)) {
          paths.map(() => {
            customFormDataAppendFile(form, String(i++), file);
          });
        } else {
          customFormDataAppendFile(form, String(i++), file);
        }
      });

      options.body = form;
    } else {
      if (
        useGETForQueries &&
        !operation?.query?.definitions?.some(
          (definition) =>
            definition.kind === Kind.OPERATION_DEFINITION &&
            definition.operation === OperationTypeNode.MUTATION
        )
      )
        options.method = "GET";

      if (options.method === "GET") {
        const { newURI, parseError } = rewriteURIForGET(uri, body);
        if (parseError)
          return new Observable((observer) => {
            observer.error(parseError);
          });
        uri = newURI;
      } else options.body = serializeFetchParameter(clone, "Payload");
    }

    const { controller } = createSignalIfSupported();

    if (typeof controller !== "boolean") {
      if (options?.signal)
        options?.signal?.aborted
          ? controller?.abort()
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            options?.signal?.addEventListener(
              "abort",
              () => {
                controller.abort();
              },
              {
                once: true,
              }
            );
      options.signal = controller?.signal;
    }

    const runtimeFetch = customFetch || fetch;

    return new Observable((observer) => {
      let cleaningUp: boolean;

      runtimeFetch(uri, options)
        .then((response) => {
          operation.setContext({ response });
          return response;
        })
        .then(parseAndCheckHttpResponse(operation))
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          if (!cleaningUp) {
            if (error.result?.errors && error?.result?.data)
              observer?.next(error.result);

            observer?.error(error);
          }
        });

      return () => {
        cleaningUp = true;

        if (typeof controller !== "boolean") controller?.abort();
      };
    });
  });
};

export default createUploadLink;
