import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { SanityLive } from "@/lib/sanity/live";

export default async function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const previewEnabled = (await draftMode()).isEnabled;

  return (
    <>
      {children}
      <SanityLive />
      {previewEnabled ? (
        <>
          <VisualEditing />
          <DisableDraftMode />
        </>
      ) : null}
    </>
  );
}
