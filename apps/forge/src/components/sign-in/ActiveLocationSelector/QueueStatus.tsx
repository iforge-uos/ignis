import {cn} from "@/lib/utils.ts";
import { Badge } from "@ui/components/ui/badge.tsx";
import { Ban } from "lucide-react";
import React from "react";

interface QueueStatusProps {
    queue_needed: boolean;
    count_in_queue: number;
    className?: string;
}

export const QueueStatus: React.FC<QueueStatusProps> = ({ queue_needed, count_in_queue, className }) => {
    if (!queue_needed) {
        return (
            <Badge variant="destructive" className={cn('text-lg', className)}>
                <Ban />
                <span className="ml-2">QUEUE DISABLED</span>
            </Badge>
        );
    }
    return (
        <Badge variant="success" className={cn('text-lg', className)}>
            <span>{count_in_queue}</span>
            <span className="ml-2">IN QUEUE</span>
        </Badge>
    );
};