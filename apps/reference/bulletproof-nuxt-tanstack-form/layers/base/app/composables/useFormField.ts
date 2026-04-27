import { computed, inject, onMounted, type Ref } from "vue";

// TanStack Form internal types
interface FieldMetaEntry {
  errors?: unknown[];
}

interface ErrorMapEntry {
  onBlur?: Record<string, unknown>;
  onSubmit?: Record<string, unknown>;
}

// Form state interface
interface FormState {
  errors: unknown[];
  errorMap: ErrorMapEntry;
  fieldMeta: Record<string, FieldMetaEntry>;
  values: Record<string, unknown>;
  isSubmitting: boolean;
}

// Form context interface
interface FormContext {
  setFieldValue: (name: string, value: unknown) => void;
  getFieldValue: (name: string) => unknown;
  validateFieldOnBlur: (fieldName: string) => void;
  blurErrors: Ref<Record<string, string>>;
  submitErrors: Ref<Record<string, string>>;
  state: Ref<FormState>;
}

// Helper to extract first error message from any error format
const extractErrorMessage = (errorValue: unknown): string | undefined => {
  if (typeof errorValue === "string") return errorValue;

  if (typeof errorValue === "object" && errorValue !== null) {
    if (
      "message" in errorValue
      && typeof (errorValue as { message: unknown }).message === "string"
    ) {
      return (errorValue as { message: string }).message;
    }
    if (Array.isArray(errorValue) && errorValue.length > 0) {
      return extractErrorMessage(errorValue[0]);
    }
  }

  return undefined;
};

/**
 * Composable for form field integration with TanStack Form.
 * Similar to VeeValidate's `useField`.
 *
 * @typeParam T - The type of the field value. Defaults to `string`.
 * @param name - The field name or a function that returns the field name (for dynamic fields).
 * @returns An object containing:
 *   - `value` - Computed ref for getting/setting the field value
 *   - `errorMessage` - Computed ref containing the validation error message
 *   - `handleBlur` - Function to trigger blur validation
 *   - `form` - The injected form context
 *
 * @example
 * ```vue
 * <script setup>
 * const { value, errorMessage, handleBlur } = useFormField<string>('email');
 * </script>
 *
 * <template>
 *   <input v-model="value" @blur="handleBlur" />
 *   <span v-if="errorMessage">{{ errorMessage }}</span>
 * </template>
 * ```
 */
export function useFormField<T = string>(name: string | (() => string)) {
  const form = inject<FormContext>("tanstack-form");

  const fieldName = computed(() =>
    typeof name === "function" ? name() : name,
  );

  // Derived refs
  const formState = computed(() => form?.state.value);
  const blurErrors = computed(() => form?.blurErrors.value ?? {});
  const submitErrors = computed(() => form?.submitErrors.value ?? {});

  // Get field error
  const errorMessage = computed(() => {
    const currentName = fieldName.value;

    // Check submitErrors first
    if (submitErrors.value[currentName]) {
      return submitErrors.value[currentName];
    }

    // Check blurErrors
    if (blurErrors.value[currentName]) {
      return blurErrors.value[currentName];
    }

    const state = formState.value;
    if (!state) return undefined;

    // Check TanStack Form native errors
    const fieldMeta = state.fieldMeta[currentName];
    if (fieldMeta?.errors?.length) {
      const error = extractErrorMessage(fieldMeta.errors[0]);
      if (error) return error;
    }

    const onBlurErrors = state.errorMap.onBlur;
    if (onBlurErrors && currentName in onBlurErrors) {
      const error = extractErrorMessage(onBlurErrors[currentName]);
      if (error) return error;
    }

    const onSubmitErrors = state.errorMap.onSubmit;
    if (onSubmitErrors && currentName in onSubmitErrors) {
      const error = extractErrorMessage(onSubmitErrors[currentName]);
      if (error) return error;
    }

    if (Array.isArray(state.errors)) {
      for (const errorObj of state.errors) {
        if (
          typeof errorObj === "object"
          && errorObj !== null
          && currentName in errorObj
        ) {
          const error = extractErrorMessage(
            (errorObj as Record<string, unknown>)[currentName],
          );
          if (error) return error;
        }
      }
    }

    return undefined;
  });

  // Get/set field value
  const value = computed({
    get: () => {
      const values = formState.value?.values;
      if (values && fieldName.value in values) {
        return (values[fieldName.value] as T) ?? ("" as T);
      }
      return "" as T;
    },
    set: (newValue: T) => form?.setFieldValue(fieldName.value, newValue),
  });

  // Handle blur event
  const handleBlur = () => {
    form?.validateFieldOnBlur(fieldName.value);
  };

  // Initialize field value
  onMounted(() => {
    if (form && form.getFieldValue(fieldName.value) === undefined) {
      form.setFieldValue(fieldName.value, "");
    }
  });

  return {
    value,
    errorMessage,
    handleBlur,
    form,
  };
}
