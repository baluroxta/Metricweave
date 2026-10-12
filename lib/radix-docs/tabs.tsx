export const name = "Tabs";

export const importDocs = `
import { Tabs } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Tabs
<Tabs.Root defaultValue="account">
  <Tabs.List>
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">
    <div className="p-4">
      <h3 className="text-lg font-semibold">Account Information</h3>
      <p className="text-gray-600">Manage your account details here.</p>
    </div>
  </Tabs.Content>
  <Tabs.Content value="documents">
    <div className="p-4">
      <h3 className="text-lg font-semibold">Documents</h3>
      <p className="text-gray-600">View and manage your documents.</p>
    </div>
  </Tabs.Content>
  <Tabs.Content value="settings">
    <div className="p-4">
      <h3 className="text-lg font-semibold">Settings</h3>
      <p className="text-gray-600">Configure your preferences.</p>
    </div>
  </Tabs.Content>
</Tabs.Root>

// Tabs Sizes
<Tabs.Root size="1" defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Small Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Small Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Small tab content</Tabs.Content>
  <Tabs.Content value="tab2">Small tab content 2</Tabs.Content>
</Tabs.Root>

<Tabs.Root size="2" defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Large Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Large Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Large tab content</Tabs.Content>
  <Tabs.Content value="tab2">Large tab content 2</Tabs.Content>
</Tabs.Root>

// Vertical Tabs
<div className="flex">
  <Tabs.Root orientation="vertical" defaultValue="overview" className="w-64">
    <Tabs.List>
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
      <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
      <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>
  <div className="ml-4 flex-1">
    <Tabs.Content value="overview">Overview content</Tabs.Content>
    <Tabs.Content value="analytics">Analytics content</Tabs.Content>
    <Tabs.Content value="reports">Reports content</Tabs.Content>
    <Tabs.Content value="notifications">Notifications content</Tabs.Content>
  </div>
</div>
`;