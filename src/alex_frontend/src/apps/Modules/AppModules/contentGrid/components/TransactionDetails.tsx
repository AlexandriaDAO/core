import React from "react";
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { Copy } from 'lucide-react';
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/card";
import { ScrollArea } from "@/lib/components/scroll-area";
import { Badge } from "@/lib/components/badge";
import { Separator } from "@/lib/components/separator";

const truncateMiddle = (str: string, startChars: number = 4, endChars: number = 4) => {
  if (str.length <= startChars + endChars + 3) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

interface TransactionDetailsProps {
  transaction: Transaction;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label} to clipboard`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="absolute inset-0 bg-black/90 opacity-0 hidden md:block group-hover:opacity-100 transition-opacity duration-200 z-[20]">
      <ScrollArea className="h-full">
        <Card className="bg-transparent border-none text-gray-100 shadow-none">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-medium">Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center group/item cursor-pointer hover:bg-gray-800/50 p-1 rounded"
                   onClick={() => copyToClipboard(transaction.id, 'ID')}>
                <span className="text-gray-400">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono truncate ml-2 max-w-[180px]">{transaction.id}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100" />
                </div>
              </div>
              <div className="flex justify-between items-center group/item cursor-pointer hover:bg-gray-800/50 p-1 rounded"
                   onClick={() => copyToClipboard(transaction.owner, 'Owner address')}>
                <span className="text-gray-400">Owner</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono truncate ml-2 max-w-[180px]">{transaction.owner}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover/item:opacity-100" />
                </div>
              </div>
              {transaction.data && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Size</span>
                  <span>{(transaction.data.size / 1024).toFixed(2)} KB</span>
                </div>
              )}
              {transaction.block && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span>
                    {new Date(transaction.block.timestamp * 1000).toLocaleString('en-US', {
                      timeZone: 'UTC'
                    })} UTC
                  </span>
                </div>
              )}
            </div>

            <Separator className="bg-gray-700" />
            
            <div className="space-y-2">
              <span className="text-gray-400">Tags</span>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    title={`${tag.name}: ${tag.value}`}
                    className="bg-gray-800 text-gray-200 cursor-pointer hover:bg-gray-700 group/badge flex items-center gap-1"
                    onClick={() => copyToClipboard(`${tag.name}: ${tag.value}`, 'Tag')}
                  >
                    {truncateMiddle(tag.name)}: {truncateMiddle(tag.value)}
                    <Copy className="w-3 h-3 opacity-0 group-hover/badge:opacity-100" />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default TransactionDetails; 