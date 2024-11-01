import { z } from "zod";

import {
  CursorPaginationArgs,
  CursorPaginationReturnType,
  FilterInteger,
  Nullish,
  User,
} from "global/types";

import { notificationStatusSchema } from "modules/Notification";
import { MasterFranchiseeInformation } from "modules/MasterFranchisee";
import { Franchisee } from "modules/Franchisee";

type NotificationStatus = z.infer<typeof notificationStatusSchema>;

type Notification = Nullish<{
  id: number;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  targetUser: User;
  targetMF: MasterFranchiseeInformation;
  targetFranchisee: Franchisee;
}>;

type NotificationFilterInput = Nullish<{
  id: FilterInteger;
  isRead: boolean;
  isDeleted: boolean;
}>;

type FilterNotificationsResponse = Nullish<{
  filterNotifications: CursorPaginationReturnType<Notification>;
}>;

type FilterNotificationsArgs = CursorPaginationArgs<NotificationFilterInput>;

type UpdateNotificationResponse = Nullish<{
  updateNotification: Notification;
}>;

interface UpdateNotificationArgs {
  id: number[];
  isRead: boolean;
}

type DeleteNotificationResponse = Nullish<{
  deleteNotification: string;
}>;

interface DeleteNotificationArgs {
  ids: number[];
}

export type {
  Notification,
  NotificationFilterInput,
  FilterNotificationsResponse,
  FilterNotificationsArgs,
  UpdateNotificationResponse,
  UpdateNotificationArgs,
  NotificationStatus,
  DeleteNotificationResponse,
  DeleteNotificationArgs,
};
