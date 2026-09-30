// ============================================================================
// content.ts — ALL editable text for the Amplify 850 site lives here.
//
// Edit this file to change copy anywhere on the site — you should never need
// to touch the page/component files just to change words, dates, or links.
//
// Anything marked "TODO" below is a placeholder or a best guess based on
// what we had at build time — replace it whenever the real info is locked in.
// ============================================================================

export const site = {
  name: "Amplify 850",
  shortTagline:
    "Aligning Florida State University and Leon County Schools to solve the challenges our students share.",
  url: "https://amplify850.org",
  orgType: "A Registered Student Organization at Florida State University",
};

export const contact = {
  founderName: "Vince Nucatola",
  founderTitle: "Founder & President, Amplify 850",
  phone: "", // TODO: add phone number
  email: "", // TODO: add contact email
  fsuAdvisor: {
    name: "", // TODO: FSU Faculty Advisor name
    department: "", // TODO: department
    email: "", // TODO: advisor email
  },
};

// Web3Forms powers the simple contact form on the Contact page.
// Get a free access key at https://web3forms.com and paste it below.
export const web3forms = {
  accessKey: "6d2bf07a-756f-4f31-be56-7ec34a258ea5",
};

export const hero = {
  eyebrow: "Florida State University · RSO",
  heading: "Amplify 850",
  lead:
    "Aligning Florida State University and Leon County Schools to identify and solve the challenges our students share — through year-round fundraising, community events, and one annual cause.",
  primaryCta: { label: "Join Amplify 850", href: "/join" },
  secondaryCta: { label: "Our Mission", href: "/about" },
};

export const mission = {
  heading: "Our Mission",
  body: [
    "Amplify 850 exists to align Florida State University and Leon County Schools in common purpose: identifying the challenges our students share and solving them together. Through year-round fundraising initiatives, community events, and a signature annual campaign, we channel the energy, talent, and leadership of Tallahassee's college students directly into the schools and neighborhoods that raised so many of us.",
    "Each year, Amplify 850 selects one cause facing our students and rallies the entire capital city around it — building awareness, raising real dollars, and delivering measurable impact where it matters most. But our work goes beyond any single cause. We are building a lasting bridge between the university and the county it calls home: one where FSU students gain the opportunity to lead and serve, where Leon County students gain stages to showcase their talent and grow, and where the community gains a generation of young people invested in each other's success.",
    "We believe Tallahassee's greatest resource has never been its institutions — it is its students, at every age, in every school, who contribute every day to making this city what it is. Amplify 850 exists to make sure they are seen, supported, and heard.",
  ],
};

export const yearlyCause = {
  eyebrow: "This Year's Cause",
  heading: "Fine Arts & Music",
  quote:
    "Every dollar raised goes to Leon County and Florida State University fine arts programs.",
  // TODO: confirm the real fundraising goal — the founding proposal cites an
  // approximate per-chapter goal of $1,500/year; use the real org-wide total
  // once it's locked in.
  fundraisingGoal: "$1,500+ per chapter",
};

export const whatWeDo = {
  heading: "What We Do",
  items: [
    {
      title: "Fundraise, Chapter by Chapter",
      body:
        "Each high school chapter fundraises toward a goal set by the FSU chapter through school-approved activities, with monthly and yearly incentives for participating Leon County high schools.",
    },
    {
      title: "Host Masterclasses",
      body:
        "The main chapter at FSU collaborates with other organizations and departments on campus to provide once-in-a-lifetime opportunities to learn from and network with FSU undergraduates, graduates, and professors who bring valuable, real-world insight to the table.",
    },
    {
      title: "Host a Spring Fine Arts and Music Conference",
      body:
        "The main FSU chapter will host a fine arts and music conference on Saturday, February 6th, 2027, at the Oglesby Student Union at Florida State University. The event is free for anyone to attend as a spectator, giving students the chance to watch, learn, and find inspiration from their peers. Performers can take part for $5 to compete with a group in general grading, or opt for a more rigorous $10 advanced adjudication track evaluated by graduate students, designed to closely mirror the assessment standards students encounter in school. The conference will showcase four disciplines: art, acting, choral performance, and dance, with them spanning multiple locations across the Union to give each discipline the space and atmosphere it deserves.",
    },
  ],
};

export const community = {
  heading: "Words from Our Community",
  eyebrow: "Endorsements",
  items: [
    {
      name: "John E. Dailey",
      title: "Mayor, City of Tallahassee",
      quote:
        "Tallahassee has always been a city that values education, creativity, and the potential of our young people. Investing in our students strengthens our entire community. I am pleased to offer my support for Amplify 850, a student-founded initiative bringing together Florida State University and Leon County Schools around a shared commitment to fine arts education.",
    },
    {
      name: "Summer Callahan",
      title: "Grants Manager, Council on Culture & Arts (COCA)",
      quote:
        "Amplify 850's event aligns with that goal exactly. Structured performance opportunities with credible adjudication are scarce for secondary students in this region outside of school-based assessment, and the conference's low participation cost and free spectator admission make it accessible to students who would otherwise be priced out of that experience.",
    },
  ],
};

export const benefit = {
  heading: "Where the Money Goes",
  body:
    "Under Amplify 850's standing formula, 20% of net proceeds return directly to top-performing chapters' own school arts programs (band, theatre, and visual arts), 40% funds Leon County arts programs through the Foundation for Leon County Schools, and 40% covers event costs. Students gain titled leadership roles, a signed impact letter, and priority consideration for internships with Amplify 850's business sponsors.",
  splits: [
    { percent: "20%", label: "Back to the top-performing chapter's own school arts programs" },
    { percent: "40%", label: "Leon County arts programs, via the Foundation for Leon County Schools" },
    { percent: "40%", label: "Event costs" },
  ],
};

export const structure = {
  heading: "Structure & Oversight",
  items: [
    {
      label: "Faculty Sponsor",
      body: "Required at every chapter; oversees all meetings and activities per school policy.",
    },
    {
      label: "Student Officers",
      body: "Chapter Captain, Talent Coordinator, and Treasurer, selected per school club rules.",
    },
    {
      label: "Meetings",
      body: "Twice monthly, on campus, at a time approved by the sponsor (est. 30–45 minutes).",
    },
    {
      label: "Membership",
      body: "Open to all currently enrolled students; no dues; no eligibility restrictions.",
    },
  ],
};

export const compliance = {
  heading: "Finances & Compliance",
  body:
    "All chapter activity follows school and district policy, including facility use, fundraising approval, and parental consent requirements. All funds are logged under Amplify 850's written cash-handling protocol and reconciled with the organization's Treasurer within 72 hours of any event; complete records are available to school administration on request. Tax-deductible community donations are directed to the Foundation for Leon County Schools, not held by students. Chapter participants are program participants of Amplify 850, and each chapter operates as its school's club under that school's authority.",
};

// ----------------------------------------------------------------------------
// EVENTS
// The fall Leadership Seminar series (masterclasses) all run at FSU's Moore
// Auditorium and are free to attend, then everything culminates in the Fine
// Arts & Music Conference in February — confirmed via the Zeffy ticketing
// page, but the exact February date is NOT locked in yet. Update
// `confirmed: false` items once dates/venues are final.
// ----------------------------------------------------------------------------
export const events = [
  {
    slug: "dance-leadership-seminar",
    title: "Dance Leadership Seminar",
    dateLabel: "Friday, October 2, 2026",
    location: "FSU Moore Auditorium",
    confirmed: true,
    free: true,
    description:
      "The first of our fall Leadership Seminar masterclasses, featuring four special guest speakers sharing real-world insight into a career in dance.",
  },
  {
    slug: "choral-leadership-seminar",
    title: "Choral Leadership Seminar",
    dateLabel: "Saturday, November 7, 2026",
    location: "FSU Moore Auditorium",
    confirmed: true,
    free: true,
    description:
      "Held by the American Choral Directors Association, this masterclass brings expert choral insight directly to Leon County and FSU students.",
  },
  {
    slug: "acting-leadership-seminar",
    title: "Acting Leadership Seminar",
    dateLabel: "Saturday, December 5, 2026",
    location: "FSU Moore Auditorium",
    confirmed: true,
    free: true,
    description:
      "The final masterclass of the fall series, giving students a chance to learn from and network with experienced actors and educators.",
  },
  {
    slug: "fine-arts-conference",
    title: "Fine Arts Conference — Grand Finale",
    dateLabel: "February 2027 (exact date TBD)", // TODO: confirm exact date — not yet posted on Zeffy
    location: "FSU Student Union, 222 S Copeland St, Tallahassee, FL 32306",
    confirmed: false,
    description:
      "Everything the fall series builds toward: the countywide thespian, art, and music competition, judged by FSU faculty, with winners recognized on stage.",
    ticketUrl: "https://www.zeffy.com/en-US/ticketing/fsu-fine-arts-and-music-conference",
  },
];

// ----------------------------------------------------------------------------
// GET INVOLVED — membership interest form (Google Form)
// ----------------------------------------------------------------------------
export const membershipForms = {
  heading: "Join Amplify 850",
  intro: "Tell us a bit about yourself and we'll follow up from there.",
  interestForm: {
    title: "Membership Interest",
    blurb: "For FSU students and Leon County high schoolers who want to get involved.",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSdIVAGto1y-fBQ2HXif-uTWpH6AiaP1p5ErL9BIozvZ_rukSg/viewform",
  },
};

// ----------------------------------------------------------------------------
// DONATE — Zeffy (0% platform fee ticketing/donation processor)
//
// Each campaign's embedSrc is derived from its public Zeffy URL by swapping
// in Zeffy's /embed/ prefix (confirmed working pattern: a public page at
// zeffy.com/en-US/<type>/<slug> embeds at zeffy.com/embed/<type>/<slug>).
// ----------------------------------------------------------------------------
export const donate = {
  heading: "Support the Cause",
  body:
    "100% of proceeds go directly to Amplify 850 — Zeffy charges no platform fees, so every dollar you give reaches Leon County and FSU fine arts programs.",
  campaigns: [
    {
      key: "general",
      label: "Donate to Amplify 850!",
      zeffyUrl: "https://www.zeffy.com/en-US/donation-form/donate-to-amplify--850",
      embedSrc: "https://www.zeffy.com/embed/donation-form/donate-to-amplify--850",
    },
    {
      key: "masterclass",
      label: "Sign Up For A Masterclass!",
      zeffyUrl: "https://www.zeffy.com/en-US/ticketing/annual-gala-5857",
      embedSrc: "https://www.zeffy.com/embed/ticketing/annual-gala-5857",
    },
    {
      key: "conference",
      label: "FSU Fine Arts & Music Conference",
      zeffyUrl: "https://www.zeffy.com/en-US/ticketing/fsu-fine-arts-and-music-conference",
      embedSrc: "https://www.zeffy.com/embed/ticketing/fsu-fine-arts-and-music-conference",
    },
  ],
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Join", href: "/join" },
  { label: "Donate", href: "/donate" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Contact", href: "/contact" },
];

export const footer = {
  brand: "AMPLIFY 850",
  orgLine: "A Registered Student Organization at Florida State University",
  copyright: `© ${new Date().getFullYear()} Amplify 850`,
};
