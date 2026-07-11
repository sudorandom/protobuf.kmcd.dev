import { ShieldCheck, Type } from "lucide-react";
import {
  CyberPanel,
  Section,
  SectionTitle,
  SyntaxHighlighter,
  TechnicalNuance,
} from "../components/shared/Common";
import { TrackIntro, ValidationLab } from "./Advanced";

const TypeValidation = () => (
  <Section
    id="type-validation"
    className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]"
  >
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <SectionTitle icon={Type} subtitle="06a_TYPES">
            Type Validation
          </SectionTitle>
          <div className="space-y-4 text-[var(--text-dim)] leading-relaxed text-sm">
            <p>
              Generated Protobuf code enforces the schema's structural types:
              strings are strings, integers are numbers, repeated fields are
              collections, and nested messages have the expected shape.
            </p>
            <p>
              This is useful validation, but it is intentionally limited. A
              schema type can tell you that a field is a string; it cannot tell
              you that the string is a valid email address, that an age is in
              range, or that two fields satisfy a business rule.
            </p>
            <p>
              The next layer is to describe those expectations in the schema
              itself, using annotations that tools can read consistently across
              services and languages.
            </p>
            <TechnicalNuance title="Type checks are not business rules">
              <p>
                Treat normal generated-code type safety as the first layer. Use
                application logic or schema annotations for semantic validation.
              </p>
            </TechnicalNuance>
          </div>
        </div>
        <CyberPanel title="STRUCTURAL_CONTRACT" className="h-full">
          <div className="p-4">
            <SyntaxHighlighter
              language="proto"
              code={`message SignupRequest {
  string email = 1;
  uint32 age = 2;
  repeated string roles = 3;
}`}
              wrap={true}
            />
          </div>
        </CyberPanel>
      </div>
    </div>
  </Section>
);

const SchemaRulesTransition = () => (
  <Section
    id="schema-rules"
    className="py-20 px-4 sm:px-8 bg-[var(--bg-color)] border-t border-[var(--border-light)]"
  >
    <div className="max-w-7xl mx-auto">
      <div className="max-w-4xl space-y-6">
        <SectionTitle icon={ShieldCheck} subtitle="06b_RULES">
          Schema Rules
        </SectionTitle>
        <div className="space-y-4 text-[var(--text-dim)] leading-relaxed text-sm">
          <p>
            Once the structural shape is stable, the next question is where to
            put the rules that make the data meaningful: email format, ranges,
            required fields, cross-field checks, and domain-specific
            constraints.
          </p>
          <p>
            Keeping those rules close to the schema makes them available to
            generated code, gateways, tests, CLIs, and runtime validation tools
            without each service re-inventing the same checks.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

const Validation = () => (
  <>
    <TrackIntro
      id="validation-intro"
      subtitle="06_VALIDATION"
      title="Validation"
      desc="Validation starts with Protobuf's generated type contracts and extends into explicit schema-level rules with protovalidate."
    />
    <TypeValidation />
    <SchemaRulesTransition />
    <ValidationLab />
  </>
);

export default Validation;
