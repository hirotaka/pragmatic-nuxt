const { useRegleSchema } = defineRegleSchemaConfig({
  modifiers: {
    autoDirty: false,
  },
});

export const useFormSchema = useRegleSchema;
