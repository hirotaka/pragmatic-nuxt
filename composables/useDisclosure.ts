import { ref } from "vue";

export function useDisclosure(initial = false) {
  const isOpen = ref(initial);

  function setIsOpen(value) {
    isOpen.value = value;
  }

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function toggle() {
    setIsOpen(!isOpen.value);
  }

  return { isOpen, open, close, toggle };
}
