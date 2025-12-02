import React from "react";

interface ComposeProvidersProps {
    providers: Array<React.ComponentType<{ children: React.ReactNode }>>;
    children: React.ReactNode;
}

const ComposeProviders: React.FC<ComposeProvidersProps> = ({ providers, children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
};

export default ComposeProviders