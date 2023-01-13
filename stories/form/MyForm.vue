<script setup lang="ts">
import FormWrapper from "@/components/form/FormWrapper.vue";
import FormInputField from "@/components/form/FormInputField.vue";
import FormTextareaField from "@/components/form/FormTextareaField.vue";
import FormSelectField from "@/components/form/FormSelectField.vue";
import BaseButton from "@/components/base/BaseButton.vue";

const options = ["A", "B", "C"].map((option) => ({
  label: option,
  value: option,
}));

const submit = (values) => {
  alert(JSON.stringify(values, null, 2));
};

interface FormProps {
  hiddenSubmit?: boolean;
}

defineProps<FormProps>();
</script>

<template>
  <FormWrapper id="my-form" @submit="submit">
    <FormInputField name="title" label="Title" type="text" />
    <FormTextareaField name="description" label="Description" />
    <FormSelectField name="team" label="Team" :options="options" />
    <div v-if="!hiddenSubmit">
      <BaseButton type="submit" class="w-full">Submit</BaseButton>
    </div>
  </FormWrapper>
</template>
