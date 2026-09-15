import { PrismaClient, $Enums } from "@prisma/client";

export const Role = $Enums.Role;
export type Role = $Enums.Role;

export const MeetingType = $Enums.MeetingType;
export type MeetingType = $Enums.MeetingType;

export const IssueCategory = $Enums.IssueCategory;
export type IssueCategory = $Enums.IssueCategory;

export const Severity = $Enums.Severity;
export type Severity = $Enums.Severity;

export const IssueStatus = $Enums.IssueStatus;
export type IssueStatus = $Enums.IssueStatus;

export const ActionType = $Enums.ActionType;
export type ActionType = $Enums.ActionType;

export const ActionStatus = $Enums.ActionStatus;
export type ActionStatus = $Enums.ActionStatus;

export const RiskLevel = $Enums.RiskLevel;
export type RiskLevel = $Enums.RiskLevel;

export const PlacementStatus = $Enums.PlacementStatus;
export type PlacementStatus = $Enums.PlacementStatus;

export const FeeStatus = $Enums.FeeStatus;
export type FeeStatus = $Enums.FeeStatus;

export const InternshipStatus = $Enums.InternshipStatus;
export type InternshipStatus = $Enums.InternshipStatus;

export const NotificationType = $Enums.NotificationType;
export type NotificationType = $Enums.NotificationType;

// Safe initialization of Prisma client
const dbUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient(
  dbUrl
    ? {
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      }
    : undefined
);

export * from "@prisma/client";


