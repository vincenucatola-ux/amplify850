import { footer, contact } from "@/content";

export default function Footer() {
  return (
    <footer className="bg-maroon text-cream px-6 py-10 text-center mt-10">
      <div className="font-display text-lg tracking-wide mb-2.5">
        {footer.brand}
      </div>
      <p className="text-sm opacity-85 my-1">{footer.orgLine}</p>
      {contact.email && (
        <p className="text-sm opacity-85 my-1">{contact.email}</p>
      )}
      <p className="text-sm opacity-85 my-1">{footer.copyright}</p>
    </footer>
  );
}
