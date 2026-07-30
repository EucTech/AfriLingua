"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { changePasswordSchema, type ChangePasswordValues } from "@/features/auth/schemas/auth.schemas";
import { api, ApiError } from "@/lib/api";

export function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const openDialog = () => {
    reset();
    setOpen(true);
  };

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await api.patch("/users/me/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password updated");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update your password.");
    }
  };

  return (
    <section className="bg-card border-border rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <KeyRound className="text-primary" size={18} />
          <div>
            <h2 className="text-foreground text-base font-semibold">Password</h2>
            <p className="text-muted-foreground text-xs">Update the password you use to sign in.</p>
          </div>
        </div>
        <Button variant="outline" onClick={openDialog}>
          Change password
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...register("currentPassword")} />
              {errors.currentPassword && (
                <p className="text-destructive text-xs">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...register("newPassword")} />
              {errors.newPassword && <p className="text-destructive text-xs">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating…" : "Update password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
