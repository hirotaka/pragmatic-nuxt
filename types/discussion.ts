import type { BaseEntity } from "./base";

export type Discussion = {
  title: string;
  body: string;
  teamId: string;
} & BaseEntity;
