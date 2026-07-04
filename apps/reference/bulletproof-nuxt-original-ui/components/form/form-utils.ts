import type { InjectionKey } from "vue";
import type { FormContextValue, FormError } from "./form-types";

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

export async function validateWithSchema(schema: unknown, state: unknown): Promise<FormError[]> {
  if (!schema) return [];

  if (isRecord(schema) && typeof schema.$validate === "function") {
    await schema.$validate();
    return normalizeFormErrors(schema.$errors);
  }

  if (isRecord(schema) && isRecord(schema["~standard"])) {
    const standard = schema["~standard"];
    if (typeof standard.validate === "function") {
      const result = await standard.validate(state);
      if (isRecord(result) && Array.isArray(result.issues)) {
        return normalizeFormErrors(result.issues);
      }
      return [];
    }
  }

  if (isRecord(schema) && typeof schema.safeParse === "function") {
    const result = await schema.safeParse(state);
    if (isRecord(result) && result.success === false && isRecord(result.error)) {
      return normalizeFormErrors(result.error.issues);
    }
    return [];
  }

  if (isRecord(schema) && typeof schema.parse === "function") {
    try {
      await schema.parse(state);
      return [];
    }
    catch (error) {
      return normalizeFormErrors(isRecord(error) ? error.issues : error);
    }
  }

  return [];
}
