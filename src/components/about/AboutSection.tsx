import { FadeIn } from "@/components/motion/FadeIn";
import type { AboutContent } from "@/types";
import { AboutBlock } from "./AboutBlock";
import { ConnectList } from "./ConnectList";
import { ConversationList } from "./ConversationList";
import { EngagementList } from "./EngagementList";
import { FocusColumns } from "./FocusColumns";
import { NairobiClock } from "./NairobiClock";

interface AboutSectionProps {
  readonly content: AboutContent;
}

/**
 * The homepage's closing section, after the Hackathons group: seven blocks on
 * the project-row grid, 96px apart (64px on mobile). Copy comes from
 * src/data/about.ts.
 */
export function AboutSection({ content }: AboutSectionProps) {
  const { about, focus, engagements, recognition, connect, conversations, location } = content;

  return (
    <section
      id="about"
      aria-label={content.sectionLabel}
      className="gutter-x mt-24 flex flex-col gap-16 md:mt-40 md:gap-24"
    >
      <AboutBlock label={about.label}>
        <div className="max-w-[620px]">
          <FadeIn timing="about">
            <p className="text-[20px] leading-[1.45] text-fg">{about.intro}</p>
          </FadeIn>
          <div className="mt-6 flex flex-col gap-4">
            {about.paragraphs.map((paragraph, index) => (
              <FadeIn key={paragraph} index={index + 1} timing="about">
                <p className="text-[15px] leading-[1.6] text-fg">{paragraph}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </AboutBlock>

      <AboutBlock label={focus.label} contentDivider={false}>
        <FocusColumns columns={focus.columns} />
      </AboutBlock>

      <AboutBlock label={engagements.label}>
        <EngagementList rows={engagements.rows} />
      </AboutBlock>

      <AboutBlock label={recognition.label}>
        <FadeIn timing="about">
          <p className="max-w-[360px] text-[15px] leading-[1.6] text-muted">{recognition.text}</p>
        </FadeIn>
      </AboutBlock>

      <AboutBlock label={connect.label}>
        <FadeIn timing="about">
          <ConnectList links={connect.links} opensInNewTab={connect.opensInNewTab} />
        </FadeIn>
      </AboutBlock>

      <AboutBlock label={conversations.label}>
        <FadeIn timing="about">
          <ConversationList items={conversations.items} cta={conversations.cta} />
        </FadeIn>
      </AboutBlock>

      <AboutBlock label={location.label}>
        <FadeIn timing="about" className="flex w-fit flex-col items-center gap-2">
          <NairobiClock timeZone={location.timeZone} label={location.clockLabel} />
          <p className="text-[11px] leading-[1.4] text-muted">{location.place}</p>
        </FadeIn>
      </AboutBlock>
    </section>
  );
}
