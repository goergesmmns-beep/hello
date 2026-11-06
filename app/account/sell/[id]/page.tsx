import { redirect } from "next/navigation";
/** Old email links still land on the right business. */
export default async function R({ params }: { params: Promise<{ id: string }> }) { redirect(`/seller/switch?id=${encodeURIComponent((await params).id)}&to=/seller/listing`); }
