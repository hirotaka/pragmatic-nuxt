import { ref } from "vue";

export const useDisclosure = (initial = false) => {
  const isOpen = ref(initial);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return { isOpen, open, close, toggle };
};
