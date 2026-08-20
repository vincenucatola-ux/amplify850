import { donate } from "@/content";
import { SectionHead } from "@/components/ui";
import { DonateCampaigns } from "@/components/DonateCampaigns";

export default function Donate() {
  return (
    <section className="px-6 py-16">
      <SectionHead eyebrow="Give" heading={donate.heading} />
      <div className="max-w-[640px] mx-auto text-center mb-8">
        <p className="text-[1.05rem]">{donate.body}</p>
      </div>
      <div className="max-w-[640px] mx-auto text-left">
        <DonateCampaigns campaigns={donate.campaigns} />
      </div>
    </section>
  );
}
