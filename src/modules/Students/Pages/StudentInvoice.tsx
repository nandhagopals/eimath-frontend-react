// import { Cell, Row, Table } from "react-aria-components";
// import { useNavigate } from "@tanstack/react-router";
// import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
// import { formatDate } from "date-fns";
// import { Form, FormSubmitHandler } from "react-hook-form";
// import { useState } from "react";

// import { Button } from "components/Buttons";
// import { InputField } from "components/Form";
// import { Body, Head } from "components/Table";
// // import { TitleAndBreadcrumb } from "components/TitleAndBreadcrumb";

// import Logo from "global/assets/images/logo-50.svg?react";
// import {
//   messageHelper,
//   notEmpty,
//   somethingWentWrongMessage,
// } from "global/helpers";
// import { useFormWithZod } from "global/hook";
// import { toastNotification } from "global/cache";

// import {
//   FILTER_INVOICES,
//   GENERATE_INVOICE_PDF,
//   UPDATE_INVOICE,
//   InvoiceFieldArgs,
//   StudentBillingForm,
//   studentBillingSchema,
// } from "modules/Students";
// import { FILTER_FRANCHISEES } from "modules/Franchisee";
// import StudentInvoicePDF from "modules/Students/Pages/StudentInvoicePDF";

// const tableHeaders = [
//   { name: "ID", id: "id" as const, isRowHeader: true },
//   { name: "Student ID", id: "studentId" as const },
//   { name: "Name", id: "name" as const },
//   { name: "Item", id: "item" as const },
//   { name: "Quantity", id: "quantity" as const },
//   { name: "Unit price", id: "unitPrice" as const },
//   { name: "Price", id: "price" as const },
// ];

// const fieldArgs: InvoiceFieldArgs = {
//   isInvoiceInvoiceItemsNeed: true,
//   isInvoiceStudentNeed: true,
//   isInvoiceRemarksNeed: true,
//   isInvoiceTotalNeed: true,
//   isInvoiceGSTAmountNeed: true,
//   isInvoiceInvoiceDiscountNeed: true,
//   isInvoiceSubtotalNeed: true,
// };

// const StudentInvoice = () => {
//   const navigate = useNavigate();
//   // const { studentId } = useParams({
//   //   from: "/private-layout/students/$studentId/invoice",
//   // });
//   const [fetchInvoice, { data, loading }] = useLazyQuery(FILTER_INVOICES, {
//     notifyOnNetworkStatusChange: true,
//     fetchPolicy: "cache-and-network",
//   });

//   const { loading: franchiseeLoading, data: filterFranchisees } = useQuery(
//     FILTER_FRANCHISEES,
//     {
//       fetchPolicy: "cache-and-network",
//       variables: {
//         isFranchiseeAddressNeed: true,
//         isFranchiseeOwnerIsdCodeNeed: true,
//         isFranchiseeOwnerMobileNumberNeed: true,
//       },
//     }
//   );
//   const franchisee = filterFranchisees?.filterFranchisees?.edges?.[0]?.node;

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
//             studentId: {
//               // number: studentId,
//             },
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
//           quantity: invoiceItem?.quantity,
//           unitPrice: invoiceItem?.unitPrice,
//           price: invoiceItem?.price,
//         }));
//       })
//       .flat(1)
//       ?.filter(notEmpty) ?? [];

//   const [updateMutation, { loading: updateLoading }] =
//     useMutation(UPDATE_INVOICE);

//   const [generateInvoice, { loading: generateInvoicePDFLoading }] =
//     useLazyQuery(GENERATE_INVOICE_PDF);

//   const [invoicePDF, setInvoicePDF] = useState<{
//     url: string;
//     invoiceId: number;
//   } | null>(null);

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
//               .then(({ data: generateInvoicePdf }) => {
//                 if (generateInvoicePdf?.generateInvoicePdf?.filePath) {
//                   setInvoicePDF({
//                     url: generateInvoicePdf?.generateInvoicePdf?.filePath,
//                     invoiceId: data?.updateInvoice?.id!,
//                   });
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
//     setInvoicePDF(null);
//   };

//   return (
//     <div className="grid grid-cols-1 max-w-7xl gap-6">
//       {/* <TitleAndBreadcrumb
//         title={"Create Student Account"}
//         breadcrumbs={[
//           { name: "Home", to: "/dash-board" },
//           {
//             name: "Accounts",
//             to: "/students/",
//           },
//           {
//             name: "Create Student Account",
//             to: "/students/$studentId/invoice",
//             params: {
//               studentId,
//             },
//           },
//         ]}
//       /> */}

//       <div className="p-6 md:p-8 bg-white shadow-card-outline rounded">
//         <div className="bg-white shadow-[0px_1px_18px_0px_#0000001F,0px_6px_10px_0px_#00000024,0px_3px_5px_-1px_#FF5F0033] rounded-[10px] p-6 md:px-16 md:py-8">
//           <Form
//             control={control}
//             onSubmit={submitHandler}
//             className="space-y-2"
//           >
//             <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-2.5 md:justify-between">
//               <Logo className="" />
//               <div className="grid grid-cols-1 text-primary-text">
//                 <p className="font-sunbird  text-xl">EiMath Head Quarter</p>
//                 <p className="text-sm space-x-1">
//                   <span className="font-semibold">Address:</span>{" "}
//                   <span>{franchisee?.address ?? "-"}</span>
//                 </p>
//                 <p className="text-sm space-x-1">
//                   <span className="font-semibold">Contact No:</span>
//                   <span>
//                     {franchisee?.ownerIsdCode ?? ""}{" "}
//                     {franchisee?.ownerMobileNumber ?? "-"}
//                   </span>
//                 </p>
//               </div>
//             </div>
//             <p className="text-[34px] font-sunbird">Sales Order</p>
//             <div className="text-sm font-normal text-primary-text">
//               <p>
//                 Ordering Party:{" "}
//                 {data?.filterInvoices?.edges?.[0]?.node?.student?.primaryKin
//                   ?.name ?? "-"}
//               </p>
//               <p>Ordering ID: #0001</p>
//               <p>Date: {formatDate(new Date(), "dd/MM/yyyy")}</p>
//             </div>
//             <div className="overflow-x-auto">
//               <Table className={"table-auto w-full"}>
//                 <Head headers={tableHeaders} />
//                 <Body
//                   headers={tableHeaders}
//                   items={rows}
//                   className={"text-[14px] leading-5 tracking-[.17px]"}
//                   loading={franchiseeLoading || loading}
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
//                           {column?.id === "price" || column?.id === "unitPrice"
//                             ? "$"
//                             : ""}
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
//                 <p className="text-end">
//                   Subtotal: $
//                   {data?.filterInvoices?.edges?.[0]?.node?.subtotal ?? "0.00"}
//                 </p>
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
//                 {data?.filterInvoices?.edges?.[0]?.node?.gstAmount ||
//                 data?.filterInvoices?.edges?.[0]?.node?.gstAmount === 0 ? (
//                   <p className="text-end">
//                     GST: ${data?.filterInvoices?.edges?.[0]?.node?.gstAmount}
//                   </p>
//                 ) : null}
//                 <p className="text-end">
//                   Total: $
//                   {data?.filterInvoices?.edges?.[0]?.node?.total ?? "0.00"}
//                 </p>
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
//       <StudentInvoicePDF
//         isOpen={invoicePDF?.url && invoicePDF?.invoiceId ? true : false}
//         onClose={closeInvoicePDF}
//         url={invoicePDF?.url!}
//         invoiceId={invoicePDF?.invoiceId!}
//       />
//     </div>
//   );
// };

// export default StudentInvoice;

const StudentInvoice = () => {
  return <div>StudentInvoice</div>;
};

export default StudentInvoice;
