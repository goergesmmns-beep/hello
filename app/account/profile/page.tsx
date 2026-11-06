import { PageTitle } from "@/components/desk/panel";
import { ProfileForm } from "@/components/account/profile-form";
import { me } from "@/lib/my";
export default async function Profile() { const u = await me(); return <><PageTitle title="Profile" sub="Advisors see this when you request a listing. A complete profile moves you through faster." /><ProfileForm u={u} /></>; }
