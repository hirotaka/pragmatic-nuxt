import type { InjectionKey } from "vue";
import type { FormContextValue, FormError, FormValidationResult } from "./form-types";

export const FORM_CONTEXT_KEY: InjectionKey<FormContextValue> = Symbol("stackhacker-ui-form-context");

interface MessageLike {
  message?: unknown;
  $message?: unknown;
  name?: unknown;
  path?: unknown;
  id?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pathToName(path: unknown) {
  if (Array.isArray(path)) return path.join(".");
  return typeof path === "string" ? path : undefined;
}

function messageFrom(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return undefined;

  const item = value as MessageLike;
  if (typeof item.message === "string") return item.message;
  if (typeof item.$message === "string") return item.$message;
  return undefined;
}

function nameFrom(value: unknown, fallback?: string) {
  if (!isRecord(value)) return fallback;

  const item = value as MessageLike;
  if (typeof item.name === "string") return item.name;
  return pathToName(item.path) ?? fallback;
}

function normalizeErrorItem(value: unknown, fallbackName?: string): FormError | null {
  const message = messageFrom(value);
  const name = nameFrom(value, fallbackName);
  if (!message || !name) return null;

  const id = isRecord(value) && typeof value.id === "string" ? value.id : undefined;
  return { name, message, ...(id ? { id } : {}) };
}

function collectErrorTree(value: unknown, prefix = ""): FormError[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map(error => normalizeErrorItem(error, prefix))
      .filter((error): error is FormError => Boolean(error));
  }

  const direct = normalizeErrorItem(value, prefix || undefined);
  if (direct) return [direct];

  if (!isRecord(value)) return [];

  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return collectErrorTree(child, path);
  });
}

export function normalizeFormErrors(value: unknown): FormError[] {
  return collectErrorTree(value);
}

export function findFormErrors(errors: FormError[], name?: string, errorPattern?: RegExp) {
  if (!name && !errorPattern) return [];

  return errors.filter((error) => {
    if (name && error.name === name) return true;
    return errorPattern ? errorPattern.test(error.name) : false;
  });
}

export function getSchemaErrors(schema: unknown): FormError[] | undefined {
  if (!isRecord(schema) || typeof schema.$validate !== "function") return undefined;
  return normalizeFormErrors(schema.$errors);
}

export function touchSchemaField(schema: unknown, name: string): boolean {
  if (!isRecord(schema) || typeof schema.$validate !== "function") return false;

  let status: unknown = schema;
  for (const segment of name.split(".")) {
    if (!isRecord(status)) return false;
    const fields = isRecord(status.$fields) ? status.$fields : status;
    status = fields[segment];
  }

  if (!isRecord(status) || typeof status.$touch !== "function") return false;
  status.$touch();
  return true;
}

export async function validateWithSchema<TData = unknown>(
  schema: unknown,
  state: unknown,
): Promise<FormValidationResult<TData>> {
  if (!schema) return { data: state as TData, errors: [] };

  if (isRecord(schema) && typeof schema.$validate === "function") {
    const result = await schema.$validate();
    if (isRecord(result) && result.valid === true) {
      return { data: result.data as TData, errors: [] };
    }

    const validationErrors = isRecord(result) ? result.errors : schema.$errors;
    return { errors: normalizeFormErrors(validationErrors) };
  }

  if (isRecord(schema) && isRecord(schema["~standard"])) {
    const standard = schema["~standard"];
    if (typeof standard.validate === "function") {
      const result = await standard.validate(state);
      if (isRecord(result) && Array.isArray(result.issues)) {
        return { errors: normalizeFormErrors(result.issues) };
      }
      return {
        data: isRecord(result) ? result.value as TData : state as TData,
        errors: [],
      };
    }
  }

  if (isRecord(schema) && typeof schema.safeParse === "function") {
    const result = await schema.safeParse(state);
    if (isRecord(result) && result.success === false && isRecord(result.error)) {
      return { errors: normalizeFormErrors(result.error.issues) };
    }
    return {
      data: isRecord(result) ? result.data as TData : state as TData,
      errors: [],
    };
  }

  if (isRecord(schema) && typeof schema.parse === "function") {
    try {
      return { data: await schema.parse(state) as TData, errors: [] };
    }
    catch (error) {
      return { errors: normalizeFormErrors(isRecord(error) ? error.issues : error) };
    }
  }

  return { data: state as TData, errors: [] };
}
