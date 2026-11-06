import { PageTitle } from "@/components/desk/panel";
import { ValuationWizard } from "@/components/valuation-wizard";
export const metadata = { title: "Valuation" };
export default function Valuation() { return <><PageTitle title="What is it worth?" sub="A quick range from your numbers. Your advisor confirms the final price with you." /><div className="panel"><div className="well p-5 md:p-8"><ValuationWizard /></div></div></>; }
