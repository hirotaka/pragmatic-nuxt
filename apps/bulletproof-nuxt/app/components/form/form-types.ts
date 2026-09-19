import type { Ref } from "vue";

export interface FormError {
  name: string;
  message: string;
  id?: string;
  [key: string]: unknown;
}

type ValidSchemaResultData<TResult> = Extract<TResult, { valid: true }> extends {
  data: infer TData;
}
  ? TData
  : never;

type StandardSchemaOutput<TSchema> = TSchema extends {
  "~standard": { types?: infer TTypes };
}
  ? NonNullable<TTypes> extends { output: infer TOutput }
    ? TOutput
    : never
  : never;

export type FormSchemaOutput<TSchema, TFallback = unknown> = TSchema extends {
  $validate: (...args: never[]) => Promise<infer TResult>;
}
  ? [ValidSchemaResultData<TResult>] extends [never]
      ? TFallback
      : ValidSchemaResultData<TResult>
  : [StandardSchemaOutput<TSchema>] extends [never]
      ? TFallback
      : StandardSchemaOutput<TSchema>;

export interface FormSubmitEvent<TData = unknown> {
  originalEvent: SubmitEvent;
  data: TData;
}

export interface FormErrorEvent<TState = unknown> {
  originalEvent?: Event;
  errors: FormError[];
  data: TState;
}

export interface FormValidationResult<TData = unknown> {
  data?: TData;
  errors: FormError[];
}

export type FormValidate<TState = unknown> = (state: TState) => FormError[] | Promise<FormError[]>;

export interface FormContextValue<TState = unknown> {
  errors: Ref<FormError[]>;
  disabled: Ref<boolean>;
  getFieldErrors: (name?: string, errorPattern?: RegExp) => FormError[];
  touchField: (name: string) => void;
  validate: (event?: Event) => Promise<FormError[]>;
  state: Ref<TState | undefined>;
}
