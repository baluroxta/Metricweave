export const name = "Checkbox";

export const importDocs = `
import { Checkbox } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Checkbox
<Checkbox />

// Checkbox with Label
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    Accept terms and conditions
  </label>
</div>

// Checkbox Sizes
<Checkbox size="1" />
<Checkbox size="2" />
<Checkbox size="3" />

// Checkbox Variants
<Checkbox variant="surface" />
<Checkbox variant="classic" />
<Checkbox variant="soft" />

// Checkbox Colors
<Checkbox color="blue" />
<Checkbox color="green" />
<Checkbox color="red" />
<Checkbox color="orange" />
<Checkbox color="purple" />

// High Contrast Checkbox
<Checkbox highContrast />

// Disabled Checkbox
<Checkbox disabled />

// Checked State
<Checkbox defaultChecked />

// Indeterminate State
<Checkbox checked="indeterminate" />
`;