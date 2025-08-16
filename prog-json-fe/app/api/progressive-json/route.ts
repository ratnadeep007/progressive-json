export async function GET() {
  const chunks = [
    '{ "username": "darklord", "email": "darklord@hell.com", "pii": "$1", "hobbies": ["reading", "$2"], "friends": [{"name": "alice", "details": "$3"}] }',
    '/* $1 */\n{ "age": 20, "address": "$2", "symptoms": "$3" }',
    '/* $2 */\n{ "street": "a", "pincode": "111111" }',
    '/* $3 */\n[ {"symptom": "some symptom"} ]'
  ];

  const delays = [500, 500, 2500]; // $1 and $2 come quickly, $3 takes 2.5 seconds

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial chunk
        const lines = chunks[0].split('\n');
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(`data: ${line}\n`);
          }
        }
        controller.enqueue('\n');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send remaining chunks with different delays
        for (let i = 1; i < chunks.length; i++) {
          const lines = chunks[i].split('\n');
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(`data: ${line}\n`);
            }
          }
          controller.enqueue('\n');
          await new Promise(resolve => setTimeout(resolve, delays[i - 1]));
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  });
}