import { Camera, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const searchResults = [
  { name: "Sarah Wijaya", progress: "6/10 stempel" },
  { name: "Budi Santoso", progress: "9/10 stempel" },
];

export default function ScanPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">
        Scan Pelanggan
      </h1>

      <Tabs defaultValue="scan" className="flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="scan">
            <Camera className="size-4" />
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Search className="size-4" />
            Cari Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4">
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary text-muted-foreground">
            <Camera className="size-8" strokeWidth={1.5} />
            <p className="text-sm font-medium">Arahkan ke QR pelanggan</p>
            <p className="text-xs">Kamera akan aktif di sini</p>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau nomor HP"
              className="pl-8"
            />
          </div>
          <div className="flex flex-col gap-2">
            {searchResults.map((result) => (
              <Card
                key={result.name}
                className="flex-row items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {result.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.progress}
                  </p>
                </div>
                <Button size="sm" type="button">
                  Tambah Stempel
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
