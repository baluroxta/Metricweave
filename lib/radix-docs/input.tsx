export const name = "TextField";

export const importDocs = `
import { TextField, TextArea } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Text Field
<TextField.Root placeholder="Enter your name..." />

// Text Field with Label
<div className="space-y-2">
  <label className="text-sm font-medium">Email</label>
  <TextField.Root type="email" placeholder="Enter your email..." />
</div>

// Text Field Sizes
<TextField.Root size="1" placeholder="Small input" />
<TextField.Root size="2" placeholder="Medium input (default)" />
<TextField.Root size="3" placeholder="Large input" />

// Text Field Variants
<TextField.Root variant="surface" placeholder="Surface variant" />
<TextField.Root variant="classic" placeholder="Classic variant" />
<TextField.Root variant="soft" placeholder="Soft variant" />

// Text Field Colors
<TextField.Root color="blue" placeholder="Blue color" />
<TextField.Root color="green" placeholder="Green color" />
<TextField.Root color="red" placeholder="Red color" />

// Text Field with Slot (Icon)
<TextField.Root placeholder="Search...">
  <TextField.Slot>
    <Search className="h-4 w-4" />
  </TextField.Slot>
</TextField.Root>

<TextField.Root placeholder="Enter amount">
  <TextField.Slot>$</TextField.Slot>
</TextField.Root>

<TextField.Root placeholder="Enter weight">
  <TextField.Slot side="right">kg</TextField.Slot>
</TextField.Root>

// Disabled Text Field
<TextField.Root disabled placeholder="Disabled input" />

// Text Area
<TextArea placeholder="Enter your message..." />

// Text Area with Resize
<TextArea resize="vertical" placeholder="Vertical resize only" />
<TextArea resize="horizontal" placeholder="Horizontal resize only" />
<TextArea resize="both" placeholder="Both directions" />
<TextArea resize="none" placeholder="No resize" />

// Text Area Sizes
<TextArea size="1" placeholder="Small textarea" />
<TextArea size="2" placeholder="Medium textarea" />
<TextArea size="3" placeholder="Large textarea" />

// Text Area Variants
<TextArea variant="surface" placeholder="Surface variant" />
<TextArea variant="classic" placeholder="Classic variant" />
<TextArea variant="soft" placeholder="Soft variant" />
`;