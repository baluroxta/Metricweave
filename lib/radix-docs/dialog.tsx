export const name = "Dialog";

export const importDocs = `
import { Dialog, Button, Flex } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Dialog
<Dialog.Root>
  <Dialog.Trigger>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Dialog Title</Dialog.Title>
    <Dialog.Description>
      This is a dialog description. You can put any content here.
    </Dialog.Description>
    <Flex gap="3" mt="4" justify="end">
      <Dialog.Close>
        <Button variant="soft" color="gray">Cancel</Button>
      </Dialog.Close>
      <Dialog.Close>
        <Button>Save</Button>
      </Dialog.Close>
    </Flex>
  </Dialog.Content>
</Dialog.Root>

// Dialog Sizes
<Dialog.Root>
  <Dialog.Trigger>
    <Button>Small Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content size="1">
    <Dialog.Title>Small Dialog</Dialog.Title>
    <Dialog.Description>This is a small dialog.</Dialog.Description>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root>
  <Dialog.Trigger>
    <Button>Large Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content size="4">
    <Dialog.Title>Large Dialog</Dialog.Title>
    <Dialog.Description>This is a large dialog with more space.</Dialog.Description>
  </Dialog.Content>
</Dialog.Root>

// Form Dialog
<Dialog.Root>
  <Dialog.Trigger>
    <Button>Edit Profile</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Edit Profile</Dialog.Title>
    <Dialog.Description>
      Make changes to your profile here. Click save when you're done.
    </Dialog.Description>
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <TextField.Root defaultValue="John Doe" mt="1" />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <TextField.Root defaultValue="john@example.com" mt="1" />
      </div>
    </div>
    <Flex gap="3" mt="4" justify="end">
      <Dialog.Close>
        <Button variant="soft" color="gray">Cancel</Button>
      </Dialog.Close>
      <Dialog.Close>
        <Button>Save changes</Button>
      </Dialog.Close>
    </Flex>
  </Dialog.Content>
</Dialog.Root>
`;