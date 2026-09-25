"use client";

import { Download, Send } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { markLetterGenerated, setLetterStatus } from "@/actions/offer-letters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { BUCKETS } from "@/lib/constants";
import { buildOfferLetterPdf, type OfferLetterData, type TemplateBody } from "@/lib/pdf/offer-letter";
import type { CompanySettings } from "@/lib/pdf/shared";
import { createClient } from "@/lib/supabase/client";
import type { LetterStatus } from "@/types";

/**
 * Builds the PDF in the browser, shows it, and stores it in the offer-letters
 * bucket at <letter id>.pdf when the admin downloads or sends it.
 */
export function LetterPreview({
  letter,
  template,
  company,
  status,
}: {
  letter: OfferLetterData & { id: string };
  template: TemplateBody;
  company: CompanySettings;
  status: LetterStatus;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let objectUrl: string | null = null;
    buildOfferLetterPdf(letter, template, company)
      .then((made) => {
        setBlob(made);
        objectUrl = URL.createObjectURL(made);
        setUrl(objectUrl);
      })
      .catch(() => toast.error("The letter could not be drawn."));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter.id]);

  function close() {
    const next = new URLSearchParams(params.toString());
    next.delete("preview");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  async function store() {
    if (!blob) return null;
    const supabase = createClient();
    const path = `${letter.id}.pdf`;
    const { error } = await supabase.storage.from(BUCKETS.offerLetters).upload(path, blob, {
      upsert: true,
      contentType: "application/pdf",
    });
    if (error) {
      toast.error(error.message);
      return null;
    }
    await markLetterGenerated(letter.id, path);
    return path;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{letter.candidateName}</DialogTitle>
          <DialogDescription>
            {letter.letterNo} · page 1 is the offer, page 2 the terms from the active template.
          </DialogDescription>
        </DialogHeader>

        {url ? (
          <iframe src={url} title="Offer letter preview" className="h-[60vh] w-full rounded-lg border bg-muted" />
        ) : (
          <Skeleton className="h-[60vh] w-full" />
        )}

        <DialogFooter>
          <Button
            variant="outline"
            loading={pending}
            disabled={!blob}
            onClick={() =>
              start(async () => {
                await store();
                const a = document.createElement("a");
                a.href = url!;
                a.download = `${letter.letterNo.replace(/\//g, "-")}.pdf`;
                a.click();
                router.refresh();
              })
            }
          >
            <Download /> Download
          </Button>
          <Button
            loading={pending}
            disabled={!blob || status === "sent"}
            onClick={() =>
              start(async () => {
                await store();
                const result = await setLetterStatus(letter.id, "sent");
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Marked as sent");
                close();
                router.refresh();
              })
            }
          >
            <Send /> {status === "sent" ? "Already sent" : "Mark sent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
