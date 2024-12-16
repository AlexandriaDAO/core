import React from "react";
import { StepProps, Steps } from "antd";

interface ProcessingStepsProps {
    status: number,
    percent: number|undefined,
    items: StepProps[]
}

const ProcessingSteps:React.FC<ProcessingStepsProps> = ({status, percent, items}) => {
    return (
        <Steps
            className={`
                py-4 [&_.ant-steps-item-icon]:transition-colors 
                [&_.ant-steps-item-icon]:duration-300

                [&_.ant-steps-item-finish_.ant-steps-item-icon]:!bg-constructive-foreground
                [&_.ant-steps-item-finish_.ant-steps-item-icon]:!border-constructive
                [&_.ant-steps-item-finish_.ant-steps-item-icon_.ant-steps-icon]:!text-info

                [&_.ant-steps-item-process_.ant-steps-item-icon]:!bg-transparent
                [&_.ant-steps-item-process_.ant-steps-item-icon]:!border-${!percent ? 'primary' : 'none'}
                [&_.ant-steps-item-process_.ant-steps-item-icon_.ant-steps-icon]:!text-primary

                [&_.ant-steps-item-wait_.ant-steps-item-icon]:!bg-secondary
                [&_.ant-steps-item-wait_.ant-steps-item-icon]:!border-ring
                [&_.ant-steps-item-wait_.ant-steps-item-icon_.ant-steps-icon]:!text-muted-foreground
            `}
            direction="vertical"
            size="small"
            current={status}
            percent={percent}
            items={items}
        />
    );
};

export default ProcessingSteps;
