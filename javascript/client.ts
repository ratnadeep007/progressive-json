import { ProgressiveJSON } from './progressive-json.ts';

async function streamProgressiveJson() {
  const progressiveJson = new ProgressiveJSON();
  
  try {
    const response = await fetch('http://localhost:8000/progressive-json', {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No reader available');
    }

    console.log("Starting to receive progressive JSON chunks...");
    console.log("=".repeat(50));
    
    let currentChunk = "";
    let buffer = "";
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const chunkData = line.slice(6);
          
          if (chunkData.startsWith('/*')) {
            currentChunk = chunkData;
          } else if (currentChunk && !chunkData.startsWith('/*')) {
            currentChunk += '\n' + chunkData;
            console.log(`Received chunk: ${currentChunk}`);
            
            progressiveJson.parseStr(currentChunk);
            
            const result = progressiveJson.getResult();
            if (result) {
              console.log(`Current result: ${JSON.stringify(result, null, 2)}`);
            }
            console.log('-'.repeat(30));
            currentChunk = "";
          } else {
            console.log(`Received chunk: ${chunkData}`);
            
            progressiveJson.parseStr(chunkData);
            
            const result = progressiveJson.getResult();
            if (result) {
              console.log(`Current result: ${JSON.stringify(result, null, 2)}`);
            }
            console.log('-'.repeat(30));
          }
        }
      }
    }
    
    console.log('='.repeat(50));
    console.log('Final result:');
    const finalResult = progressiveJson.getResult();
    if (finalResult) {
      console.log(JSON.stringify(finalResult, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

streamProgressiveJson();