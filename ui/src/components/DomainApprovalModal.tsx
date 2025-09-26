import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Globe, Shield } from 'lucide-react';

interface DomainApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  domain: string;
  purpose: string;
  onApprove: () => void;
  onDeny: () => void;
}

const DomainApprovalModal: React.FC<DomainApprovalModalProps> = ({
  isOpen,
  onClose,
  url,
  domain,
  purpose,
  onApprove,
  onDeny
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[var(--figma-color-bg)] border-[var(--figma-color-border)]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[var(--figma-color-text)] text-lg font-semibold">
                Domain Access Request
              </DialogTitle>
              <DialogDescription className="text-[var(--figma-color-text-secondary)] text-sm">
                The plugin wants to access a new domain
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mb-4">
          {/* Domain Info */}
          <div className="mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex gap-2 items-baseline">
                <span className="text-[var(--figma-color-text-secondary)] min-w-16">Domain: </span>

                <code className="bg-[var(--figma-color-bg-secondary)] px-2 py-1 rounded text-[var(--figma-color-text)] font-mono">
                  {domain}
                </code>
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="text-[var(--figma-color-text-secondary)] min-w-16">Full URL: </span>
                <code className="bg-[var(--figma-color-bg-secondary)] px-2 py-1 rounded text-[var(--figma-color-text)] font-mono break-all">
                  {url}
                </code>
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="text-[var(--figma-color-text-secondary)] min-w-16">Purpose: </span>

                <span className="text-[var(--figma-color-text)]">{purpose}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Security Notice for Wildcard Access */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-800 font-semibold mb-2"> WILDCARD ACCESS ENABLED</p>
                <p className="text-red-700 mb-3 text-xs font-bold">
                  This plugin has wildcard network access. Exercise extreme caution when approving new domains.
                </p>
                <ul className="text-red-700 space-y-1 text-xs">
                  <li>This approval is temporary for the current session only</li>
                  <li>Only approve domains from trusted sources</li>
                  <li>Malicious domains can potentially steal data or perform harmful actions</li>
                  <li>Rate limited to {purpose.includes('WILDCARD') ? '250 requests per hour per domain' : 'standard limits'}</li>
                  <li>All requests are logged for security monitoring</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[var(--figma-color-bg-secondary)] rounded-lg p-4 border border-[var(--figma-color-border)]">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-[var(--figma-color-text)] font-medium mb-1">Security Features Active</p>
                <ul className="text-[var(--figma-color-text)] space-y-1 text-xs">
                  <li>HTTPS-only connections enforced</li>
                  <li>Private/internal URLs blocked</li>
                  <li>Suspicious domains automatically blocked</li>
                  <li>User approval required for each new domain</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDeny}
            className="w-full sm:w-auto bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] hover:bg-[var(--figma-color-bg-hover)]"
          >
            Deny Access
          </Button>
          <Button
            onClick={onApprove}
            className="w-full sm:w-auto bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text-onbrand)] hover:bg-[var(--figma-color-bg-brand-hover)]"
          >
            Approve Domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DomainApprovalModal;
