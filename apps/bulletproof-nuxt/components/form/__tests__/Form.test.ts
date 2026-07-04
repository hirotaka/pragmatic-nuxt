import { expect, test, vi } from "vitest";
import { defineComponent, h, reactive } from "vue";
import { useRegle } from "@regle/core";
import { email, required, withMessage } from "@regle/rules";
import Form from "../Form.vue";
import FormField from "../../form-field/FormField.vue";
import { renderComponent, screen, userEvent, waitFor } from "~~/test/test-utils";

const CustomValidateForm = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: (values: { email: string }) => void }) {
    const state = reactive({ email: "" });

    return () =>
      h(
        Form,
        {
          state,
          validate: (values: { email: string }) => {
            if (!values.email.includes("@")) {
              return [{ name: "email", message: "Enter a valid email address." }];
            }
            return [];
          },
          onSubmit: (event: { data: { email: string } }) => props.onSubmit(event.data),
        },
        {
          default: () => [
            h(
              FormField,
              { label: "Email", name: "email", description: "Use your work email." },
              {
                default: field => h("input", {
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
  setup(props: { onSubmit: (values: { email: string }) => void }) {
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
          onSubmit: (event: { data: { email: string } }) => props.onSubmit(event.data),
        },
        {
          default: () => [
            h(
              FormField,
              { label: "Email", name: "email" },
              {
                default: field => h("input", {
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
  setup(props: { onSubmit: (values: { email: string }) => void }) {
    const state = reactive({ email: "" });

    return () =>
      h("div", [
        h(
          Form,
          {
            id: "external-submit-form",
            state,
            validate: (values: { email: string }) => {
              if (!values.email.includes("@")) {
                return [{ name: "email", message: "Enter a valid email address." }];
              }
              return [];
            },
            onSubmit: (event: { data: { email: string } }) => props.onSubmit(event.data),
          },
          {
            default: () => h(
              FormField,
              { label: "Email", name: "email" },
              {
                default: field => h("input", {
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

const DescribedFieldForm = defineComponent({
  setup() {
    const state = reactive({ email: "" });

    return () =>
      h(
        Form,
        {
          state,
          validate: () => [{ name: "email", message: "Email is required." }],
        },
        {
          default: () => [
            h(
              FormField,
              {
                label: "Email",
                name: "email",
                description: "Use your work email.",
                help: "This is visible until validation fails.",
              },
              {
                default: field => h("input", {
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

test("Stackhacker FormField wires description, help, and error descriptions", async () => {
  await renderComponent(DescribedFieldForm);

  const input = screen.getByLabelText(/email/i);
  const initialDescriptionIds = input.getAttribute("aria-describedby")?.split(" ") ?? [];
  expect(initialDescriptionIds).toHaveLength(2);
  expect(document.getElementById(initialDescriptionIds[0])?.textContent).toContain("Use your work email.");
  expect(document.getElementById(initialDescriptionIds[1])?.textContent).toContain("This is visible until validation fails.");

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/email is required/i);
  const errorDescriptionIds = input.getAttribute("aria-describedby")?.split(" ") ?? [];
  expect(errorDescriptionIds).toHaveLength(2);
  expect(document.getElementById(errorDescriptionIds[0])?.textContent).toContain("Use your work email.");
  expect(document.getElementById(errorDescriptionIds[1])?.textContent).toContain("Email is required.");
  expect(document.getElementById(errorDescriptionIds[1])?.textContent).not.toContain("This is visible until validation fails.");
});
