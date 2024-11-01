import { TypedDocumentNode, gql } from "@apollo/client";

import {
  DeleteNotificationArgs,
  DeleteNotificationResponse,
  UpdateNotificationArgs,
  UpdateNotificationResponse,
} from "modules/Notification";

const UPDATE_NOTIFICATION: TypedDocumentNode<
  UpdateNotificationResponse,
  UpdateNotificationArgs
> = gql`
  mutation UpdateNotification($id: [Int]!, $isRead: Boolean!) {
    updateNotification: updateNotificationStatus(id: $id, isRead: $isRead) {
      id
      isRead
    }
  }
`;

const DELETE_NOTIFICATION: TypedDocumentNode<
  DeleteNotificationResponse,
  DeleteNotificationArgs
> = gql`
  mutation DeleteNotification($ids: [Int!]!) {
    deleteNotification(ids: $ids)
  }
`;

export { UPDATE_NOTIFICATION, DELETE_NOTIFICATION };
