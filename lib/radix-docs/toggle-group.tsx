export const name = "ToggleGroup";

export const importDocs = `
import { ToggleGroup } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Toggle Group (Single)
<ToggleGroup.Root type="single" defaultValue="center">
  <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
  <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
  <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>

// Toggle Group (Multiple)
<ToggleGroup.Root type="multiple" defaultValue={["bold"]}>
  <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
  <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
  <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
</ToggleGroup.Root>

// Toggle Group Sizes
<ToggleGroup.Root size="1" type="single">
  <ToggleGroup.Item value="1">1</ToggleGroup.Item>
  <ToggleGroup.Item value="2">2</ToggleGroup.Item>
  <ToggleGroup.Item value="3">3</ToggleGroup.Item>
</ToggleGroup.Root>

<ToggleGroup.Root size="2" type="single">
  <ToggleGroup.Item value="1">1</ToggleGroup.Item>
  <ToggleGroup.Item value="2">2</ToggleGroup.Item>
  <ToggleGroup.Item value="3">3</ToggleGroup.Item>
</ToggleGroup.Root>

// Toggle Group Variants
<ToggleGroup.Root variant="surface" type="single">
  <ToggleGroup.Item value="option1">Option 1</ToggleGroup.Item>
  <ToggleGroup.Item value="option2">Option 2</ToggleGroup.Item>
</ToggleGroup.Root>

<ToggleGroup.Root variant="classic" type="single">
  <ToggleGroup.Item value="option1">Option 1</ToggleGroup.Item>
  <ToggleGroup.Item value="option2">Option 2</ToggleGroup.Item>
</ToggleGroup.Root>
`;