export const name = "Button";

export const importDocs = 
"import { Button } from '@radix-ui/themes'";

export const usageDocs = `
// Basic Buttons
<Button>Default Button</Button>
<Button variant="soft">Soft Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>

// Button Colors
<Button color="blue">Blue Button</Button>
<Button color="green">Green Button</Button>
<Button color="red">Red Button</Button>
<Button color="orange">Orange Button</Button>
<Button color="purple">Purple Button</Button>
<Button color="gray">Gray Button</Button>

// Button Sizes
<Button size="1">Small Button</Button>
<Button size="2">Medium Button</Button>
<Button size="3">Large Button</Button>
<Button size="4">Extra Large Button</Button>

// Button with Icons
<Button>
  <Plus className="w-4 h-4" />
  Add Item
</Button>

<Button variant="outline">
  <Download className="w-4 h-4" />
  Download
</Button>

// Icon-only Buttons
<Button variant="ghost" size="1">
  <Settings className="w-4 h-4" />
</Button>

// High Contrast Buttons
<Button highContrast>High Contrast</Button>
<Button variant="soft" highContrast>Soft High Contrast</Button>

// Loading/Disabled States
<Button disabled>Disabled Button</Button>
<Button loading>Loading Button</Button>
`;