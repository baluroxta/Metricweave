export const name = "DropdownMenu";

export const importDocs = `
import { DropdownMenu, Button } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Dropdown Menu
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft">Options</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

// Dropdown Menu with Icons
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft">Actions</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>
      <Edit className="w-4 h-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item>
      <Download className="w-4 h-4" />
      Download
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item color="red">
      <Trash className="w-4 h-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

// Dropdown Menu with Checkboxes
<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft">View</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.CheckboxItem checked>Show Toolbar</DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem>Show Sidebar</DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem checked>Show Footer</DropdownMenu.CheckboxItem>
  </DropdownMenu.Content>
</DropdownMenu.Root>
`;