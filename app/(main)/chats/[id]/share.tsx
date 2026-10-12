"use client";

import ShareIcon from "@/components/icons/share-icon";
import { toast } from "@/hooks/use-toast";
import { Message } from "@prisma/client";

export function Share({ message }: { message?: Message }) {
  async function shareAction() {
    if (!message) {
      console.log('Share: No message provided');
      return;
    }

    console.log('Share: message.id:', message.id);
    console.log('Share: message.role:', message.role);
    
    const baseUrl = window.location.href;
    const shareUrl = new URL(`/share/v2/${message.id}`, baseUrl);
    console.log('Share: Generated URL:', shareUrl.href);

    toast({
      title: "App Published!",
      description: `App URL copied to clipboard: ${shareUrl.href}`,
      variant: "default",
    });

    try {
      await navigator.clipboard.writeText(shareUrl.href);
      console.log('Share: URL copied to clipboard successfully');
    } catch (error) {
      console.error('Share: Failed to copy to clipboard:', error);
    }
  }

  return (
    <form action={shareAction} className="flex">
      <button
        type="submit"
        disabled={!message}
        className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-sm text-foreground enabled:hover:bg-accent enabled:hover:text-accent-foreground disabled:opacity-50 transition-colors"
        title={message ? `Share dashboard (ID: ${message.id})` : 'No message to share'}
      >
        <ShareIcon className="size-3" />
        Share
      </button>
    </form>
  );
}
