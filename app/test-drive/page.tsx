// components/TestDriveFetch.tsx
"use client"

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function TestDriveFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFetch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-drive-fetch');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Fetch failed');
      
      setResult(data);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium">Google Drive Fetch Test</h3>
      
      <Button 
        onClick={testFetch}
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
            Testing...
          </>
        ) : 'Test Drive Connection'}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-red-600 font-medium">Error</h4>
          <p className="text-red-500 mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-background border border-green-200 rounded-md">
          <h4 className="text-green-600 font-medium">Success!</h4>
          <div className="mt-2">
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}   