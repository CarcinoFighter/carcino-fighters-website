// components/SyncButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      alert(`Sync successful! Updated ${result.updated} documents`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      onClick={triggerSync}
      disabled={isSyncing}
      variant="outline"
    >
      {isSyncing ? 'Syncing...' : 'Sync Documents Now'}
    </Button>
  );
}