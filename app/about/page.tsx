import { mission, whatWeDo } from "@/content";
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
    </>
  );
}
