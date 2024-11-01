import { TypedDocumentNode, gql } from "@apollo/client";

import { PAGINATION_INFO_FRAGMENT } from "global/services";

import {
  FilterNotificationsArgs,
  FilterNotificationsResponse,
  NOTIFICATION_FRAGMENT,
} from "modules/Notification";

const FILTER_NOTIFICATIONS: TypedDocumentNode<
  FilterNotificationsResponse,
  FilterNotificationsArgs
> = gql`
  ${PAGINATION_INFO_FRAGMENT}
  ${NOTIFICATION_FRAGMENT}

  query FilterNotifications(
    $filter: NotificationFilterInput
    $sortBy: sortBy
    $pagination: Pagination
  ) {
    filterNotifications: authorizedUserNotifications(
      filter: $filter
      sortBy: $sortBy
      pagination: $pagination
    ) {
      edges {
        node {
          ...notificationFragment
        }
      }
      pageInfo {
        ...paginationInfoFragment
      }
    }
  }
`;

export { FILTER_NOTIFICATIONS };
