export const name = "Toast";

export const importDocs = `
import { Toast, Button } from '@radix-ui/themes'
`;

export const usageDocs = `
// Note: Toast is typically used with a ToastProvider and state management
// This shows the structure of Toast components

// Basic Toast (shown for reference)
<Toast.Root>
  <Toast.Title>Success</Toast.Title>
  <Toast.Description>Your changes have been saved.</Toast.Description>
  <Toast.Close />
</Toast.Root>

// Toast with Action
<Toast.Root>
  <Toast.Title>File deleted</Toast.Title>
  <Toast.Description>Your file has been moved to trash.</Toast.Description>
  <Toast.Action altText="Undo deletion">
    <Button size="1" variant="soft">Undo</Button>
  </Toast.Action>
  <Toast.Close />
</Toast.Root>

// Different Toast Types (conceptual)
// Success Toast
<div className="bg-green-50 border border-green-200 rounded p-4">
  <div className="font-medium text-green-800">Success</div>
  <div className="text-green-600 text-sm">Operation completed successfully.</div>
</div>

// Error Toast
<div className="bg-red-50 border border-red-200 rounded p-4">
  <div className="font-medium text-red-800">Error</div>
  <div className="text-red-600 text-sm">Something went wrong.</div>
</div>

// Warning Toast
<div className="bg-yellow-50 border border-yellow-200 rounded p-4">
  <div className="font-medium text-yellow-800">Warning</div>
  <div className="text-yellow-600 text-sm">Please check your input.</div>
</div>
`;