import { useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Form, FormSubmitHandler } from "react-hook-form";
import { formatDate } from "date-fns";
import { Cell, Row, Table } from "react-aria-components";
import { useParams } from "@tanstack/react-router";

import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
import { Body, Head } from "components/Table";
import { TextArea } from "components/Form";
import { Button } from "components/Buttons";

import { useAuth, useFormWithZod } from "global/hook";
import { toastNotification } from "global/cache";
import {
  messageHelper,
  notEmpty,
  somethingWentWrongMessage,
} from "global/helpers";

import {
  FILTER_INVOICES,
  UPDATE_INVOICE,
  studentBillingSchema,
  InvoiceFieldArgs,
  StudentBillingForm,
} from "modules/Students";
import ViewInvoiceOrReceipt from "modules/Sales/Pages/ViewInvoiceOrReceipt";

const tableHeaders = [
  { name: "No.", id: "id" as const, isRowHeader: true },
  { name: "Items", id: "items" as const },
  { name: "Quantity", id: "quantity" as const },
  { name: "Unit Price", id: "unitPrice" as const },
  { name: "Price", id: "price" as const },
];

const fieldArgs: InvoiceFieldArgs = {
  isInvoiceInvoiceItemsNeed: true,
  isInvoiceOrderingPartyNameNeed: true,
  isInvoiceOrderingPartyStudentNeed: true,
  isInvoiceOrderingPartyFranchiseeNeed: true,
  isInvoiceOrderingPartyMFNeed: true,
  isInvoiceInvoiceIdNeed: true,
  isInvoiceSubtotalNeed: true,
  isInvoiceGSTAmountNeed: true,
  isInvoiceTotalNeed: true,
  isInvoiceRemarksNeed: true,
  isInvoiceInvoiceDiscountsNeed: true,
  isInvoiceUpdatedAtNeed: true,
};

const StudentRenewalInvoice = () => {
  const navigate = useNavigate();
  const { saleId } = useParams({
    from: "/private-layout/sales/$saleId/invoice",
  });
  const { pageStatus } = useSearch({
    from: "/private-layout/sales/$saleId/invoice",
  });
  const { authUserDetails } = useAuth();
  const isMasterFranchisee =
    authUserDetails?.type === "MF Owner" ||
    authUserDetails?.type === "MF Staff";

  const [fetchInvoice, { data, loading }] = useLazyQuery(FILTER_INVOICES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const { control } = useFormWithZod({
    schema: studentBillingSchema,
    defaultValues: async () => {
      const invoice = await fetchInvoice({
        variables: {
          ...fieldArgs,
          filter: {
            id: {
              number: saleId,
            },
            mfScreen: isMasterFranchisee ? "Franchisee" : undefined,
          },
        },
      })
        .then(({ data }) => {
          return data?.filterInvoices?.edges?.[0]?.node ?? null;
        })
        .catch((err) => {
          toastNotification(messageHelper(err));
          return null;
        });

      return {
        remarks: invoice?.remarks ?? "",
      };
    },
  });

  const invoiceDetails = data?.filterInvoices?.edges?.[0]?.node;

  const rows =
    data?.filterInvoices?.edges
      ?.map((invoice) => {
        return invoice?.node?.invoiceItems?.map((invoiceItem, index) => {
          return {
            id: index + 1,
            items:
              invoiceItem?.itemName ??
              invoiceItem.item?.name ??
              invoiceItem?.workbookInformation?.name ??
              invoiceItem?.educationalTerm?.name,
            quantity: invoiceItem?.quantity,
            unitPrice: invoiceItem?.unitPrice,
            price: invoiceItem?.price,
          };
        });
      })
      .flat(1)
      ?.filter(notEmpty) ?? [];

  const [updateMutation, { loading: updateLoading }] =
    useMutation(UPDATE_INVOICE);

  const [invoiceURL, setInvoiceURL] = useState<string | null>(null);
  const [pdfFileDetails, setPDFFileDetails] = useState<{
    fileType?: "INVOICE" | "RECEIPT";
    fileTypeId?: number;
  } | null>(null);

  const submitHandler: FormSubmitHandler<StudentBillingForm> = ({
    data: { remarks },
  }) => {
    if (invoiceDetails?.id)
      updateMutation({
        variables: {
          id: invoiceDetails?.id,
          status: "Unpaid",
          remarks: remarks?.trim() || null,
          isInvoiceInvoiceFileURLNeed: true,
        },
      })
        .then(({ data }) => {
          if (data?.updateInvoice?.id && data?.updateInvoice?.invoiceFileURL) {
            setInvoiceURL(data?.updateInvoice?.invoiceFileURL);
            setPDFFileDetails({
              fileType: "INVOICE",
              fileTypeId: data?.updateInvoice?.id,
            });
          } else {
            toastNotification(somethingWentWrongMessage);
          }
        })
        .catch((error) => {
          toastNotification(messageHelper(error));
        });
  };

  const closeInvoicePDF = () => {
    setInvoiceURL(null);
    setPDFFileDetails(null);
  };

  return (
    <div className="grid grid-cols-1 max-w-4xl gap-6">
      <TitleAndBreadcrumb
        title={"Create Invoice"}
        breadcrumbs={[
          { name: "Home", to: "/dash-board" },
          {
            name: "Accounts",
            to: "/sales",
          },
          {
            name: "Create Sales Invoice",
            to: "/sales/$saleId/invoice",
            params: true,
          },
        ]}
      />

      <div className="p-6 md:p-8 bg-white shadow-card-outline rounded">
        <div className="bg-white">
          <Form
            control={control}
            onSubmit={submitHandler}
            className="space-y-2"
          >
            <p className="text-[34px] font-sunbird">Sales Summary</p>
            <div className="text-sm font-normal text-primary-text py-4">
              <p>
                Ordering Party:{" "}
                {invoiceDetails?.orderingPartyName ??
                  invoiceDetails?.orderingPartyStudent?.name ??
                  invoiceDetails?.orderingPartyFranchisee?.franchiseeName ??
                  invoiceDetails?.orderingPartyMF?.masterFranchiseeName}
              </p>
              <p>
                Sales ID: #
                {invoiceDetails?.invoiceId
                  ?.split("-")
                  ?.at(invoiceDetails?.invoiceId?.split("-")?.length - 1) ||
                  "N/A"}
              </p>
              <p>
                Date:{" "}
                {invoiceDetails?.updatedAt &&
                formatDate(invoiceDetails?.updatedAt, "dd/MM/yyy")
                  ? formatDate(invoiceDetails?.updatedAt, "dd/MM/yyy")
                  : "N/A"}
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table
                className={"table-auto w-full"}
                aria-label="sales-summary"
                aria-labelledby="sales-summary"
              >
                <Head headers={tableHeaders} />
                <Body
                  headers={tableHeaders}
                  items={rows}
                  className={"text-[14px] leading-5 tracking-[.17px]"}
                  loading={loading}
                  defaultPageSize={5}
                >
                  {(item) => (
                    <Row
                      columns={tableHeaders}
                      className={
                        "hover:bg-action-hover focus:outline-none border-b"
                      }
                    >
                      {(column) => (
                        <Cell key={column?.id} className={"p-4"}>
                          {item[column?.id] ? item[column?.id] : "-"}
                        </Cell>
                      )}
                    </Row>
                  )}
                </Body>
              </Table>
            </div>
            <div className="grid grid-cols-[80%,20%] py-6">
              <TextArea
                control={control}
                name="remarks"
                label="Remarks"
                className="max-w-[500px]"
              />
              <div className="font-roboto text-sm font-normal text-primary-text space-y-1.5 grid grid-cols-1 pl-4">
                <p className="text-start whitespace-nowrap">
                  Subtotal: {invoiceDetails?.subtotal ?? 0}
                </p>
                {invoiceDetails?.invoiceDiscounts?.map((discount) => {
                  return discount?.discountAmount && discount?.description ? (
                    <p className="text-start">
                      {discount?.description ?? "-"}:{" "}
                      {discount?.discountAmount ?? "0.00"}
                    </p>
                  ) : null;
                })}
                <p className="text-start whitespace-nowrap">
                  GST: {invoiceDetails?.gstAmount ?? 0}
                </p>
                <p className="text-start whitespace-nowrap">
                  Total: {invoiceDetails?.total ?? 0}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 py-8">
              <Button
                className={
                  "w-min bg-none bg-secondary-button mr-2 text-primary-text hover:bg-secondary-button-hover"
                }
                onPress={() => {
                  navigate({
                    to: "/sales/$saleId",
                    params: {
                      saleId,
                    },
                    search: {
                      pageStatus,
                    },
                  });
                }}
                isDisabled={updateLoading}
              >
                BACK
              </Button>
              <Button
                className={"w-min"}
                type="submit"
                isDisabled={updateLoading}
                loading={updateLoading}
              >
                PREVIEW
              </Button>
            </div>
          </Form>
        </div>
      </div>
      {invoiceURL ? (
        <ViewInvoiceOrReceipt
          isOpen={!!invoiceURL}
          onClose={closeInvoicePDF}
          url={invoiceURL}
          fileType={pdfFileDetails?.fileType}
          fileTypeId={pdfFileDetails?.fileTypeId}
        />
      ) : null}
    </div>
  );
};

export default StudentRenewalInvoice;
