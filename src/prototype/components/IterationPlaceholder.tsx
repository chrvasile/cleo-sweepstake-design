import React from 'react';
import { Center, SafeArea, Typography, VStack } from '../../design-system/components';

type IterationPlaceholderProps = {
  label: string;
};

export const IterationPlaceholder: React.FC<IterationPlaceholderProps> = ({ label }) => (
  <SafeArea className="h-full w-full">
    <Center>
      <VStack gap="XXS" className="items-center px-M text-center">
        <Typography type="title" size="M" color="var(--content-primary)">
          {label}
        </Typography>
        <Typography type="body" size="M" color="var(--content-secondary)">
          This iteration doesn't have screens yet.
        </Typography>
      </VStack>
    </Center>
  </SafeArea>
);
