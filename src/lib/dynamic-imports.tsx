import dynamic from "next/dynamic";
import { Loading } from "@/components/ui/loading";

// Dynamic imports for heavy components
export const DynamicDialog = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.Dialog),
  {
    loading: () => <Loading size="sm" />,
    ssr: false,
  }
);

export const DynamicSheet = dynamic(
  () => import("@/components/ui/sheet").then((mod) => mod.Sheet),
  {
    loading: () => <Loading size="sm" />,
    ssr: false,
  }
);

export const DynamicDropdownMenu = dynamic(
  () => import("@/components/ui/dropdown-menu").then((mod) => mod.DropdownMenu),
  {
    loading: () => <Loading size="sm" />,
    ssr: false,
  }
);

export const DynamicTabs = dynamic(
  () => import("@/components/ui/tabs").then((mod) => mod.Tabs),
  {
    loading: () => <Loading size="sm" />,
    ssr: false,
  }
);

export const DynamicSelect = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select),
  {
    loading: () => <Loading size="sm" />,
    ssr: false,
  }
);

// Dynamic imports for page components (add as needed)
export const DynamicThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    loading: () => <Loading size="sm" />,
    ssr: false,
  }
);
