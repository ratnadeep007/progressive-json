'use client';

import { useState } from 'react';
import { ProgressiveJSON } from '@/lib/progressive-json';

type ProgressiveJsonData = Record<string, unknown> | unknown[];

export default function ProgressiveJsonClient() {
  const [data, setData] = useState<ProgressiveJsonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPlaceholder = (value: unknown): boolean => {
    return typeof value === 'string' && value.startsWith('$');
  };

  const renderValue = (value: unknown, _key?: string): React.ReactNode => {
    if (isPlaceholder(value)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading {value as string}...
        </span>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="ml-4 border-l-2 border-gray-200 pl-2">
          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="mb-1">
              <span className="font-medium text-gray-700">{k}:</span>
              <span className="ml-2">{renderValue(v, k)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="ml-4">
          {value.map((item: unknown, index: number) => (
            <div key={index} className="mb-1">
              <span className="text-gray-600">[{index}]:</span>
              <span className="ml-2">{renderValue(item)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-900">{String(value)}</span>;
  };

  const startStreaming = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/progressive-json', {
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

      const progressiveJson = new ProgressiveJSON();
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
              
              progressiveJson.parseStr(currentChunk);
              
              const result = progressiveJson.getResult();
              if (result) {
                setData(result);
              }
              currentChunk = "";
            } else {
              progressiveJson.parseStr(chunkData);
              
              const result = progressiveJson.getResult();
              if (result) {
                setData(result);
              }
            }
          }
        }
      }
      
      const finalResult = progressiveJson.getResult();
      if (finalResult) {
        setData(finalResult);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Progressive JSON Demo</h1>
        <p className="text-gray-600 mb-4">
          This demo shows how progressive JSON loading works. Data streams in chunks, 
          and placeholders ($1, $2, etc.) are replaced with actual data as it arrives.
        </p>
        <button
          onClick={startStreaming}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Streaming...' : 'Start Streaming'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progressive JSON Data</h2>
          <div className="space-y-2">
            {Array.isArray(data) ? (
              data.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <span className="font-medium text-gray-700">[{index}]:</span>
                  <span className="ml-2">{renderValue(item)}</span>
                </div>
              ))
            ) : (
              Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="ml-2">{renderValue(value, key)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}