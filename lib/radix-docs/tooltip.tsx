export const name = "Tooltip";

export const importDocs = `
import { Tooltip, Button } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Tooltip
<Tooltip content="This is a tooltip">
  <Button variant="soft">Hover me</Button>
</Tooltip>

// Tooltip with Different Sides
<Tooltip content="Top tooltip" side="top">
  <Button variant="soft">Top</Button>
</Tooltip>

<Tooltip content="Right tooltip" side="right">
  <Button variant="soft">Right</Button>
</Tooltip>

<Tooltip content="Bottom tooltip" side="bottom">
  <Button variant="soft">Bottom</Button>
</Tooltip>

<Tooltip content="Left tooltip" side="left">
  <Button variant="soft">Left</Button>
</Tooltip>

// Tooltip with Icon
<Tooltip content="Delete this item">
  <Button variant="soft" color="red">
    <Trash className="w-4 h-4" />
  </Button>
</Tooltip>
`;