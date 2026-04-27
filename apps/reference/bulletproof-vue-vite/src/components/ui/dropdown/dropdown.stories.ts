import type { Meta } from '@storybook/vue3'
import { ref } from 'vue'

import { Button } from '../button'

import {
  Dropdown,
  DropdownCheckboxItem,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from './'

const meta: Meta = {
  component: Dropdown,
}

export default meta

export const Default = () => ({
  components: {
    Button,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownTrigger,
  },
  template: `
    <Dropdown>
      <DropdownTrigger as-child>
        <Button>Open Menu</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Item One</DropdownItem>
        <DropdownItem>Item Two</DropdownItem>
        <DropdownSeparator />
        <DropdownItem>Item Three</DropdownItem>
      </DropdownContent>
    </Dropdown>
  `,
})

export const WithCheckboxItems = () => ({
  components: {
    Button,
    Dropdown,
    DropdownCheckboxItem,
    DropdownContent,
    DropdownTrigger,
  },
  setup() {
    const checked = ref(true)
    const checked2 = ref(false)

    return { checked, checked2 }
  },
  template: `
    <Dropdown>
      <DropdownTrigger as-child>
        <Button>Open Menu</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownCheckboxItem v-model:checked="checked">
          Option One
        </DropdownCheckboxItem>
        <DropdownCheckboxItem v-model:checked="checked2">
          Option Two
        </DropdownCheckboxItem>
      </DropdownContent>
    </Dropdown>
  `,
})

export const WithRadioItems = () => ({
  components: {
    Button,
    Dropdown,
    DropdownContent,
    DropdownLabel,
    DropdownRadioGroup,
    DropdownRadioItem,
    DropdownSeparator,
    DropdownTrigger,
  },
  setup() {
    const value = ref('one')

    return { value }
  },
  template: `
    <Dropdown>
      <DropdownTrigger as-child>
        <Button>Open Menu</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>Select an option</DropdownLabel>
        <DropdownSeparator />
        <DropdownRadioGroup v-model="value">
          <DropdownRadioItem value="one">Option One</DropdownRadioItem>
          <DropdownRadioItem value="two">Option Two</DropdownRadioItem>
          <DropdownRadioItem value="three">Option Three</DropdownRadioItem>
        </DropdownRadioGroup>
      </DropdownContent>
    </Dropdown>
  `,
})

export const WithSubmenus = () => ({
  components: {
    Button,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownSub,
    DropdownSubContent,
    DropdownSubTrigger,
    DropdownTrigger,
  },
  template: `
    <Dropdown>
      <DropdownTrigger>
        <Button>Open Menu</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem>Item One</DropdownItem>
        <DropdownSub>
          <DropdownSubTrigger>More Options</DropdownSubTrigger>
          <DropdownSubContent>
            <DropdownItem>Sub Item One</DropdownItem>
            <DropdownItem>Sub Item Two</DropdownItem>
          </DropdownSubContent>
        </DropdownSub>
        <DropdownItem>Item Three</DropdownItem>
      </DropdownContent>
    </Dropdown>
  `,
})
