export const name = "Popover";

export const importDocs = `
import { Popover, Button } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Popover
<Popover.Root>
  <Popover.Trigger>
    <Button variant="soft">Open Popover</Button>
  </Popover.Trigger>
  <Popover.Content>
    <div className="p-4">
      <h4 className="font-semibold">Popover Title</h4>
      <p className="text-sm text-gray-600 mt-2">
        This is the popover content. You can put any content here.
      </p>
    </div>
  </Popover.Content>
</Popover.Root>

// Popover with Form
<Popover.Root>
  <Popover.Trigger>
    <Button>Edit Settings</Button>
  </Popover.Trigger>
  <Popover.Content>
    <div className="p-4 space-y-3">
      <div>
        <label className="text-sm font-medium">Name</label>
        <TextField.Root placeholder="Enter name" mt="1" />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <TextField.Root placeholder="Enter email" mt="1" />
      </div>
      <Button size="2" className="w-full">Save</Button>
    </div>
  </Popover.Content>
</Popover.Root>
`;