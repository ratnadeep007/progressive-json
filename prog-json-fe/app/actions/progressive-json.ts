'use server';

export async function streamProgressiveJson() {
  const chunks = [
    '{ "username": "darklord", "email": "darklord@hell.com", "pii": "$1", "hobbies": ["reading", "$2"], "friends": [{"name": "alice", "details": "$3"}] }',
    '/* $1 */\n{ "age": 20, "address": "$2", "symptoms": "$3" }',
    '/* $2 */\n{ "street": "a", "pincode": "111111" }',
    '/* $3 */\n[ {"symptom": "some symptom"} ]'
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const chunk of chunks) {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(`data: ${line}\n`);
            }
          }
          controller.enqueue('\n');
          await new Promise(resolve => setTimeout(resolve, 1000));
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