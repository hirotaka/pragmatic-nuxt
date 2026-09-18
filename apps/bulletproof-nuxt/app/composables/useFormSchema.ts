import { defineRegleSchemaConfig } from "@regle/schemas";

const { useRegleSchema } = defineRegleSchemaConfig({
  modifiers: {
    autoDirty: false,
  },
});

export const useFormSchema = useRegleSchema;
