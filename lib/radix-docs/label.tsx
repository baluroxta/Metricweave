export const name = "Text";

export const importDocs = `
import { Text, Strong, Em, Code } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Text
<Text>Regular text content</Text>

// Text Sizes
<Text size="1">Very small text</Text>
<Text size="2">Small text</Text>
<Text size="3">Medium text</Text>
<Text size="4">Large text</Text>
<Text size="5">Very large text</Text>
<Text size="6">Extra large text</Text>
<Text size="7">Huge text</Text>
<Text size="8">Massive text</Text>
<Text size="9">Giant text</Text>

// Text Weights
<Text weight="light">Light text</Text>
<Text weight="regular">Regular text</Text>
<Text weight="medium">Medium text</Text>
<Text weight="bold">Bold text</Text>

// Text Colors
<Text color="blue">Blue text</Text>
<Text color="green">Green text</Text>
<Text color="red">Red text</Text>
<Text color="orange">Orange text</Text>
<Text color="purple">Purple text</Text>
<Text color="gray">Gray text</Text>

// Text as Different Elements
<Text as="p">Paragraph text</Text>
<Text as="span">Span text</Text>
<Text as="div">Div text</Text>
<Text as="label">Label text</Text>

// Text Alignment
<Text align="left">Left aligned</Text>
<Text align="center">Center aligned</Text>
<Text align="right">Right aligned</Text>

// Text Formatting
<Strong>Strong/Bold text</Strong>
<Em>Emphasized/Italic text</Em>
<Code>Inline code text</Code>

// High Contrast
<Text highContrast>High contrast text</Text>
<Text color="gray" highContrast>High contrast gray</Text>

// Truncate
<Text truncate>This is a very long text that will be truncated with ellipsis when it overflows</Text>
`;