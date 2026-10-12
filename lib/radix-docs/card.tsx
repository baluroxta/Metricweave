export const name = "Card";

export const importDocs = `
import { Card, Inset, Text, Strong } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Card
<Card>
  <Text>This is a basic card with some content inside.</Text>
</Card>

// Card with Padding Variants
<Card size="1">
  <Text>Small padding card</Text>
</Card>

<Card size="2">
  <Text>Medium padding card</Text>
</Card>

<Card size="3">
  <Text>Large padding card</Text>
</Card>

// Card with Different Variants
<Card variant="surface">
  <Text>Surface variant card</Text>
</Card>

<Card variant="classic">
  <Text>Classic variant card</Text>
</Card>

// Card with Inset (for images or full-width content)
<Card>
  <Inset clip="padding-box" side="top" pb="current">
    <div className="bg-gray-200 border-2 border-dashed rounded w-full h-32 flex items-center justify-center text-gray-500">
      Image Placeholder
    </div>
  </Inset>
  <Text>
    <Strong>Card with Image</Strong>
    <br />
    This card includes an inset image at the top.
  </Text>
</Card>

// Interactive Card (clickable)
<Card asChild>
  <a href="#" className="block hover:bg-gray-50 transition-colors">
    <Text>
      <Strong>Clickable Card</Strong>
      <br />
      This entire card is clickable.
    </Text>
  </a>
</Card>

// Complex Card Layout
<Card>
  <div className="space-y-3">
    <div>
      <Strong>Card Title</Strong>
      <Text as="p" size="2" color="gray">
        Card description or subtitle
      </Text>
    </div>
    <Text as="p">
      This is the main content of the card. You can put any content here.
    </Text>
    <div className="flex gap-2">
      <Button size="1">Action</Button>
      <Button variant="soft" size="1">Secondary</Button>
    </div>
  </div>
</Card>
`;