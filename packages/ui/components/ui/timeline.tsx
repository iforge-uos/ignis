import React from 'react';
import {cn} from "@ui/lib/utils";

const TimelineContent: React.FC<{ children: React.ReactNode }> = ({children}) => (
    <div className={cn("ml-4")}>{children}</div>
);

const TimelineDot: React.FC<{ isCompleted: boolean }> = ({isCompleted}) => (
    <div className={cn(
        "h-3 w-3 rounded-full",
        isCompleted ? "bg-ring" : "border-2 border-gray-700"
    )}></div>
);

type TimelineItemProps = {
    children: React.ReactNode;
    className?: string;
    isCompleted?: boolean;
    isCurrent?: boolean;
    orientation?: 'horizontal' | 'vertical';
};

const TimelineItem: React.FC<TimelineItemProps> = ({
                                                       children,
                                                       className,
                                                       isCompleted,
                                                       isCurrent,
                                                       orientation = 'vertical'
                                                   }) => (
    <div className={cn("flex", {
        "items-center": orientation === 'vertical',
        "flex-col items-start": orientation === 'horizontal',
    }, className, {
        "text-gray-600 dark:text-gray-400 uppercase": !isCurrent,
        "text-ring font-bold font-mono uppercase": isCurrent,
    })}>
        <TimelineDot isCompleted={!!isCompleted || !!isCurrent}/>
        {orientation === 'vertical' ? <TimelineContent>{children}</TimelineContent> :
            <div className="mt-2">{children}</div>}
    </div>
);

TimelineItem.displayName = "TimelineItem";

type TimelineProps = {
    children: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    currentStepIndex: number;
};
const Timeline: React.FC<TimelineProps> = ({children, orientation = 'vertical', currentStepIndex}) => {
    const timelineItems = React.Children.toArray(children);

    return (
        <div className={cn({
            "flex flex-col items-start": orientation === 'vertical',
            "flex flex-row items-center": orientation === 'horizontal',
        })}>
            {timelineItems.map((child, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        orientation === 'vertical' ?
                            <div
                                className={cn("h-16 w-[3px]  self-stretch ml-[4px]", index <= currentStepIndex ? "bg-gray-700" : "bg-gray-400")}></div> :
                            <div className={cn("w-16 h-[3px] bg-gray-400 self-stretch mt-[4px]")}></div>
                    )}
                    {React.cloneElement(child as React.ReactElement<any>, {
                        orientation,
                        isCompleted: index < currentStepIndex
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

Timeline.displayName = "Timeline";

export {Timeline, TimelineItem};
