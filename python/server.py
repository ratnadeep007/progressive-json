from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Progressive JSON Server"}

@app.get("/progressive-json")
async def progressive_json():
    async def generate_chunks():
        # Sample progressive JSON data
        chunks = [
            '{ "username": "darklord", "email": "darklord@hell.com", "pii": "$1", "hobbies": ["reading", "$2"], "friends": [{"name": "alice", "details": "$3"}] }',
            '/* $1 */\n{ "age": 20, "address": "$2", "symptoms": "$3" }',
            '/* $2 */\n{ "street": "a", "pincode": "111111" }',
            '/* $3 */\n[ {"symptom": "some symptom"} ]'
        ]
        
        for chunk in chunks:
            # Split multi-line chunks and send each line with data: prefix
            lines = chunk.split('\n')
            for line in lines:
                if line.strip():  # Skip empty lines
                    yield f"data: {line}\n"
            yield "\n"  # Empty line to mark end of event
            await asyncio.sleep(1)
    
    return StreamingResponse(
        generate_chunks(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)