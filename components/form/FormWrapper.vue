<script setup lang="ts">
import { Form } from "vee-validate";
import type { ZodType } from "zod";

type FormProps = {
  id?: string;
  validationScheme?: ZodType;
};

defineProps<FormProps>();
</script>

<template>
  <Form :id="id" class="space-y-6" :validation-schema="validationScheme">
    <slot></slot>
  </Form>
</template>
