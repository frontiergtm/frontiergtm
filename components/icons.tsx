import {
  Article,
  Brain,
  ChartLineUp,
  ChatsCircle,
  CheckCircle,
  Cloud,
  Code,
  Compass,
  Cpu,
  Database,
  Funnel,
  Graph,
  MapTrifold,
  Mountains,
  Robot,
  RocketLaunch,
  Target,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentProps } from "react";

const icons = {
  article: Article,
  brain: Brain,
  chart: ChartLineUp,
  chats: ChatsCircle,
  check: CheckCircle,
  cloud: Cloud,
  code: Code,
  compass: Compass,
  cpu: Cpu,
  database: Database,
  funnel: Funnel,
  mountains: Mountains,
  strategy: MapTrifold,
  nodes: Graph,
  robot: Robot,
  rocket: RocketLaunch,
  target: Target,
  users: UsersThree,
};

export type IconName = keyof typeof icons;

type PhosphorIconProps = ComponentProps<typeof Article>;

export function Icon({ name, ...props }: PhosphorIconProps & { name: IconName }) {
  const Component = icons[name];
  return <Component aria-hidden="true" {...props} />;
}
