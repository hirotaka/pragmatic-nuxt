import { expect, test } from "vitest";
import { defineComponent, h, reactive } from "vue";
import Form from "../../form/Form.vue";
import FormField from "../FormField.vue";
import { renderComponent, screen, userEvent } from "~~/test/test-utils";

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

test("Stackhacker FormField wires description, help, and error descriptions", async () => {
  await renderComponent(DescribedFieldForm);

  const input = screen.getByLabelText(/email/i);
  const initialDescriptionIds = input.getAttribute("aria-describedby")?.split(" ") ?? [];
  expect(initialDescriptionIds).toHaveLength(2);
  expect(document.getElementById(initialDescriptionIds[0]!)?.textContent).toContain("Use your work email.");
  expect(document.getElementById(initialDescriptionIds[1]!)?.textContent).toContain("This is visible until validation fails.");

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/email is required/i);
  const errorDescriptionIds = input.getAttribute("aria-describedby")?.split(" ") ?? [];
  expect(errorDescriptionIds).toHaveLength(2);
  expect(document.getElementById(errorDescriptionIds[0]!)?.textContent).toContain("Use your work email.");
  expect(document.getElementById(errorDescriptionIds[1]!)?.textContent).toContain("Email is required.");
  expect(document.getElementById(errorDescriptionIds[1]!)?.textContent).not.toContain("This is visible until validation fails.");
});
