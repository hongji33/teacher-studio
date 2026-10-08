import {
  Palette,
  BookOpen,
  Users,
  Clapperboard,
  Compass,
  BriefcaseBusiness,
  Heart,
  PanelsTopLeft,
  ClipboardCheck,
  Puzzle,
  Paintbrush,
  Wallet,
  Languages,
  GraduationCap,
  FilePenLine,
  DoorOpen,
  School,
  NotebookPen,
  Sparkles,
  CodeXml,
  Images,
  Globe,
} from "lucide-react";
const icons = {
  Palette,
  BookOpen,
  Users,
  Clapperboard,
  Compass,
  BriefcaseBusiness,
  Heart,
  PanelsTopLeft,
  ClipboardCheck,
  Puzzle,
  Paintbrush,
  Wallet,
  Languages,
  GraduationCap,
  FilePenLine,
  DoorOpen,
  School,
  NotebookPen,
  Sparkles,
  CodeXml,
  Images,
  Globe,
};
export const iconNames = Object.keys(icons);
export default function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const Component = icons[name as keyof typeof icons] || Globe;
  return <Component size={size} strokeWidth={1.7} />;
}
