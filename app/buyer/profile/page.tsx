import { PageTitle } from "@/components/desk/panel";
import { ProfileForm } from "@/components/account/profile-form";
import { me } from "@/lib/my";
export const metadata = { title: "Buyer profile" };
export default async function Profile() { const u = await me("/buyer/profile"); return <><PageTitle title="Buyer profile" sub="Sent with every listing you request, so you never fill it in twice." /><ProfileForm u={u} /></>; }
