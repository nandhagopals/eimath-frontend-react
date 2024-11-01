// import { useLazyQuery, useMutation } from "@apollo/client";
// import { useNavigate } from "@tanstack/react-router";
// import { Form, FormSubmitHandler } from "react-hook-form";
// import { useState } from "react";
// import { formatDate } from "date-fns";
// import { Cell, Row, Table } from "react-aria-components";

// import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";
// import { Body, Head } from "components/Table";
// import { InputField } from "components/Form";
// import { Button } from "components/Buttons";

// import { useFormWithZod } from "global/hook";
// import { toastNotification } from "global/cache";
// import {
//   messageHelper,
//   notEmpty,
//   somethingWentWrongMessage,
// } from "global/helpers";

// import {
//   FILTER_INVOICES,
//   GENERATE_INVOICE_PDF,
//   UPDATE_INVOICE,
//   studentBillingSchema,
//   InvoiceFieldArgs,
//   StudentBillingForm,
// } from "modules/Students";
// import StudentRenewalInvoicePDF from "./StudentRenewalInvoicePDF";

// const tableHeaders = [
//   { name: "ID", id: "id" as const, isRowHeader: true },
//   { name: "Student ID", id: "studentId" as const },
//   { name: "Name", id: "name" as const },
//   { name: "Item", id: "item" as const },
//   { name: "Price", id: "price" as const },
// ];

// const fieldArgs: InvoiceFieldArgs = {
//   isInvoiceInvoiceItemsNeed: true,
//   isInvoiceStudentNeed: true,
//   isInvoiceRemarksNeed: true,
//   isInvoiceTotalNeed: true,
// };

// const StudentRenewalInvoice = () => {
//   const navigate = useNavigate();

//   const [fetchInvoice, { data, loading }] = useLazyQuery(FILTER_INVOICES, {
//     notifyOnNetworkStatusChange: true,
//     fetchPolicy: "cache-and-network",
//   });

//   const { control } = useFormWithZod({
//     schema: studentBillingSchema,
//     defaultValues: async () => {
//       const invoice = await fetchInvoice({
//         variables: {
//           ...fieldArgs,
//           filter: {
//             category: {
//               isExactly: "New student",
//             },
//             // studentId: {
//             //   number: studentId,
//             // },
//           },
//         },
//       })
//         .then(({ data }) => {
//           return data?.filterInvoices?.edges?.[0]?.node ?? null;
//         })
//         .catch((err) => {
//           toastNotification(messageHelper(err));
//           return null;
//         });

//       return {
//         remarks: invoice?.remarks ?? "",
//       };
//     },
//   });

//   const rows =
//     data?.filterInvoices?.edges
//       ?.map((invoice) => {
//         return invoice?.node?.invoiceItems?.map((invoiceItem) => ({
//           id: invoiceItem?.id,
//           studentId: invoice?.node?.student?.studentId,
//           items: invoiceItem?.itemName,
//           price: invoiceItem?.price,
//         }));
//       })
//       .flat(1)
//       ?.filter(notEmpty) ?? [];

//   const [updateMutation, { loading: updateLoading }] =
//     useMutation(UPDATE_INVOICE);

//   const [generateInvoice, { loading: generateInvoicePDFLoading }] =
//     useLazyQuery(GENERATE_INVOICE_PDF);

//   const [invoiceURL, setInvoiceURL] = useState<string | null>(null);

//   const submitHandler: FormSubmitHandler<StudentBillingForm> = ({
//     data: { remarks },
//   }) => {
//     if (data?.filterInvoices?.edges?.[0]?.node?.id)
//       updateMutation({
//         variables: {
//           id: data?.filterInvoices?.edges?.[0]?.node?.id,
//           status: "Unpaid",
//           remarks,
//         },
//       })
//         .then(({ data }) => {
//           if (data?.updateInvoice?.id) {
//             generateInvoice({
//               variables: {
//                 invoiceId: data?.updateInvoice?.id,
//               },
//             })
//               .then(({ data }) => {
//                 if (data?.generateInvoicePdf?.filePath) {
//                   setInvoiceURL(data?.generateInvoicePdf?.filePath);
//                 } else {
//                   toastNotification(somethingWentWrongMessage);
//                 }
//               })
//               .catch((err) => toastNotification(messageHelper(err)));
//           } else {
//             toastNotification(somethingWentWrongMessage);
//           }
//         })
//         .catch((error) => {
//           toastNotification(messageHelper(error));
//         });
//   };

//   const closeInvoicePDF = () => {
//     setInvoiceURL(null);
//   };

//   return (
//     <div className="grid grid-cols-1 max-w-7xl gap-6">
//       <TitleAndBreadcrumb
//         title={"Edit Renewal"}
//         breadcrumbs={[
//           { name: "Home", to: "/dash-board" },
//           {
//             name: "Accounts",
//             to: "/students/",
//           },
//           {
//             name: "Edit Renewal",
//             to: "/students/$studentId",
//             params: true,
//           },
//         ]}
//       />

//       <div className="p-6 md:p-8 bg-white shadow-card-outline rounded">
//         <div className="bg-white shadow-[0px_1px_18px_0px_#0000001F,0px_6px_10px_0px_#00000024,0px_3px_5px_-1px_#FF5F0033] rounded-[10px] p-6 md:px-16 md:py-8">
//           <Form
//             control={control}
//             onSubmit={submitHandler}
//             className="space-y-2"
//           >
//             <p className="text-[34px] font-sunbird">Summary</p>
//             <div className="text-sm font-normal text-primary-text">
//               <p>
//                 Invoice ID:{" "}
//                 {data?.filterInvoices?.edges?.[0]?.node?.student?.primaryKin
//                   ?.name ?? "-"}
//               </p>
//               <p>Centre ID: #0001</p>
//               <p>Date: {formatDate(new Date(), "dd/MM/yyyy")}</p>
//             </div>
//             <div className="overflow-x-auto">
//               <Table className={"table-auto w-full"}>
//                 <Head headers={tableHeaders} />
//                 <Body
//                   headers={tableHeaders}
//                   items={rows}
//                   className={"text-[14px] leading-5 tracking-[.17px]"}
//                   loading={loading}
//                 >
//                   {(item) => (
//                     <Row
//                       columns={tableHeaders}
//                       className={
//                         "hover:bg-action-hover focus:outline-none border-b"
//                       }
//                     >
//                       {(column) => (
//                         <Cell className={"p-4"}>
//                           {column?.id === "price" ? "$" : ""}
//                           {item[column?.id] ? item[column?.id] : "-"}
//                         </Cell>
//                       )}
//                     </Row>
//                   )}
//                 </Body>
//               </Table>
//             </div>

//             <div className="py-8 space-y-[71px]">
//               <div className="font-roboto text-sm font-normal text-primary-text space-y-1.5 grid grid-cols-1">
//                 <p className="text-end">Subtotal: $120</p>
//                 {data?.filterInvoices?.edges?.[0]?.node?.invoiceDiscounts?.map(
//                   (discount) => {
//                     return discount?.discountAmount && discount?.description ? (
//                       <p className="text-end">
//                         {discount?.description ?? "-"}: $
//                         {discount?.discountAmount ?? "0.00"}
//                       </p>
//                     ) : null;
//                   }
//                 )}
//                 <p className="text-end">GST 7%: $30.00</p>
//                 <p className="text-end">Subtotal: $120</p>
//               </div>

//               <InputField
//                 control={control}
//                 name="remarks"
//                 label="Remarks"
//                 className="max-w-[720px]"
//               />
//             </div>
//             <div className="flex justify-end gap-2 py-8">
//               <Button
//                 variant="outlined"
//                 className={"w-min shadow-none"}
//                 onPress={() => {
//                   navigate({
//                     to: "/students/$studentId/",
//                     params: true as any,
//                     search: true as any,
//                   });
//                 }}
//                 isDisabled={updateLoading || generateInvoicePDFLoading}
//               >
//                 BACK
//               </Button>
//               <Button
//                 className={"w-min"}
//                 type="submit"
//                 isDisabled={updateLoading || generateInvoicePDFLoading}
//               >
//                 PREVIEW
//               </Button>
//             </div>
//           </Form>
//         </div>
//       </div>
//       <StudentRenewalInvoicePDF
//         isOpen={!!invoiceURL}
//         onClose={closeInvoicePDF}
//         url={invoiceURL!}
//       />
//     </div>
//   );
// };

// export default StudentRenewalInvoice;

const StudentRenewalInvoice = () => {
  return <div>StudentRenewalInvoice</div>;
};

export default StudentRenewalInvoice;
