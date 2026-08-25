import { mission, whatWeDo, community } from "@/content";
import { SectionHead, Card } from "@/components/ui";

export default function About() {
  return (
    <>
      <section className="px-6 py-16">
        <div className="max-w-[720px] mx-auto">
          <h1 className="font-display text-maroon text-[clamp(1.8rem,4vw,2.6rem)] mb-6">
            {mission.heading}
          </h1>
          {mission.body.map((p, i) => (
            <p key={i} className="text-[1.05rem] mb-4">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-cream-dark px-6 py-16">
        <SectionHead heading={whatWeDo.heading} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 max-w-[1100px] mx-auto">
          {whatWeDo.items.map((item, i) => (
            <Card
              key={item.title}
              className={i === whatWeDo.items.length - 1 ? "sm:col-span-2" : ""}
            >
              <h3 className="text-maroon mt-0 text-xl font-display">
                {item.title}
              </h3>
              <p>{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <SectionHead eyebrow={community.eyebrow} heading={community.heading} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 max-w-[1100px] mx-auto">
          {community.items.map((t) => (
            <Card key={t.name} className="flex flex-col">
              <p className="font-display italic text-[1.1rem] text-maroon leading-snug mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="text-sm border-t border-cream-dark pt-4">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-ink/60">{t.title}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
