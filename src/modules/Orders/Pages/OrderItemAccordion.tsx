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
import { combineClassName } from "global/helpers";

import { Order } from "modules/Orders";

interface Props {
  orderItems: NonNullable<Order["orderItems"]>;
}

const Content: FC<Props> = ({ orderItems }) => {
  const items = orderItems?.map((orderItem) => ({
    id: orderItem?.id,
    quantity: orderItem?.quantity,
    item:
      orderItem?.itemName ??
      orderItem?.item?.name ??
      orderItem?.workbookInformation?.name ??
      orderItem?.educationalTerm?.name,
  }));

  return (
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

const OrderItemAccordion: FC<Props> = ({ orderItems }) => {
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
          <Content orderItems={orderItems} />
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
};

export default OrderItemAccordion;
