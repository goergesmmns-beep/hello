import { promises as fs } from "fs";
import path from "path";
import { catalog, isOpen } from "./catalog";
import { config } from "./pipedrive";
import { getFollowups } from "./reminders";
import { fileIds } from "./store";

/** The launch checklist shown on Connections and in the sidebar. */
export async function launchChecks(): Promise<[string, boolean, string][]> {
  const c = await config().catch(() => null);
  const cims = await fs.readdir(path.join(process.cwd(), "private", "cims")).catch(() => [] as string[]);
  const open = (await catalog()).filter(isOpen); const stored = await fileIds("cim:").catch(() => [] as string[]);
  const have = open.filter((l) => cims.includes(`${l.slug}.pdf`) || stored.includes(`cim:${l.slug}`)).length;
  return [
    ["Database", !!process.env.DATABASE_URL, "Stores buyers, documents and settings"],
    ["Pipedrive", !!c?.pipelineId, c ? "Connected. Choose a pipeline if this is not ticked." : "Connect below"],
    ["Live email", !!process.env.RESEND_API_KEY, "Add RESEND_API_KEY, MAIL_FROM and ADVISOR_EMAIL"],
    ["Approved NDA", process.env.NDA_APPROVED === "true", "Add the approved NDA, then set NDA_APPROVED=true"],
    ["CIM files", have === open.length, `${have} of ${open.length} open listings have a real CIM`],
    ["Booking link", !!(await getFollowups().catch(() => ({ bookingUrl: "" }))).bookingUrl, "Add your calendar link below"],
    ["Test mode off", process.env.TEST_MODE !== "true", "Remove TEST_MODE before launch"],
  ];
}
