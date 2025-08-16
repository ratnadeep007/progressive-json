# Progressive JSON Implementation in Next.js

This implementation demonstrates progressive JSON loading in a Next.js application, similar to the JavaScript reference implementation.

## Features

- **Server-side streaming**: Uses Next.js API routes to stream JSON data progressively
- **Client-side parsing**: React component that handles streaming and updates UI in real-time
- **Loading states**: Shows loading indicators for placeholder values ($1, $2, etc.)
- **Type-safe**: Full TypeScript support with proper type definitions

## Implementation Details

### Files Created

1. **`lib/progressive-json.ts`** - Core progressive JSON parser
   - Handles chunked JSON parsing
   - Replaces placeholders ($1, $2, etc.) with actual data
   - Supports both objects and arrays

2. **`app/api/progressive-json/route.ts`** - API endpoint for streaming
   - Streams JSON data using Server-Sent Events (SSE)
   - Sends chunks with 1-second delays to simulate progressive loading

3. **`components/ProgressiveJsonClient.tsx`** - React client component
   - Handles streaming connection
   - Shows loading states for placeholder values
   - Renders the final JSON structure with proper formatting

4. **`app/page.tsx`** - Main page updated to use the progressive JSON component

### How It Works

1. **Initial Request**: The client makes a request to `/api/progressive-json`
2. **Streaming Response**: The server sends JSON data in chunks using SSE
3. **Progressive Parsing**: Each chunk is parsed and placeholders are identified
4. **UI Updates**: The component shows loading states for placeholders and updates as data arrives
5. **Final Result**: Complete JSON structure is displayed when all chunks are received

### Example Data Flow

The server sends these chunks with specific delays:

1. **Initial JSON** (0.5s delay):
   ```json
   {
     "username": "darklord",
     "email": "darklord@hell.com", 
     "pii": "$1",
     "hobbies": ["reading", "$2"],
     "friends": [{"name": "alice", "details": "$3"}]
   }
   ```

2. **Chunk 1 data** (0.5s delay):
   ```json
   {
     "age": 20,
     "address": "$2", 
     "symptoms": "$3"
   }
   ```

3. **Chunk 2 data** (0.5s delay):
   ```json
   {
     "street": "a",
     "pincode": "111111"
   }
   ```

4. **Chunk 3 data** (2.5s delay):
   ```json
   [
     {"symptom": "some symptom"}
   ]
   ```

### Delay Pattern

- **$1 and $2**: Arrive quickly (within ~1.5 seconds total)
- **$3**: Takes longer to arrive (additional 2.5 seconds)
- This simulates real-world scenarios where some data might be slower to fetch (e.g., from external APIs, complex computations, or database queries)

### Loading States

- Placeholder values ($1, $2, $3) show as yellow loading badges with spinners
- Real data displays normally when received
- Nested objects and arrays are properly formatted

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3001 in your browser

3. Click "Start Streaming" to begin the progressive JSON loading demo

4. Watch as placeholder values are replaced with actual data over time

## Technical Notes

- Uses Server-Sent Events (SSE) for real-time streaming
- Implements the same parsing logic as the reference JavaScript implementation
- Fully responsive design with Tailwind CSS
- TypeScript strict mode enabled for type safety
- ESLint configured for code quality

## Comparison with Reference Implementation

This Next.js implementation provides the same core functionality as the JavaScript reference but with:

- **Better UX**: Visual loading states instead of console output
- **Type Safety**: Full TypeScript support
- **Modern Framework**: Built with Next.js 15 and React 19
- **Responsive Design**: Mobile-friendly interface
- **Production Ready**: Proper error handling and build optimization