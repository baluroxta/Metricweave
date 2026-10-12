export const name = "Slider";

export const importDocs = `
import { Slider } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Slider
<Slider defaultValue={[50]} max={100} step={1} />

// Slider Sizes
<Slider size="1" defaultValue={[25]} max={100} />
<Slider size="2" defaultValue={[50]} max={100} />
<Slider size="3" defaultValue={[75]} max={100} />

// Slider Variants
<Slider variant="surface" defaultValue={[50]} max={100} />
<Slider variant="classic" defaultValue={[50]} max={100} />
<Slider variant="soft" defaultValue={[50]} max={100} />

// Slider Colors
<Slider color="blue" defaultValue={[50]} max={100} />
<Slider color="green" defaultValue={[50]} max={100} />
<Slider color="red" defaultValue={[50]} max={100} />

// High Contrast Slider
<Slider highContrast defaultValue={[50]} max={100} />

// Range Slider (multiple values)
<Slider defaultValue={[25, 75]} max={100} step={1} />

// Disabled Slider
<Slider disabled defaultValue={[50]} max={100} />

// Slider with Custom Step
<Slider defaultValue={[50]} max={100} step={10} />

// Slider with Min/Max
<Slider defaultValue={[20]} min={10} max={50} step={1} />
`;