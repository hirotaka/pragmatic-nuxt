import dayjs from "dayjs";
import type { ConfigType } from "dayjs";

export const formatDate = (date: ConfigType) =>
  dayjs(date).format("MMMM D, YYYY h:mm A");
