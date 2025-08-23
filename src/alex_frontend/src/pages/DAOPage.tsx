import React, { useEffect, useState } from 'react';
import { useOrbitStation } from '@/hooks/actors';
import { Badge } from '@/lib/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/card';
import { Skeleton } from '@/lib/components/skeleton';
import { toast } from 'sonner';
import type { 
  ListRequestsInput, 
  Request,
  RequestStatusCode,
  ListRequestsOperationType
} from '../../../declarations/orbit_station/orbit_station.did';

export default function DAOPage() {
  const { actor } = useOrbitStation();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DAOPage] Actor status:', actor ? 'initialized' : 'not initialized');
    if (!actor) {
      console.log('[DAOPage] Waiting for actor initialization...');
      return;
    }
    
    fetchRequests();
  }, [actor]);

  const fetchRequests = async () => {
    if (!actor) {
      console.error('[DAOPage] Actor not initialized when fetchRequests called');
      setError('Actor not initialized');
      setLoading(false);
      return;
    }

    console.log('[DAOPage] Starting to fetch requests...');
    try {
      setLoading(true);
      setError(null);

      // Prepare the input for list_requests
      const input: ListRequestsInput = {
        operation_types: [[{ ManageSystemInfo: null } as ListRequestsOperationType]],
        statuses: [], // Empty array for any status
        paginate: [{
          limit: [BigInt(20)],
          offset: []
        }],
        sort_by: [{
          CreatedAt: { Desc: null }
        }],
        only_approvable: false,
        with_evaluation_results: false,
        created_from_dt: [],
        created_to_dt: [],
        expiration_from_dt: [],
        expiration_to_dt: [],
        requester_ids: [],
        approver_ids: []
      };

      console.log('[DAOPage] Calling list_requests with input:', input);
      const result = await actor.list_requests(input);
      console.log('[DAOPage] Received result:', result);

      if ('Ok' in result) {
        console.log('[DAOPage] Success! Found', result.Ok.requests.length, 'requests');
        setRequests(result.Ok.requests);
        if (result.Ok.requests.length === 0) {
          setError('No requests found. This may be due to anonymous access restrictions.');
        }
      } else {
        setError('Failed to fetch requests: ' + JSON.stringify(result.Err));
        toast.error('Failed to fetch DAO requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Error connecting to Orbit Station: ' + String(err));
      toast.error('Error connecting to Orbit Station');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: any): string => {
    if ('Approved' in status) return 'bg-green-500';
    if ('Created' in status) return 'bg-yellow-500';
    if ('Rejected' in status) return 'bg-red-500';
    if ('Completed' in status) return 'bg-blue-500';
    if ('Processing' in status) return 'bg-purple-500';
    if ('Cancelled' in status) return 'bg-gray-500';
    if ('Failed' in status) return 'bg-red-700';
    if ('Scheduled' in status) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const getStatusLabel = (status: any): string => {
    if ('Approved' in status) return 'Approved';
    if ('Created' in status) return 'Pending';
    if ('Rejected' in status) return 'Rejected';
    if ('Completed' in status) return 'Completed';
    if ('Processing' in status) return 'Processing';
    if ('Cancelled' in status) return 'Cancelled';
    if ('Failed' in status) return 'Failed';
    if ('Scheduled' in status) return 'Scheduled';
    return 'Unknown';
  };

  const extractManageSystemInfo = (operation: any) => {
    if ('ManageSystemInfo' in operation) {
      const { input } = operation.ManageSystemInfo;
      return {
        name: input.name?.[0] || 'No name change',
        cycleObtainStrategy: input.cycle_obtain_strategy?.[0] || null
      };
    }
    return null;
  };

  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">DAO Proposals</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">DAO Proposals</h1>
        
        {error && (
          <Card className="mb-6 border-yellow-500">
            <CardContent className="pt-6">
              <p className="text-yellow-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {requests.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">No ManageSystemInfo requests found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Note: Anonymous access may have limited visibility to requests.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {requests.map((request) => {
            const systemInfo = extractManageSystemInfo(request.operation);
            if (!systemInfo) return null;

            return (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{request.title}</CardTitle>
                      {request.summary?.[0] && (
                        <CardDescription className="mt-2">
                          {request.summary[0]}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(request.status)} text-white`}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">System Name Change:</span>
                      <span className="font-medium">{systemInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{formatDate(request.created_at)}</span>
                    </div>
                    {request.expiration_dt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expires:</span>
                        <span>{formatDate(request.expiration_dt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Approvals:</span>
                      <span>{request.approvals.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
  );
}