<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useMutation } from "@pinia/colada";
import { useRegleSchema } from "@regle/schemas";
import { Form, type FormSubmitEvent } from "~~/app/components/form";
import { FormField } from "~~/app/components/form-field";
import { Badge } from "~~/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~~/app/components/ui/card";
import { Input } from "~~/app/components/ui/input";
import { NativeSelect } from "~~/app/components/ui/select";
import { Button } from "~~/app/components/ui/button";
import { registerMutation } from "~auth/app/queries/auth";
import { useRoute } from "vue-router";
import { registerInputSchema, type RegisterInput } from "~auth/shared/schemas";
import type { Team } from "~teams/shared/types";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamId: string | null;
  teamName: string | null;
};

type RegisterRegle = {
  $value: RegisterFormState;
} & Record<string, unknown>;

interface RegisterFormProps {
  teams?: Team[];
}

const props = defineProps<RegisterFormProps>();

const emit = defineEmits<{
  success: [];
}>();

const chooseTeam = ref(false);

const route = useRoute();
const redirectTo = route.query.redirectTo as string | undefined;

const { isLoading, mutateAsync } = useMutation(registerMutation());
const { addNotification } = useNotifications();

const state = reactive<RegisterFormState>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  teamId: null,
  teamName: "",
});
const { r$: registerRegle } = useRegleSchema(
  state as never,
  registerInputSchema as never,
);
const r$ = registerRegle as unknown as RegisterRegle;

watch(chooseTeam, (nextChooseTeam) => {
  if (nextChooseTeam) {
    r$.$value.teamName = null;
    r$.$value.teamId = "";
  }
  else {
    r$.$value.teamId = null;
    r$.$value.teamName = "";
  }
});

const handleSubmit = async (event: FormSubmitEvent<RegisterFormState | undefined>): Promise<void> => {
  if (isLoading.value) return;

  const values = event.data ?? state;
  const input = {
    ...values,
    teamId: chooseTeam.value && values.teamId ? values.teamId : null,
    teamName: !chooseTeam.value && values.teamName ? values.teamName : null,
  } as RegisterInput;

  try {
    await mutateAsync(input);
    addNotification({
      type: "success",
      title: "Account Created",
    });
    emit("success");
  }
  catch {
    return;
  }
};

const teamOptions = computed(
  () =>
    props.teams?.map(team => ({
      label: team.name,
      value: team.id,
    })) ?? [],
);
</script>

<template>
  <Card>
    <CardHeader class="px-5 py-4 text-center">
      <div class="flex justify-center">
        <Badge variant="secondary">
          Demo workspace
        </Badge>
      </div>
      <CardTitle class="text-xl">
        Create your account
      </CardTitle>
      <CardDescription>
        Start a new team or join an existing one. Demo data is periodically cleared.
      </CardDescription>
    </CardHeader>
    <CardContent class="px-5 pb-4">
      <Form
        :schema="r$"
        :state="r$.$value"
        class="space-y-3"
        @submit="handleSubmit"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <FormField
            v-slot="field"
            name="firstName"
            label="First Name"
          >
            <Input
              v-model="r$.$value.firstName"
              v-bind="field"
            />
          </FormField>
          <FormField
            v-slot="field"
            name="lastName"
            label="Last Name"
          >
            <Input
              v-model="r$.$value.lastName"
              v-bind="field"
            />
          </FormField>
        </div>
        <FormField
          v-slot="field"
          name="email"
          label="Email Address"
        >
          <Input
            v-model="r$.$value.email"
            v-bind="field"
            type="email"
          />
        </FormField>
        <FormField
          v-slot="field"
          name="password"
          label="Password"
        >
          <Input
            v-model="r$.$value.password"
            v-bind="field"
            type="password"
          />
        </FormField>

        <div
          v-if="teamOptions.length > 0"
          class="rounded-lg border bg-muted/40 p-2"
        >
          <div class="flex items-start space-x-3">
            <input
              id="choose-team"
              v-model="chooseTeam"
              type="checkbox"
              aria-label="Join existing team"
              class="mt-1 size-4 rounded border-input"
            >
            <div class="grid gap-1.5 leading-none">
              <label
                for="choose-team"
                class="text-sm font-medium leading-none"
              >
                Join an existing team
              </label>
              <p class="text-sm text-muted-foreground">
                Leave this off to create a new team for your workspace.
              </p>
            </div>
          </div>
        </div>

        <FormField
          v-if="chooseTeam"
          v-slot="field"
          name="teamId"
          label="Team"
        >
          <NativeSelect
            v-model="r$.$value.teamId"
            v-bind="field"
            :options="teamOptions"
            placeholder="Select team"
          />
        </FormField>
        <FormField
          v-else
          v-slot="field"
          name="teamName"
          label="Team Name"
        >
          <Input
            v-model="r$.$value.teamName"
            v-bind="field"
          />
        </FormField>

        <Button
          :is-loading="isLoading"
          type="submit"
          class="w-full"
        >
          Register
        </Button>
      </Form>
      <div class="mt-4 text-center text-sm">
        Already have an account?
        <NuxtLink
          :to="`/auth/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`"
          class="font-medium underline underline-offset-4"
        >
          Log in
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
