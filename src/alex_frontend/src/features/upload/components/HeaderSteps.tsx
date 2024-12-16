import React from "react";
import { Steps, StepProps } from "antd";

interface HeaderStepsProps {
    screen: number,
    items: StepProps[]
}

const HeaderSteps:React.FC<HeaderStepsProps> = ({screen, items}) => {
    return (
        <Steps
            size="small"
            current={screen}
            className="
                [&_.ant-steps-item-icon]:transition-colors 
                [&_.ant-steps-item-icon]:duration-300

                [&_.ant-steps-item-finish_.ant-steps-item-icon]:!bg-constructive-foreground
                [&_.ant-steps-item-finish_.ant-steps-item-icon]:!border-constructive
                [&_.ant-steps-item-finish_.ant-steps-item-icon_.ant-steps-icon]:!text-info

                [&_.ant-steps-item-process_.ant-steps-item-icon]:!bg-transparent
                [&_.ant-steps-item-process_.ant-steps-item-icon]:!border-primary
                [&_.ant-steps-item-process_.ant-steps-item-icon_.ant-steps-icon]:!text-primary

                [&_.ant-steps-item-wait_.ant-steps-item-icon]:!bg-secondary
                [&_.ant-steps-item-wait_.ant-steps-item-icon]:!border-ring
                [&_.ant-steps-item-wait_.ant-steps-item-icon_.ant-steps-icon]:!text-muted-foreground
            "
            items={items}
        />
    );
};

export default HeaderSteps;
