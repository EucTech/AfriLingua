"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth/store/useAuth";

export function DeleteAccountCard() {
  const router = useRouter();
  const logout = useAuth((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => api.delete("/users/me", { password }),
    onSuccess: () => {
      toast.success("Account deleted");
      logout();
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Couldn't delete your account.");
    },
  });

  const openDialog = () => {
    setPassword("");
    setOpen(true);
  };

  return (
    <section className="border-destructive/30 bg-card rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TriangleAlert className="text-destructive" size={18} />
          <div>
            <h2 className="text-foreground text-base font-semibold">Danger zone</h2>
            <p className="text-muted-foreground text-xs">
              Permanently delete your account and all of your data. This can&apos;t be undone.
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={openDialog}>
          Delete account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground text-sm">
            This permanently deletes your profile, progress, chats, and call history. Enter your password to
            confirm.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="delete-password">Password</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={!password || deleteMutation.isPending}
              className="w-full"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
