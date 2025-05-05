import { FEATURE_ICON_COLORS, GRADIENTS } from "@/app/constants/theme-constants";
import { GradientBackground } from "@/components/templates";
import Image from "next/image";

const features = [
  {
    id: "schedule",
    icon: "/assets/icons/schedule-icon.svg",
    text: "Smart patient scheduling & reminders",
    bgColor: FEATURE_ICON_COLORS.SCHEDULE,
  },
  {
    id: "dashboard",
    icon: "/assets/icons/dashboard-icon.svg",
    text: "Automated follow-up campaigns",
    bgColor: FEATURE_ICON_COLORS.DASHBOARD,
  },
  {
    id: "robot",
    icon: "/assets/icons/robot-icon.svg",
    text: "AI-powered treatment recommendations",
    bgColor: FEATURE_ICON_COLORS.ROBOT,
  },
];

const FeatureItem = ({ icon, text, bgColor }: { icon: string; text: string; bgColor: string }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${bgColor}`}>
      <Image src={icon} alt={text} width={20} height={20} className="w-5 h-5" />
    </div>
    <p className="text-gray-800">{text}</p>
  </div>
);

export function AuthMarketingSection() {
  return (
    <div className="hidden md:flex md:w-1/2 relative p-24 flex-col justify-between overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <GradientBackground gradientColors={GRADIENTS.AUTH_BACKGROUND} />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Image
          src="/logo-with-name-light.svg"
          alt="Mentera AI Logo"
          width={150}
          height={44}
          className="h-11 w-auto"
        />
      </div>

      {/* Marketing content */}
      <div className="relative z-10 max-w-md space-y-6">
        <p className="text-5xl font-bold bg-gradient-to-r from-[#111A53] to-[#BD05DD] bg-clip-text text-transparent">
          Transform your med-spa with Tera AI
        </p>
        <p className="text-gray-700 text-lg">
          Join the future of aesthetic medicine. Our AI-powered platform helps you deliver
          personalized care and grow your business.
        </p>

        {/* Feature boxes */}
        <div className="space-y-4 pt-6">
          {features.map((feature) => (
            <FeatureItem key={feature.id} {...feature} />
          ))}
        </div>
      </div>

      {/* Footer space */}
      <div className="relative z-10"></div>
    </div>
  );
}
