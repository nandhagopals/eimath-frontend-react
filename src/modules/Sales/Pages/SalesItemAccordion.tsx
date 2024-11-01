import { FC } from "react";
import { useQuery } from "@apollo/client";
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

import { FILTER_INVOICES } from "modules/Students";

interface Props {
  invoiceId: number;
  isMasterFranchisee: boolean;
  fromHQOrWithFranchisee?: "FROM HQ" | "WITH FRANCHISEE";
}

const Content: FC<Props> = ({
  invoiceId,
  isMasterFranchisee,
  fromHQOrWithFranchisee,
}) => {
  const { data, loading } = useQuery(FILTER_INVOICES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    variables: {
      isInvoiceInvoiceItemsNeed: true,
      filter: {
        id: {
          number: invoiceId,
        },
        mfScreen: isMasterFranchisee
          ? fromHQOrWithFranchisee === "FROM HQ"
            ? "HQ"
            : "Franchisee"
          : undefined,
      },
    },
  });

  const items =
    data?.filterInvoices?.edges
      ?.map((invoice) => {
        return invoice?.node?.invoiceItems?.map((invoiceItem) => ({
          id: invoiceItem?.id,
          item:
            invoiceItem?.itemName ??
            invoiceItem?.item?.name ??
            invoiceItem?.workbookInformation?.name ??
            invoiceItem?.educationalTerm?.name,
          quantity: invoiceItem?.quantity,
          price: invoiceItem?.price,
        }));
      })
      .flat(1)
      ?.filter(notEmpty) ?? [];

  const preLoading = usePreLoading(loading);

  return preLoading ? (
    <div className="shimmer-animation bg-slate-300 min-h-32 min-w-xs rounded-md focus:outline-none" />
  ) : (
    <div className="max-w-[800px] min-w-xs overflow-x-auto border rounded border-outline-light focus:outline-none">
      <Table aria-label="Student items" className={"focus:outline-none w-full"}>
        <TableHeader className={"bg-[#DAD6D7]"}>
          <Column
            className={
              "px-4 py-3 text-base font-normal text-secondary-text text-left"
            }
          >
            Quantities
          </Column>
          <Column
            isRowHeader
            className={
              "px-4 py-3 text-base font-normal text-secondary-text text-left"
            }
          >
            Items
          </Column>
        </TableHeader>
        <TableBody
          items={items}
          renderEmptyState={() => (
            <div className="w-full min-h-[100px] grid place-items-center text-primary-text/40 bg-[#E1DBDB] rounded-b">
              No records found...
            </div>
          )}
        >
          {({ item, quantity }) => {
            return (
              <Row className={"bg-[#E1DBDB]"}>
                <Cell className={"px-4 py-3"}>{quantity ?? "-"}</Cell>
                <Cell className={"px-4 py-3"}>{item ?? "-"}</Cell>
              </Row>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
};

const SalesItemAccordion: FC<Props> = ({
  invoiceId,
  isMasterFranchisee,
  fromHQOrWithFranchisee,
}) => {
  return (
    <DialogTrigger>
      <Button
        className={({ isFocusVisible }) =>
          combineClassName(
            "w-12 h-12 flex justify-center items-center rounded-full border-transparent hover:bg-action-hover focus:outline-none",
            isFocusVisible ? "bg-action-hover" : ""
          )
        }
      >
        <ArrowDownIcon className="text-action-active focus:outline-none" />
      </Button>
      <Popover placement="bottom end">
        <Dialog className="focus:outline-none">
          <Content
            invoiceId={invoiceId}
            isMasterFranchisee={isMasterFranchisee}
            fromHQOrWithFranchisee={fromHQOrWithFranchisee}
          />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

export default SalesItemAccordion;
