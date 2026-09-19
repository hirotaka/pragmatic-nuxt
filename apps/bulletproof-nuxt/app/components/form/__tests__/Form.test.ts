import { expect, expectTypeOf, test, vi } from "vitest";
import { defineComponent, h, reactive } from "vue";
import { useRegle } from "@regle/core";
import { email, required, withMessage } from "@regle/rules";
import { z } from "zod";
import Form from "../Form.vue";
import type { FormSchemaOutput, FormSubmitEvent } from "../form-types";
import FormField from "../../form-field/FormField.vue";
import { useFormSchema } from "~~/app/composables/useFormSchema";
import { renderComponent, screen, userEvent, waitFor } from "~~/test/test-utils";

type EmailState = { email: string };

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

const CustomValidateForm = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: (values: EmailState) => void }) {
    const state = reactive({ email: "" });

    return () =>
      h(
        Form,
        {
          state,
          validate: (values: unknown) => {
            if (!(values as EmailState).email.includes("@")) {
              return [{ name: "email", message: "Enter a valid email address." }];
            }
            return [];
          },
          onSubmit: (event: FormSubmitEvent) => props.onSubmit(event.data as EmailState),
        },
        {
          default: () => [
            h(
              FormField,
              { label: "Email", name: "email", description: "Use your work email." },
              {
                default: (field: Record<string, unknown>) => h("input", {
                  ...field,
                  value: state.email,
                  onInput: (event: Event) => {
                    state.email = (event.target as HTMLInputElement).value;
                  },
                }),
              },
            ),
            h("button", { type: "submit" }, "Submit"),
          ],
        },
      );
  },
});

const RegleForm = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: (values: EmailState) => void }) {
    const { r$ } = useRegle({ email: "" }, {
      email: {
        required: withMessage(required, "Email is required."),
        email: withMessage(email, "Enter a valid email address."),
      },
    });

    return () =>
      h(
        Form,
        {
          schema: r$,
          state: r$.$value,
          onSubmit: (event: FormSubmitEvent) => props.onSubmit(event.data as EmailState),
        },
        {
          default: () => [
            h(
              FormField,
              { label: "Email", name: "email" },
              {
                default: (field: Record<string, unknown>) => h("input", {
                  ...field,
                  value: r$.$value.email,
                  onInput: (event: Event) => {
                    r$.$value.email = (event.target as HTMLInputElement).value;
                  },
                }),
              },
            ),
            h("button", { type: "submit" }, "Submit"),
          ],
        },
      );
  },
});

const LazyRegleSchemaForm = defineComponent({
  setup() {
    const { r$ } = useFormSchema(
      { firstName: "", lastName: "" },
      z.object({
        firstName: z.string().min(3, "First name must have at least 3 characters."),
        lastName: z.string().min(1, "Last name is required."),
      }),
    );

    const field = (name: "firstName" | "lastName", label: string) =>
      h(
        FormField,
        { label, name },
        {
          default: (attributes: Record<string, unknown>) => h("input", {
            ...attributes,
            value: r$.$value[name],
            onInput: (event: Event) => {
              r$.$value[name] = (event.target as HTMLInputElement).value;
            },
          }),
        },
      );

    return () =>
      h(
        Form,
        { schema: r$, state: r$.$value },
        {
          default: () => [
            field("firstName", "First Name"),
            field("lastName", "Last Name"),
            h("button", { type: "submit" }, "Submit"),
          ],
        },
      );
  },
});

const TransformedRegleForm = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: (values: { name: number }) => void }) {
    const schema = z.object({
      name: z.string().transform(value => value.trim().length),
    });
    const { r$ } = useFormSchema({ name: "" }, schema);

    expectTypeOf<FormSchemaOutput<typeof schema>>().toEqualTypeOf<{ name: number }>();
    expectTypeOf<FormSchemaOutput<typeof r$>>().toEqualTypeOf<{ name: number }>();

    return () =>
      h(
        Form,
        {
          schema: r$,
          state: r$.$value,
          onSubmit: (event: FormSubmitEvent) => props.onSubmit(event.data as FormSchemaOutput<typeof r$>),
        },
        {
          default: () => [
            h("label", { for: "name" }, "Name"),
            h("input", {
              id: "name",
              value: r$.$value.name,
              onInput: (event: Event) => {
                r$.$value.name = (event.target as HTMLInputElement).value;
              },
            }),
            h("button", { type: "submit" }, "Submit"),
          ],
        },
      );
  },
});

const ExternalSubmitForm = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: (values: EmailState) => void }) {
    const state = reactive({ email: "" });

    return () =>
      h("div", [
        h(
          Form,
          {
            id: "external-submit-form",
            state,
            validate: (values: unknown) => {
              if (!(values as EmailState).email.includes("@")) {
                return [{ name: "email", message: "Enter a valid email address." }];
              }
              return [];
            },
            onSubmit: (event: FormSubmitEvent) => props.onSubmit(event.data as EmailState),
          },
          {
            default: () => h(
              FormField,
              { label: "Email", name: "email" },
              {
                default: (field: Record<string, unknown>) => h("input", {
                  ...field,
                  value: state.email,
                  onInput: (event: Event) => {
                    state.email = (event.target as HTMLInputElement).value;
                  },
                }),
              },
            ),
          },
        ),
        h("button", { type: "submit", form: "external-submit-form" }, "Submit outside"),
      ]);
  },
});

test("Stackhacker Form validates app-owned state", async () => {
  const handleSubmit = vi.fn();

  await renderComponent(CustomValidateForm, {
    props: { onSubmit: handleSubmit },
  });

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/enter a valid email address/i);
  expect(handleSubmit).toHaveBeenCalledTimes(0);

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith({ email: "user@example.com" }));
});

test("Stackhacker Form owns async submission loading and duplicate-submit prevention", async () => {
  const settlement = deferred();
  const handleSubmit = vi.fn(() => settlement.promise);

  await renderComponent(CustomValidateForm, {
    props: { onSubmit: handleSubmit },
  });

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(handleSubmit).toHaveBeenCalledOnce());
  expect(screen.getByLabelText(/email/i).hasAttribute("disabled")).toBe(true);

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));
  expect(handleSubmit).toHaveBeenCalledOnce();

  settlement.resolve();
  await waitFor(() => expect(screen.getByLabelText(/email/i).hasAttribute("disabled")).toBe(false));
});

test("Stackhacker Form supports app-owned Regle schema", async () => {
  const handleSubmit = vi.fn();

  await renderComponent(RegleForm, {
    props: { onSubmit: handleSubmit },
  });

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/email is required/i);
  expect(handleSubmit).toHaveBeenCalledTimes(0);

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith({ email: "user@example.com" }));
});

test("Stackhacker Form validates lazily and updates a revealed field while typing", async () => {
  await renderComponent(LazyRegleSchemaForm);

  const firstName = screen.getByLabelText(/first name/i);
  await userEvent.type(firstName, "A");

  expect(screen.queryByText(/first name must have at least 3 characters/i)).toBeNull();
  expect(screen.queryByText(/last name is required/i)).toBeNull();

  await userEvent.tab();

  await screen.findByText(/first name must have at least 3 characters/i);
  expect(screen.queryByText(/last name is required/i)).toBeNull();

  await userEvent.type(firstName, "da");

  await waitFor(() => expect(screen.queryByText(/first name must have at least 3 characters/i)).toBeNull());

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/last name is required/i);
});

test("Stackhacker Form submits the parsed Regle schema output", async () => {
  const handleSubmit = vi.fn();

  await renderComponent(TransformedRegleForm, {
    props: { onSubmit: handleSubmit },
  });

  await userEvent.type(screen.getByLabelText(/name/i), "  Example  ");
  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith({ name: 7 }));
  expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe("  Example  ");
});

test("Stackhacker Form supports native external submit buttons", async () => {
  const handleSubmit = vi.fn();

  await renderComponent(ExternalSubmitForm, {
    props: { onSubmit: handleSubmit },
  });

  await userEvent.click(screen.getByRole("button", { name: /submit outside/i }));

  await screen.findByText(/enter a valid email address/i);
  expect(handleSubmit).toHaveBeenCalledTimes(0);

  await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
  await userEvent.click(screen.getByRole("button", { name: /submit outside/i }));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith({ email: "user@example.com" }));
});
