import { icons } from "lucide-react-native";
import { TextProps } from "react-native";
import { useColorScheme } from "~/lib/utils/useColorScheme";

interface IconProps extends TextProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
}

const Icon = ({ name, color, size = 24, ...props }: IconProps) => {
  const { isDarkColorScheme } = useColorScheme();
  const LucideIcon = icons[name];

  // Add safety check for undefined icons
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react-native`);
    // Return null instead of crashing
    return null;
  }

  const iconColor = color || (isDarkColorScheme ? "#f8fafc" : "#1e293b");

  return <LucideIcon color={iconColor} size={size} {...props} />;
};

export default Icon;
