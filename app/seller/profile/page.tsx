import { PageTitle } from "@/components/desk/panel";
import { ProfileForm } from "@/components/account/profile-form";
import { me } from "@/lib/my";
export const metadata = { title: "Your details" };
export default async function Profile() { const u = await me("/seller/profile"); return <><PageTitle title="Your details" sub="Private to you and your advisor." /><ProfileForm u={u} kind="seller" /></>; }
