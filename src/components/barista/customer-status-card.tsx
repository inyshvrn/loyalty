import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestInitialGrantDialog } from "@/components/barista/request-initial-grant-dialog";
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
    <Card className="flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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
              Menunggu approval &middot; +{status.pendingGrantRequest.count}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {status.email} &middot; {status.stamps}/{status.threshold} stempel
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {status.eligibleForInitialGrant && onGrantRequested && (
          <RequestInitialGrantDialog
            customerId={status.id}
            customerName={status.name}
            onRequested={onGrantRequested}
          />
        )}
        {status.eligible && (
          <Button
            size="sm"
            type="button"
            disabled={busy}
            onClick={onConfirmReward}
            className="bg-reward text-reward-foreground hover:bg-reward/90"
          >
            Konfirmasi Reward
          </Button>
        )}
        <Button
          size="sm"
          type="button"
          disabled={busy || !status.emailVerified}
          onClick={onAddStamp}
        >
          Tambah Stempel
        </Button>
      </div>
    </Card>
  );
}
