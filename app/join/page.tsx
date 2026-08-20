import { membershipForms } from "@/content";
import { SectionHead } from "@/components/ui";

function FormEmbed({
  title,
  blurb,
  url,
}: {
  title: string;
  blurb: string;
  url: string;
}) {
  const embedSrc = url.includes("?")
    ? `${url}&embedded=true`
    : `${url}?embedded=true`;

  return (
    <div className="bg-cream-dark rounded-xl p-6 sm:p-8">
      <h3 className="font-display text-maroon text-xl mb-1.5">{title}</h3>
      <p className="mb-4 text-sm text-ink">{blurb}</p>
      <div className="bg-cream rounded-lg overflow-hidden border border-tan/50">
        <iframe
          src={embedSrc}
          title={title}
          width="100%"
          height="900"
          className="block w-full"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
}

export default function Join() {
  return (
    <section className="px-6 py-16">
      <SectionHead
        eyebrow="Get Involved"
        heading={membershipForms.heading}
      />
      <p className="text-center max-w-[600px] mx-auto mb-12 text-[1.05rem]">
        {membershipForms.intro}
      </p>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-8 max-w-[1100px] mx-auto">
        <FormEmbed
          title={membershipForms.highSchool.title}
          blurb={membershipForms.highSchool.blurb}
          url={membershipForms.highSchool.url}
        />
        <FormEmbed
          title={membershipForms.college.title}
          blurb={membershipForms.college.blurb}
          url={membershipForms.college.url}
        />
      </div>
    </section>
  );
}
