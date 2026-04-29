import { expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { z } from "zod";
import Form from "../Form.vue";
import Input from "../Input.vue";
import Button from "../Button.vue";
import { renderComponent, screen, userEvent, waitFor } from "~~/test/test-utils";

const testData = {
  title: "Hello World",
};

const schema = z.object({
  title: z.string({ error: "Required" }).min(1, "Required"),
});

const TestFormComponent = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: (values: Record<string, unknown>) => void }) {
    return () =>
      h(
        Form,
        {
          schema,
          id: "my-form",
          onSubmit: props.onSubmit,
        },
        {
          default: () => [
            h(Input, {
              name: "title",
              label: "Title",
            }),
            h(
              Button,
              {
                type: "submit",
                class: "w-full",
              },
              { default: () => "Submit" },
            ),
          ],
        },
      );
  },
});

test("should render and submit a basic Form component", async () => {
  const handleSubmit = vi.fn();

  await renderComponent(TestFormComponent, {
    props: {
      onSubmit: handleSubmit,
    },
  });

  await userEvent.type(screen.getByLabelText(/title/i), testData.title);

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith(testData));
});

test("should fail submission if validation fails", async () => {
  const handleSubmit = vi.fn();

  await renderComponent(TestFormComponent, {
    props: {
      onSubmit: handleSubmit,
    },
  });

  await userEvent.click(screen.getByRole("button", { name: /submit/i }));

  await screen.findByText(/required/i);

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});
