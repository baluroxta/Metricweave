export const name = "Switch";

export const importDocs = `
import { Switch } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Switch
<Switch />

// Switch with Label
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <label htmlFor="notifications" className="text-sm font-medium">
    Enable notifications
  </label>
</div>

// Switch Sizes
<Switch size="1" />
<Switch size="2" />
<Switch size="3" />

// Switch Variants
<Switch variant="surface" />
<Switch variant="classic" />
<Switch variant="soft" />

// Switch Colors
<Switch color="blue" />
<Switch color="green" />
<Switch color="red" />
<Switch color="orange" />
<Switch color="purple" />

// High Contrast Switch
<Switch highContrast />

// Disabled Switch
<Switch disabled />

// Checked Switch
<Switch defaultChecked />
`;