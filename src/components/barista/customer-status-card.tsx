import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CustomerStatus } from "@/lib/actions/barista";

export function CustomerStatusCard({
  status,
  busy,
  onAddStamp,
  onConfirmReward,
}: {
  status: CustomerStatus;
  busy: boolean;
  onAddStamp: () => void;
  onConfirmReward: () => void;
}) {
  return (
    <Card className="flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {status.name}
          </p>
          {status.eligible && (
            <Badge className="shrink-0 border-transparent bg-reward text-reward-foreground">
              Siap Diklaim
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {status.email} &middot; {status.stamps}/{status.threshold} stempel
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
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
        <Button size="sm" type="button" disabled={busy} onClick={onAddStamp}>
          Tambah Stempel
        </Button>
      </div>
    </Card>
  );
}
