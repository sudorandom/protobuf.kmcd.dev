import { DescriptorsAndReflection, TrackIntro } from "./Advanced";

const Descriptors = () => (
  <>
    <TrackIntro
      id="descriptors"
      subtitle="04_DESCRIPTORS"
      title="Descriptors"
      desc="Descriptors are Protobuf schemas represented as Protobuf data. They power reflection, dynamic decoding, validation, and compiler plugin input."
    />
    <DescriptorsAndReflection />
  </>
);

export default Descriptors;
