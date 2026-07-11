import { SchemaEngineering, TrackIntro } from "./Advanced";
import { RoadmapGrid } from "../components/shared/Common";

const roadmapItems = [
  {
    id: "plugins",
    title: "Plugins",
    desc: "Generate custom outputs from compiler descriptor input.",
    color: "blue",
  },
  {
    id: "extensions",
    title: "Extensions",
    desc: "Extend messages and option descriptor types.",
    color: "cyan",
  },
  {
    id: "annotations",
    title: "Custom Options",
    desc: "Attach domain metadata to schema elements.",
    color: "green",
  },
];

const Extending = () => (
  <>
    <TrackIntro
      id="extending"
      subtitle="05_EXTENDING"
      title="Extending"
      desc="Protobuf can be extended at compile time and at schema-definition time. These sections cover plugins, extensions, and custom options."
    />
    <div className="px-4 sm:px-8 pb-24 bg-[var(--bg-color)]">
      <div className="max-w-7xl mx-auto">
        <RoadmapGrid items={roadmapItems} cols="lg:grid-cols-3" />
      </div>
    </div>
    <SchemaEngineering includeIds={["plugins", "extensions", "annotations"]} />
  </>
);

export default Extending;
