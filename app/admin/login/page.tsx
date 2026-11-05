import { Wordmark } from "@/components/chrome";
import { LoginForm } from "@/components/desk/actions";
export default function Login() {
  return <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5"><div className="aurora" aria-hidden><i /><i /></div><div className="gborder relative w-full max-w-sm rounded-xl p-7"><Wordmark /><h1 className="mb-6 mt-7 text-3xl font-semibold">Advisor desk</h1><LoginForm /></div></main>;
}
