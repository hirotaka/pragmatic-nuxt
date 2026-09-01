import type { Ref } from "vue";

export interface FormError {
  name: string;
  message: string;
  id?: string;
  [key: string]: unknown;
}

export interface FormSubmitEvent<TState = unknown> {
  originalEvent: SubmitEvent;
  data: TState;
}

export interface FormErrorEvent<TState = unknown> {
  originalEvent?: Event;
  errors: FormError[];
  data: TState;
}

export type FormInputEvent = "input" | "change" | "blur";

export type FormValidate<TState = unknown> = (state: TState) => FormError[] | Promise<FormError[]>;

export interface FormContextValue<TState = unknown> {
  errors: Ref<FormError[]>;
  disabled: Ref<boolean>;
  getFieldErrors: (name?: string, errorPattern?: RegExp) => FormError[];
  validate: (event?: Event) => Promise<FormError[]>;
  state: Ref<TState | undefined>;
}
