import { useQuery, useReactiveVar } from "@apollo/client";
import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";

import { Combobox, ComboboxProps } from "components/Form";

import { paginationDefaultCount, toastNotification } from "global/cache";
import { useInView } from "global/hook";
import { messageHelper } from "global/helpers";

import {
  FILTER_EDUCATIONAL_TERMS,
  EducationalTermsFilterInput,
  EducationalTermsFieldArgs,
} from "modules/EducationMaterials/Terms";

type Props<
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<
  ComboboxProps<TFieldValues, Name>,
  | "options"
  | "loading"
  | "onInputChange"
  | "searchKeys"
  | "validate"
  | "value"
  | "observe"
> & {
  args?: { filter?: EducationalTermsFilterInput } & EducationalTermsFieldArgs;
};

const EducationTermsField = <
  TFieldValues extends FieldValues = FieldValues,
  Name extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  className,
  disabled,
  label,
  multiple,
  onChange,
  placeholder,
  shouldUnregister,
  by,
  leadingIcon,
  readOnly,
  supportText,
  trailingIcon,
  variant,
  args,
  renderedOption,
  canClear,
  defaultValue,
  optionRenderString,
  placement,
  valueRenderString,
  classNameForMultipleValueItem,
  classNameForParent,
  classNameForLabel,
  allowCustomValue,
  allowCustomValueAsString,
}: Props<TFieldValues, Name>) => {
  const defaultPageSize = useReactiveVar(paginationDefaultCount);
  const { data, loading, error, fetchMore } = useQuery(
    FILTER_EDUCATIONAL_TERMS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        pagination: {
          size: defaultPageSize,
        },
        ...args,
      },
      notifyOnNetworkStatusChange: true,
      skip: disabled || readOnly ? true : false,
    }
  );

  const { observe } = useInView({
    onEnter: () => {
      if (
        !loading &&
        data?.filterEducationalTerms?.pageInfo?.hasNextPage &&
        data?.filterEducationalTerms?.pageInfo?.endCursor &&
        !disabled &&
        !readOnly
      ) {
        fetchMore({
          variables: {
            pagination: {
              after: data?.filterEducationalTerms?.pageInfo?.endCursor,
              size: defaultPageSize,
            },
            ...args,
          },
          updateQuery: (
            prev,
            { fetchMoreResult: { filterEducationalTerms } }
          ) => {
            if (!filterEducationalTerms) return prev;
            return {
              filterEducationalTerms:
                filterEducationalTerms?.edges &&
                filterEducationalTerms?.edges?.length > 0 &&
                prev?.filterEducationalTerms
                  ? prev?.filterEducationalTerms?.edges &&
                    prev?.filterEducationalTerms?.edges?.length > 0
                    ? {
                        edges: [
                          ...prev.filterEducationalTerms.edges,
                          ...filterEducationalTerms.edges,
                        ],
                        pageInfo: filterEducationalTerms?.pageInfo,
                      }
                    : {
                        edges: filterEducationalTerms?.edges,
                        pageInfo: filterEducationalTerms?.pageInfo,
                      }
                  : prev.filterEducationalTerms,
            };
          },
        }).catch((err) => {
          toastNotification(messageHelper(err));
        });
      }
    },
  });

  const options = useMemo(() => {
    return error?.message
      ? []
      : data?.filterEducationalTerms?.edges &&
        data?.filterEducationalTerms?.edges?.length > 0
      ? data?.filterEducationalTerms?.edges
          ?.map((edges) => {
            if (edges?.node?.id && edges?.node?.name) {
              return edges?.node;
            } else {
              return null;
            }
          })
          .filter(Boolean)
      : [];
  }, [data?.filterEducationalTerms?.edges, error?.message]);

  return (
    <Combobox
      control={control}
      name={name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={options as any}
      className={className}
      disabled={disabled}
      label={label}
      loading={loading}
      multiple={multiple}
      observe={observe}
      onChange={onChange}
      onInputChange={(value) => {
        if (!loading && !disabled && !readOnly)
          fetchMore({
            variables: {
              pagination: {
                size: defaultPageSize,
              },
              globalSearch: value || null,
              ...args,
            },
            updateQuery: (
              _,
              { fetchMoreResult: { filterEducationalTerms } }
            ) => {
              return {
                filterEducationalTerms,
              };
            },
          }).catch((err) => {
            toastNotification(messageHelper(err));
          });
      }}
      placeholder={placeholder}
      shouldUnregister={shouldUnregister}
      by={by}
      leadingIcon={leadingIcon}
      readOnly={readOnly}
      renderedOption={renderedOption}
      supportText={supportText}
      trailingIcon={trailingIcon}
      variant={variant}
      canClear={canClear}
      defaultValue={defaultValue}
      optionRenderString={optionRenderString}
      placement={placement}
      valueRenderString={valueRenderString}
      classNameForMultipleValueItem={classNameForMultipleValueItem}
      classNameForParent={classNameForParent}
      classNameForLabel={classNameForLabel}
      allowCustomValue={allowCustomValue}
      allowCustomValueAsString={allowCustomValueAsString}
    />
  );
};

export default EducationTermsField;
