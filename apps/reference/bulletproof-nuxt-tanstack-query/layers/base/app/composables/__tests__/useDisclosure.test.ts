import { expect, test } from "vitest";
import { useDisclosure } from "../useDisclosure";

test("should open the state", () => {
  const { isOpen, open } = useDisclosure();

  expect(isOpen.value).toBe(false);

  open();

  expect(isOpen.value).toBe(true);
});

test("should close the state", () => {
  const { isOpen, close } = useDisclosure();

  expect(isOpen.value).toBe(false);

  close();

  expect(isOpen.value).toBe(false);
});

test("should toggle the state", () => {
  const { isOpen, toggle } = useDisclosure();

  expect(isOpen.value).toBe(false);

  toggle();

  expect(isOpen.value).toBe(true);

  toggle();

  expect(isOpen.value).toBe(false);
});

test("should define initial state", () => {
  const { isOpen, toggle } = useDisclosure(true);

  expect(isOpen.value).toBe(true);

  toggle();

  expect(isOpen.value).toBe(false);
});
