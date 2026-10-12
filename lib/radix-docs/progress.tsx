export const name = "Progress";

export const importDocs = `
import { Progress } from '@radix-ui/themes'
`;

export const usageDocs = `
// Basic Progress
<Progress value={65} />

// Progress Sizes
<Progress size="1" value={25} />
<Progress size="2" value={50} />
<Progress size="3" value={75} />

// Progress Variants
<Progress variant="surface" value={50} />
<Progress variant="classic" value={50} />
<Progress variant="soft" value={50} />

// Progress Colors
<Progress color="blue" value={50} />
<Progress color="green" value={75} />
<Progress color="red" value={25} />
<Progress color="orange" value={60} />

// High Contrast Progress
<Progress highContrast value={80} />

// Progress with Different Values
<Progress value={0} />
<Progress value={25} />
<Progress value={50} />
<Progress value={75} />
<Progress value={100} />
`;