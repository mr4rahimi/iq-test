import { notFound } from "next/navigation";
import type { ModeId, SectionId } from "@/lib/types";
import { MODES, SECTIONS } from "@/lib/sections";
import { TestRunner } from "@/components/TestRunner";

export default async function TestPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { mode } = await params;
  const { section } = await searchParams;
  if (!(mode in MODES)) notFound();
  if (mode === "practice" && !(section && section in SECTIONS)) notFound();
  return (
    <TestRunner
      mode={mode as ModeId}
      section={mode === "practice" ? (section as SectionId) : undefined}
    />
  );
}
