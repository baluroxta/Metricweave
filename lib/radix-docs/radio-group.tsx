export const name = "RadioGroup";

export const importDocs = `
import { RadioGroup } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Radio Group
<RadioGroup.Root defaultValue="1">
  <RadioGroup.Item value="1">Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Option 2</RadioGroup.Item>
  <RadioGroup.Item value="3">Option 3</RadioGroup.Item>
</RadioGroup.Root>

// Radio Group Sizes
<RadioGroup.Root size="1" defaultValue="1">
  <RadioGroup.Item value="1">Small Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Small Option 2</RadioGroup.Item>
</RadioGroup.Root>

<RadioGroup.Root size="2" defaultValue="1">
  <RadioGroup.Item value="1">Medium Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Medium Option 2</RadioGroup.Item>
</RadioGroup.Root>

<RadioGroup.Root size="3" defaultValue="1">
  <RadioGroup.Item value="1">Large Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Large Option 2</RadioGroup.Item>
</RadioGroup.Root>

// Radio Group Variants
<RadioGroup.Root variant="surface" defaultValue="1">
  <RadioGroup.Item value="1">Surface Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Surface Option 2</RadioGroup.Item>
</RadioGroup.Root>

<RadioGroup.Root variant="classic" defaultValue="1">
  <RadioGroup.Item value="1">Classic Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Classic Option 2</RadioGroup.Item>
</RadioGroup.Root>

<RadioGroup.Root variant="soft" defaultValue="1">
  <RadioGroup.Item value="1">Soft Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Soft Option 2</RadioGroup.Item>
</RadioGroup.Root>

// Radio Group Colors
<RadioGroup.Root color="blue" defaultValue="1">
  <RadioGroup.Item value="1">Blue Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Blue Option 2</RadioGroup.Item>
</RadioGroup.Root>

// High Contrast Radio Group
<RadioGroup.Root highContrast defaultValue="1">
  <RadioGroup.Item value="1">High Contrast 1</RadioGroup.Item>
  <RadioGroup.Item value="2">High Contrast 2</RadioGroup.Item>
</RadioGroup.Root>

// Disabled Radio Group
<RadioGroup.Root disabled defaultValue="1">
  <RadioGroup.Item value="1">Disabled Option 1</RadioGroup.Item>
  <RadioGroup.Item value="2">Disabled Option 2</RadioGroup.Item>
</RadioGroup.Root>
`;