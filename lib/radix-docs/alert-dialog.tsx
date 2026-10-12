export const name = "AlertDialog";

export const importDocs = `
import { AlertDialog, Button, Flex } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Alert Dialog
<AlertDialog.Root>
  <AlertDialog.Trigger>
    <Button color="red">Delete Account</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Title>Delete Account</AlertDialog.Title>
    <AlertDialog.Description>
      Are you sure you want to delete your account? This action cannot be undone.
    </AlertDialog.Description>
    <Flex gap="3" mt="4" justify="end">
      <AlertDialog.Cancel>
        <Button variant="soft" color="gray">Cancel</Button>
      </AlertDialog.Cancel>
      <AlertDialog.Action>
        <Button color="red">Delete Account</Button>
      </AlertDialog.Action>
    </Flex>
  </AlertDialog.Content>
</AlertDialog.Root>

// Confirmation Dialog
<AlertDialog.Root>
  <AlertDialog.Trigger>
    <Button>Save Changes</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Title>Save Changes</AlertDialog.Title>
    <AlertDialog.Description>
      Do you want to save your changes before leaving?
    </AlertDialog.Description>
    <Flex gap="3" mt="4" justify="end">
      <AlertDialog.Cancel>
        <Button variant="soft" color="gray">Don't Save</Button>
      </AlertDialog.Cancel>
      <AlertDialog.Action>
        <Button>Save Changes</Button>
      </AlertDialog.Action>
    </Flex>
  </AlertDialog.Content>
</AlertDialog.Root>
`;