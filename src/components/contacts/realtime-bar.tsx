"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";

interface RealtimeBarProps {
  lastUpdated: Date | null;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

export function RealtimeBar({ lastUpdated, onRefresh, isRefreshing = false }: RealtimeBarProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [timeAgo, setTimeAgo] = useState<string>("");

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update time ago display
  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 30) {
        setTimeAgo("Just now");
      } else if (seconds < 60) {
        setTimeAgo(`${seconds} seconds ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} minute${minutes === 1 ? '' : 's'} ago`);
      } else {
        setTimeAgo(`${hours} hour${hours === 1 ? '' : 's'} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = async () => {
    if (!isRefreshing) {
      await onRefresh();
    }
  };

  return (
    <div className="bg-card border rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-600" />
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs py-0 px-2 h-6">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-600" />
                <Badge variant="outline" className="text-red-700 border-red-300 text-xs py-0 px-2 h-6">
                  Offline
                </Badge>
              </>
            )}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Updated: {timeAgo}
              </span>
            </div>
          )}

          {/* Auto-refresh indicator */}
          <Badge variant="secondary" className="text-xs py-0 px-2 h-6">
            Auto: 30s
          </Badge>
        </div>

        {/* Manual Refresh Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || !isOnline}
          className="gap-1.5 h-7 px-3 text-xs"
        >
          <RefreshCw 
            className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {!isOnline && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ You're offline. Data may not be up to date.
        </div>
      )}
    </div>
  );
}