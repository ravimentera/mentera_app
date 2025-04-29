import { redirect } from "next/navigation";
import { registrationSteps } from "../config/formConfig";

export default function StepsIndexPage() {
  const firstStep = registrationSteps[0].id;
  redirect(`/register/steps/${firstStep}`);
}
