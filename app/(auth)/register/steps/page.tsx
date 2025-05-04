import { redirect } from "next/navigation";
import { REGISTRATION_STEPS } from "../config/formConfig";

export default function StepsIndexPage() {
  const firstStep = REGISTRATION_STEPS[0].id;
  redirect(`/register/steps/${firstStep}`);
}
