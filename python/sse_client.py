import requests
import json
import time
import threading
from typing import Callable, Optional, Dict, Any, Union, List
from lib import ProgressiveJSON


class SSEClient:
    def __init__(self, url: str, progressive_json: Optional[ProgressiveJSON] = None):
        self.url = url
        self.progressive_json = progressive_json or ProgressiveJSON()
        self.is_running = False
        self.reconnect_delay = 1
        self.max_reconnect_delay = 30
        self.on_message: Optional[Callable[[str], None]] = None
        self.on_error: Optional[Callable[[Exception], None]] = None
        self.on_open: Optional[Callable[[], None]] = None
        self.on_close: Optional[Callable[[], None]] = None

    def set_event_handlers(self, 
                          on_message: Optional[Callable[[str], None]] = None,
                          on_error: Optional[Callable[[Exception], None]] = None,
                          on_open: Optional[Callable[[], None]] = None,
                          on_close: Optional[Callable[[], None]] = None):
        """Set event handlers for SSE events."""
        self.on_message = on_message
        self.on_error = on_error
        self.on_open = on_open
        self.on_close = on_close

    def connect(self) -> None:
        """Connect to SSE endpoint and start streaming."""
        self.is_running = True
        
        while self.is_running:
            try:
                self._connect_and_stream()
                break  # Success, exit reconnect loop
            except requests.exceptions.RequestException as e:
                if self.on_error:
                    self.on_error(e)
                else:
                    print(f"Connection error: {e}")
                
                if not self.is_running:
                    break
                
                # Exponential backoff for reconnection
                print(f"Reconnecting in {self.reconnect_delay} seconds...")
                time.sleep(self.reconnect_delay)
                self.reconnect_delay = min(self.reconnect_delay * 2, self.max_reconnect_delay)

    def _connect_and_stream(self) -> None:
        """Internal method to handle connection and streaming."""
        response = requests.get(
            self.url,
            stream=True,
            headers={
                "Accept": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            },
            timeout=30
        )
        
        response.raise_for_status()
        
        if self.on_open:
            self.on_open()
        
        print(f"Connected to SSE endpoint: {self.url}")
        print("=" * 50)
        
        current_chunk = ""
        
        for line in response.iter_lines():
            if not self.is_running:
                break
                
            if line:
                line = line.decode('utf-8')
                
                if line.startswith("data: "):
                    chunk_data = line[6:]  # Remove "data: " prefix
                    
                    # Handle multi-line chunks (comment + JSON)
                    if chunk_data.startswith("/*"):
                        current_chunk = chunk_data
                    elif current_chunk and not chunk_data.startswith("/*"):
                        current_chunk += "\n" + chunk_data
                        self._process_chunk(current_chunk)
                        current_chunk = ""
                    else:
                        self._process_chunk(chunk_data)
        
        if self.on_close:
            self.on_close()

    def _process_chunk(self, chunk_data: str) -> None:
        """Process a single chunk of data."""
        print(f"Received chunk: {chunk_data}")
        
        # Parse the chunk using progressive JSON parser
        self.progressive_json.parse_str(chunk_data)
        
        # Call message handler if set
        if self.on_message:
            self.on_message(chunk_data)
        
        # Print current state after each chunk
        if self.progressive_json.result:
            print(f"Current result: {json.dumps(self.progressive_json.result, indent=2)}")
        
        print("-" * 30)

    def disconnect(self) -> None:
        """Disconnect from SSE endpoint."""
        self.is_running = False
        print("Disconnecting from SSE endpoint...")

    def get_result(self) -> Optional[Dict[str, Any]]:
        """Get the current parsed result."""
        return self.progressive_json.result

    def start_in_background(self) -> threading.Thread:
        """Start the SSE client in a background thread."""
        thread = threading.Thread(target=self.connect)
        thread.daemon = True
        thread.start()
        return thread


def main():
    """Example usage of the SSE client."""
    # Create SSE client
    client = SSEClient("http://localhost:8000/progressive-json")
    
    # Set up event handlers
    def on_message(message: str):
        print(f"Message received: {message[:50]}...")
    
    def on_error(error: Exception):
        print(f"Error occurred: {error}")
    
    def on_open():
        print("Connection opened!")
    
    def on_close():
        print("Connection closed!")
    
    client.set_event_handlers(
        on_message=on_message,
        on_error=on_error,
        on_open=on_open,
        on_close=on_close
    )
    
    try:
        # Connect and start streaming
        client.connect()
        
        # Print final result
        print("=" * 50)
        print("Final result:")
        final_result = client.get_result()
        if final_result:
            print(json.dumps(final_result, indent=2))
        
    except KeyboardInterrupt:
        print("\nInterrupted by user")
        client.disconnect()


if __name__ == "__main__":
    main()