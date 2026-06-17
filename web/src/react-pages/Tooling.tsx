import {
  DescriptorsAndReflection,
  SchemaEngineering,
  TrackIntro,
  ValidationLab,
} from "./Advanced";
import { RoadmapGrid } from "../components/shared/Common";

const roadmapItems = [
  {
    id: "reflection",
    title: "Reflection",
    desc: "Dynamic schema inspection and runtime descriptors.",
    color: "cyan",
  },
  {
    id: "plugins",
    title: "Custom Plugins",
    desc: "Extending protoc to generate custom code and docs.",
    color: "blue",
  },
  {
    id: "extensions",
    title: "Proto Extensions",
    desc: "Adding fields to messages from outside their definition file.",
    color: "cyan",
  },
  {
    id: "options",
    title: "Standard Options",
    desc: "Built-in metadata for generated code and runtime behavior.",
    color: "green",
  },
  {
    id: "annotations",
    title: "Custom Options",
    desc: "Attaching domain metadata to schema elements.",
    color: "green",
  },
  {
    id: "breaking-levels",
    title: "Breakage Levels",
    desc: "How compatibility tools classify schema changes.",
    color: "pink",
  },
  {
    id: "lifecycle",
    title: "Deprecation",
    desc: "Safely removing fields without reusing wire IDs.",
    color: "yellow",
  },
  {
    id: "validation",
    title: "Validation Lab",
    desc: "Live playground for protovalidate business rules.",
    color: "yellow",
  },
];

export const Tooling = () => (
  <>
    <TrackIntro
      id="tooling"
      subtitle="03_TOOLING"
      title="Reflection & Tooling"
      desc="Descriptors make schemas machine-readable. This page covers runtime reflection, compiler plugins, custom options, and validation built on top of the descriptor layer."
    />
    <div className="px-4 sm:px-8 pb-24 bg-[var(--bg-color)]">
      <div className="max-w-7xl mx-auto">
        <RoadmapGrid items={roadmapItems} cols="lg:grid-cols-4" />
      </div>
    </div>
    <DescriptorsAndReflection />
    <SchemaEngineering />
    <ValidationLab />
  </>
);

export default Tooling;
