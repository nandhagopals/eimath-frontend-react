import { gql } from "@apollo/client";

const NOTIFICATION_FRAGMENT = gql`
  fragment notificationFragment on Notification {
    id
    message
    isRead
    isDeleted
    createdAt
    targetUser {
      name
    }
    targetMF {
      masterFranchiseeName
    }
    targetFranchisee {
      franchiseeName
    }
  }
`;

export { NOTIFICATION_FRAGMENT };
