import { expect, test, vi } from "vitest";
import { defineComponent, h, reactive } from "vue";
import { useRegle } from "@regle/core";
import { email, required, withMessage } from "@regle/rules";
import Form from "../Form.vue";
import type { FormSubmitEvent } from "../form-types";
import FormField from "../../form-field/FormField.vue";
import { renderComponent, screen, userEvent, waitFor } from "~~/test/test-utils";

type EmailState = { email: string };

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
