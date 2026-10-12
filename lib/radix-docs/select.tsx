export const name = "Select";

export const importDocs = `
import { Select } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Select
<Select.Root>
  <Select.Trigger placeholder="Select an option..." />
  <Select.Content>
    <Select.Item value="apple">Apple</Select.Item>
    <Select.Item value="banana">Banana</Select.Item>
    <Select.Item value="orange">Orange</Select.Item>
    <Select.Item value="grape">Grape</Select.Item>
  </Select.Content>
</Select.Root>

// Select Sizes
<Select.Root size="1">
  <Select.Trigger placeholder="Small select" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

<Select.Root size="2">
  <Select.Trigger placeholder="Medium select" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

<Select.Root size="3">
  <Select.Trigger placeholder="Large select" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

// Select Variants
<Select.Root>
  <Select.Trigger variant="surface" placeholder="Surface variant" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

<Select.Root>
  <Select.Trigger variant="classic" placeholder="Classic variant" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

<Select.Root>
  <Select.Trigger variant="soft" placeholder="Soft variant" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

// Select Colors
<Select.Root>
  <Select.Trigger color="blue" placeholder="Blue select" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
  </Select.Content>
</Select.Root>

// Select with Groups
<Select.Root>
  <Select.Trigger placeholder="Select food..." />
  <Select.Content>
    <Select.Group>
      <Select.Label>Fruits</Select.Label>
      <Select.Item value="apple">Apple</Select.Item>
      <Select.Item value="banana">Banana</Select.Item>
      <Select.Item value="orange">Orange</Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Vegetables</Select.Label>
      <Select.Item value="carrot">Carrot</Select.Item>
      <Select.Item value="broccoli">Broccoli</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>

// Disabled Select
<Select.Root disabled>
  <Select.Trigger placeholder="Disabled select" />
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
  </Select.Content>
</Select.Root>
`;