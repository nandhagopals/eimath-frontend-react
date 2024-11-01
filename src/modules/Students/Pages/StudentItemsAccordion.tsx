import { useQuery } from "@apollo/client";
import { FC } from "react";
import {
  Button,
  Cell,
  Column,
  Dialog,
  DialogTrigger,
  Popover,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";

import ArrowDownIcon from "global/assets/images/expand-more-filled.svg?react";
import { combineClassName, notEmpty } from "global/helpers";
import { usePreLoading } from "global/hook";

import { FILTER_STUDENTS } from "modules/Students";

interface Props {
  studentId: number;
}

const Content: FC<Props> = ({ studentId }) => {
  // Student invoice items fetching query start
  // const { data, loading } = useQuery(FILTER_INVOICES, {
  //   notifyOnNetworkStatusChange: true,
  //   fetchPolicy: "cache-and-network",
  //   variables: {
  //     isInvoiceInvoiceItemsNeed: true,
  //     filter: {
  //       studentId: {
  //         number: studentId,
  //       },
  //     },
  //   },
  // });

  // const items =
  //   data?.filterInvoices?.edges
  //     ?.map((invoice) => {
  //       return invoice?.node?.invoiceItems?.map((invoiceItem) => ({
  //         id: invoiceItem?.id,
  //         item:
  //           invoiceItem?.itemName ??
  //           invoiceItem?.item?.name ??
  //           invoiceItem?.educationalTerm?.name ??
  //           invoiceItem?.workbookInformation?.name,
  //         quantity: invoiceItem?.quantity,
  //         price: invoiceItem?.price,
  //       }));
  //     })
  //     .flat(1)
  //     ?.filter(notEmpty) ?? [];
  // End

  // Fetch student next term details start
  const { data, loading } = useQuery(FILTER_STUDENTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    variables: {
      filter: {
        id: {
          number: studentId,
        },
      },
      isStudentMasterFranchiseeInformationNeed: true,
      isStudentMasterFranchiseeInformationWorkbooksNeed: true,
      isStudentNextEducationalTermNeed: true,
      isStudentNextEducationalTermWorkbooksNeed: true,
    },
  });

  const items =
    data?.filterStudents?.edges
      ?.map((studentDetails) => {
        if (
          studentDetails?.node?.nextEducationalTerm &&
          studentDetails?.node?.nextEducationalTerm?.id
        ) {
          return studentDetails?.node?.nextEducationalTerm?.workbookInformation?.map(
            (workbookDetails) => {
              return {
                id: workbookDetails?.id,
                item: workbookDetails?.name,
                quantity: 1,
                price:
                  studentDetails?.node?.masterFranchiseeInformation?.masterFranchiseeWorkBook?.filter(
                    (mfWorkbookDetails) =>
                      mfWorkbookDetails?.workbookInformation?.id ===
                      workbookDetails?.id
                  )?.[0]?.price,
              };
            }
          );
        } else {
          return [];
        }
      })
      .flat(1)
      ?.filter(notEmpty) ?? [];
  // End

  const preLoading = usePreLoading(loading);

  return preLoading ? (
    <div className="shimmer-animation bg-slate-300 min-h-32 min-w-xs rounded-md" />
  ) : (
    <div className="max-w-[800px] min-w-xs overflow-x-auto border rounded border-outline-light">
      <Table aria-label="Student items" className={"focus:outline-none w-full"}>
        <TableHeader className={"bg-[#DAD6D7]"}>
          <Column
            isRowHeader
            className={
              "px-4 py-3 text-base font-normal text-secondary-text text-left"
            }
          >
            Items
          </Column>
          <Column
            className={
              "px-4 py-3 text-base font-normal text-secondary-text text-left"
            }
          >
            Quantity
          </Column>
          <Column
            className={
              "px-4 py-3 text-base font-normal text-secondary-text text-left"
            }
          >
            Price
          </Column>
        </TableHeader>
        <TableBody
          items={items}
          className={"bg-"}
          renderEmptyState={() => (
            <div className="w-full min-h-[100px] grid place-items-center text-primary-text/40 bg-[#E1DBDB] rounded-b">
              No records found...
            </div>
          )}
        >
          {({ item, price, quantity }) => {
            return (
              <Row className={"bg-[#E1DBDB]"}>
                <Cell className={"px-4 py-3"}>{item ?? "-"}</Cell>
                <Cell className={"px-4 py-3"}>{quantity ?? "-"}</Cell>
                <Cell className={"px-4 py-3"}>{price ?? "0.00"}</Cell>
              </Row>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
};

const StudentItemsAccordion: FC<Props> = ({ studentId }) => {
  return (
    <DialogTrigger>
      <Button
        className={({ isFocusVisible }) =>
          combineClassName(
            "w-12 h-12 flex justify-center items-center rounded-full hover:bg-action-hover",
            isFocusVisible ? "bg-action-hover" : ""
          )
        }
      >
        <ArrowDownIcon className="text-action-active" />
      </Button>
      <Popover placement="bottom end">
        <Dialog>
          <Content studentId={studentId} />{" "}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

export default StudentItemsAccordion;
