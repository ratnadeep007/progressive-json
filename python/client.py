import requests
import json
from lib import ProgressiveJSON

def stream_progressive_json():
    progressive_json = ProgressiveJSON()
    
    try:
        response = requests.get(
            "http://localhost:8000/progressive-json",
            stream=True,
            headers={
                "Accept": "text/event-stream",
                "Cache-Control": "no-cache"
            }
        )
        
        print("Starting to receive progressive JSON chunks...")
        print("=" * 50)
        
        current_chunk = ""
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith("data: "):
                    chunk_data = line[6:]  # Remove "data: " prefix
                    
                    # Handle multi-line chunks (comment + JSON)
                    if chunk_data.startswith("/*"):
                        current_chunk = chunk_data
                    elif current_chunk and not chunk_data.startswith("/*"):
                        current_chunk += "\n" + chunk_data
                        print(f"Received chunk: {current_chunk}")
                        
                        # Parse the chunk using our progressive JSON parser
                        progressive_json.parse_str(current_chunk)
                        
                        # Print current state after each chunk
                        if progressive_json.result:
                            print(f"Current result: {json.dumps(progressive_json.result, indent=2)}")
                        print("-" * 30)
                        current_chunk = ""
                    else:
                        print(f"Received chunk: {chunk_data}")
                        
                        # Parse the chunk using our progressive JSON parser
                        progressive_json.parse_str(chunk_data)
                        
                        # Print current state after each chunk
                        if progressive_json.result:
                            print(f"Current result: {json.dumps(progressive_json.result, indent=2)}")
                        print("-" * 30)
        
        print("=" * 50)
        print("Final result:")
        print(json.dumps(progressive_json.result, indent=2))
        
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to server: {e}")
    except Exception as e:
        print(f"Error processing chunks: {e}")

if __name__ == "__main__":
    stream_progressive_json()