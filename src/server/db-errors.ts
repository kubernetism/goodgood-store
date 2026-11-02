/** Postgres error details, looked up through wrapper errors (Drizzle wraps driver errors in `cause`). */
function findPgError(error: unknown): { code?: string; constraint?: string } | null {
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth++) {
    if (typeof current === "object" && "code" in current && typeof current.code === "string") {
      return current as { code?: string; constraint?: string };
    }
    current = typeof current === "object" && "cause" in current ? current.cause : null;
  }
  return null;
}

/** 23514: check_violation (optionally of a specific constraint). */
export function isCheckViolation(error: unknown, constraint?: string): boolean {
  const pg = findPgError(error);
  return pg?.code === "23514" && (!constraint || pg.constraint === constraint);
}

/** 23505: unique_violation (optionally of a specific constraint/index). */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  const pg = findPgError(error);
  return pg?.code === "23505" && (!constraint || pg.constraint === constraint);
}

/** 23503: foreign_key_violation. */
export function isForeignKeyViolation(error: unknown): boolean {
  return findPgError(error)?.code === "23503";
}

/** 42P01: undefined_table (e.g. a migration that has not been applied yet). */
export function isUndefinedTable(error: unknown): boolean {
  return findPgError(error)?.code === "42P01";
}

/** 42703: undefined_column (e.g. a column whose migration has not been applied yet). */
export function isUndefinedColumn(error: unknown): boolean {
  return findPgError(error)?.code === "42703";
}
