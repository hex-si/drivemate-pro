import { useState, useEffect } from "react";
import { hubService } from "@/services/hubService";

export function useHubConnection() {
  const [hubConnected, setHubConnected] = useState(hubService.isConnected);

  useEffect(() => {
    setHubConnected(hubService.isConnected);
    const unsub = hubService.onConnectionChange(setHubConnected);
    return () => { unsub(); };
  }, []);

  return hubConnected;
}
