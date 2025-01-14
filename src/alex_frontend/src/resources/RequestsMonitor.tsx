import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";
import { Button } from "@/lib/components/button";
import { Badge } from "@/lib/components/badge";
import { Checkbox } from "@/lib/components/checkbox";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";

interface MonitoredRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  timestamp: number;
  duration: number;
  initiatorType: string;
  size: number;
}

interface Filters {
  showStatic: boolean;
  showNpm: boolean;
  urlFilter: string;
  showErrors: boolean;
}

const RequestsMonitor: React.FC = () => {
  const [requests, setRequests] = useState<MonitoredRequest[]>([]);
  const [filters, setFilters] = useState<Filters>({
    showStatic: true,
    showNpm: true,
    urlFilter: '',
    showErrors: true,
  });

  useEffect(() => {
    // Track all resource timing entries
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      
      entries.forEach((entry) => {
        // Skip based on filters
        if (!filters.showStatic && (
          entry.initiatorType === 'css' || 
          entry.initiatorType === 'img' || 
          entry.initiatorType === 'script' ||
          entry.initiatorType === 'link'
        )) {
          return;
        }

        // Skip npm requests if filter is off
        if (!filters.showNpm && entry.name.includes('npm')) {
          return;
        }

        const request: MonitoredRequest = {
          id: Math.random().toString(36).substring(7),
          url: entry.name,
          method: 'Unknown',
          status: entry.transferSize > 0 ? 200 : 0,
          timestamp: entry.startTime + performance.timeOrigin,
          duration: entry.duration,
          initiatorType: entry.initiatorType,
          size: entry.transferSize
        };

        setRequests(prev => {
          // Avoid duplicate entries
          if (prev.some(r => r.url === request.url && 
              Math.abs(r.timestamp - request.timestamp) < 100)) {
            return prev;
          }
          return [request, ...prev];
        });
      });
    });

    // Track XHR requests
    const originalXHR = window.XMLHttpRequest.prototype.open;
    const originalSend = window.XMLHttpRequest.prototype.send;
    
    window.XMLHttpRequest.prototype.open = function(method: string, url: string | URL) {
      (this as any)._method = method;
      (this as any)._url = url.toString();
      (this as any)._startTime = performance.now();
      return originalXHR.apply(this, arguments as any);
    };

    window.XMLHttpRequest.prototype.send = function() {
      const xhr = this;
      const startTime = (xhr as any)._startTime;
      const method = (xhr as any)._method;
      const url = (xhr as any)._url;

      xhr.addEventListener('loadend', function() {
        const duration = performance.now() - startTime;
        
        // Skip npm requests if filter is off
        if (!filters.showNpm && url.includes('npm')) {
          return;
        }

        const request: MonitoredRequest = {
          id: Math.random().toString(36).substring(7),
          url,
          method,
          status: xhr.status,
          timestamp: Date.now(),
          duration,
          initiatorType: 'xhr',
          size: parseInt(xhr.getResponseHeader('content-length') || '0', 10)
        };

        // Only add if it's an error and errors are shown, or if it's not filtered
        if ((xhr.status >= 400 && filters.showErrors) || xhr.status < 400) {
          setRequests(prev => [request, ...prev]);
        }
      });

      return originalSend.apply(this, arguments as any);
    };

    // Start observing resource timing entries
    observer.observe({ entryTypes: ['resource'] });

    // Also track fetch requests to get method information
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const startTime = performance.now();
      const id = Math.random().toString(36).substring(7);
      
      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - startTime;
        
        const url = input instanceof URL ? input.toString() : (typeof input === 'string' ? input : input.url);
        
        // Skip npm requests if filter is off
        if (!filters.showNpm && url.includes('npm')) {
          return response;
        }

        const request: MonitoredRequest = {
          id,
          url,
          method: init?.method || (input instanceof Request ? input.method : 'GET'),
          status: response.status,
          timestamp: Date.now(),
          duration,
          initiatorType: 'fetch',
          size: parseInt(response.headers.get('content-length') || '0', 10)
        };
        
        // Only add if it's an error and errors are shown, or if it's not filtered
        if ((response.status >= 400 && filters.showErrors) || response.status < 400) {
          setRequests(prev => [request, ...prev]);
        }

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        const url = input instanceof URL ? input.toString() : (typeof input === 'string' ? input : input.url);
        
        // Skip npm requests if filter is off
        if (!filters.showNpm && url.includes('npm')) {
          throw error;
        }

        const request: MonitoredRequest = {
          id,
          url,
          method: init?.method || (input instanceof Request ? input.method : 'GET'),
          status: 0,
          timestamp: Date.now(),
          duration,
          initiatorType: 'fetch',
          size: 0
        };
        
        if (filters.showErrors) {
          setRequests(prev => [request, ...prev]);
        }
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
      window.XMLHttpRequest.prototype.open = originalXHR;
      window.XMLHttpRequest.prototype.send = originalSend;
      observer.disconnect();
    };
  }, [filters]);

  const clearRequests = () => setRequests([]);

  const copyToClipboard = () => {
    const text = requests
      .map(r => `${r.method} ${r.url} - Status: ${r.status} - Size: ${(r.size / 1024).toFixed(1)}KB - Duration: ${r.duration.toFixed(2)}ms - Type: ${r.initiatorType}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const filteredRequests = requests.filter(request => {
    if (filters.urlFilter && !request.url.toLowerCase().includes(filters.urlFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const errorCount = filteredRequests.filter(r => r.status >= 400).length;
  const rate429Count = filteredRequests.filter(r => r.status === 429).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>Network Monitor ({filteredRequests.length} requests)</span>
            {errorCount > 0 && (
              <Badge variant="destructive">
                {errorCount} Errors
              </Badge>
            )}
            {rate429Count > 0 && (
              <Badge variant="destructive">
                {rate429Count} Rate Limits (429)
              </Badge>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={clearRequests}>
              Clear
            </Button>
            <Button onClick={copyToClipboard}>
              Copy to Clipboard
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showStatic" 
                checked={filters.showStatic}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showStatic: checked as boolean }))}
              />
              <Label htmlFor="showStatic">Show Static Assets</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showNpm" 
                checked={filters.showNpm}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showNpm: checked as boolean }))}
              />
              <Label htmlFor="showNpm">Show NPM Requests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showErrors" 
                checked={filters.showErrors}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, showErrors: checked as boolean }))}
              />
              <Label htmlFor="showErrors">Show Errors Only</Label>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="urlFilter">Filter URL:</Label>
            <Input
              id="urlFilter"
              value={filters.urlFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, urlFilter: e.target.value }))}
              placeholder="Enter URL filter..."
              className="max-w-sm"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow 
                key={request.id}
                className={request.status === 429 ? 'bg-red-50' : ''}
              >
                <TableCell>
                  <Badge variant="outline">
                    {request.initiatorType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={request.method === 'GET' ? 'default' : 'secondary'}>
                    {request.method}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">{request.url}</TableCell>
                <TableCell>
                  <Badge 
                    variant={request.status >= 400 ? 'destructive' : 'default'}
                  >
                    {request.status || 'Failed'}
                  </Badge>
                </TableCell>
                <TableCell>{(request.size / 1024).toFixed(1)}KB</TableCell>
                <TableCell>{request.duration.toFixed(2)}ms</TableCell>
                <TableCell>{new Date(request.timestamp).toLocaleTimeString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RequestsMonitor;
