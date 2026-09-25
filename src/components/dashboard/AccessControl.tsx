"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setAccessStatus } from "@/actions/enrollments";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/hooks/use-toast";
import type { AccessStatus } from "@/types";

export function AccessControl({ enrollmentId, status }: { enrollmentId: string; status: AccessStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <NativeSelect
      aria-label="Course access"
      value={status}
      disabled={pending}
      className="w-auto"
      onChange={(e) =>
        start(async () => {
          const result = await setAccessStatus(enrollmentId, e.target.value as AccessStatus);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Access updated");
          router.refresh();
        })
      }
    >
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
      <option value="completed">Completed</option>
      <option value="refunded">Refunded</option>
    </NativeSelect>
  );
}
