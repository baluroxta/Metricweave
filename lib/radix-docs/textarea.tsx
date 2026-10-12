export const name = "TextArea";

export const importDocs = `
import { TextArea } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic TextArea
<TextArea placeholder="Enter your message..." />

// TextArea Sizes
<TextArea size="1" placeholder="Small textarea" />
<TextArea size="2" placeholder="Medium textarea" />
<TextArea size="3" placeholder="Large textarea" />

// TextArea Variants
<TextArea variant="surface" placeholder="Surface variant" />
<TextArea variant="classic" placeholder="Classic variant" />
<TextArea variant="soft" placeholder="Soft variant" />

// TextArea Colors
<TextArea color="blue" placeholder="Blue textarea" />
<TextArea color="green" placeholder="Green textarea" />
<TextArea color="red" placeholder="Red textarea" />

// TextArea Resize Options
<TextArea resize="vertical" placeholder="Vertical resize only" />
<TextArea resize="horizontal" placeholder="Horizontal resize only" />
<TextArea resize="both" placeholder="Both directions" />
<TextArea resize="none" placeholder="No resize" />

// Disabled TextArea
<TextArea disabled placeholder="Disabled textarea" />

// TextArea with Rows
<TextArea rows={4} placeholder="Textarea with 4 rows" />
<TextArea rows={6} placeholder="Textarea with 6 rows" />
`;