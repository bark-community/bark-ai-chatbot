import React from 'react';

import { cn } from '@/lib/utils';
import { ExternalLink } from '@/components/external-link';

// FooterText component: Displays a footer paragraph with external links and a BARK reference
export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      Open source AI chatbot with BARK integration, powered by{' '}
      <ExternalLink href="https://solana.com">Solana</ExternalLink> and{' '}
      <ExternalLink href="https://openai.com">OpenAI</ExternalLink>. Learn more in our{' '}
      <ExternalLink href="https://doc.barkchatbot.app">Documentation</ExternalLink> and check out the{' '}
      <ExternalLink href="https://github.com/bark-community/bark-ai-chatbot">BARK AI Chatbot</ExternalLink>.
    </p>
  );
}

