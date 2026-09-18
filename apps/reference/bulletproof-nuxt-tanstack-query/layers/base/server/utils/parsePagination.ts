interface PaginationQuery {
  page?: unknown;
  limit?: unknown;
}

export function parsePagination(query: PaginationQuery) {
  const parse = (value: unknown, fallback: number, maximum = Number.MAX_SAFE_INTEGER) => {
    if (value === undefined) return fallback;

    const parsed = typeof value === "string" && /^[1-9][0-9]*$/.test(value)
      ? Number(value)
      : Number.NaN;
    if (!Number.isSafeInteger(parsed) || parsed > maximum) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid pagination parameters",
      });
    }

    return parsed;
  };

  return {
    page: parse(query.page, 1),
    limit: parse(query.limit, 10, 100),
  };
}
