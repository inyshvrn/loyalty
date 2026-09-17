import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestInitialGrantDialog } from "@/components/barista/request-initial-grant-dialog";
import { ConfirmRewardDialog } from "@/components/barista/confirm-reward-dialog";
import type { CustomerStatus } from "@/lib/actions/barista";

export function CustomerStatusCard({
  status,
  busy,
  onAddStamp,
  onConfirmReward,
  onGrantRequested,
}: {
  status: CustomerStatus;
  busy: boolean;
  onAddStamp: () => void;
  onConfirmReward: () => void;
  onGrantRequested?: (data: CustomerStatus) => void;
}) {
  return (
    <Card className="flex-col gap-3 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {status.name}
            </p>
            {!status.emailVerified && (
              <Badge variant="outline" className="shrink-0">
                Belum Verifikasi
              </Badge>
            )}
            {status.eligible && (
              <Badge className="shrink-0 border-transparent bg-reward text-reward-foreground">
                Siap Diklaim
              </Badge>
            )}
            {status.pendingGrantRequest && (
              <Badge variant="outline" className="shrink-0">
                +{status.pendingGrantRequest.count} perlu ditinjau admin
              </Badge>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {status.email} &middot; {status.stamps}/{status.threshold} stempel
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {status.eligibleForInitialGrant && onGrantRequested && (
            <RequestInitialGrantDialog
              customerId={status.id}
              customerName={status.name}
              onRequested={onGrantRequested}
            />
          )}
          <Button
            size="sm"
            type="button"
            className="h-11"
            disabled={
              busy || !status.emailVerified || status.stamps > status.threshold
            }
            onClick={onAddStamp}
          >
            Tambah Stempel
          </Button>
        </div>
      </div>
      {/* On its own row, full-width, well below Tambah Stempel — a claim
       * resets progress, so it shouldn't sit close enough to that button
       * for a rushed tap to land on the wrong one. */}
      {status.eligible && (
        <ConfirmRewardDialog
          customerId={status.id}
          customerName={status.name}
          busy={busy}
          onConfirm={onConfirmReward}
        />
      )}
    </Card>
  );
}
