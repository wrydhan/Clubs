export const steps = [
  {
    n: "01",
    title: "Pitch",
    body: "The club, the cadence, and the people who will actually come.",
  },
  {
    n: "02",
    title: "Interview",
    body: "Twenty minutes. Usually that same week.",
  },
  {
    n: "03",
    title: "We fund it",
    body: "A budget, space at Fort Mason, and the Founders, Inc. name.",
  },
  {
    n: "04",
    title: "You run it",
    body: "Host it on the schedule you promised, then send us the headcount.",
  },
] as const;

export const perks = [
  {
    label: "Funding",
    detail: "The real cost of the night. Court time, materials, entry fees, coffee. Not a salary.",
  },
  {
    label: "Space",
    detail: "The workshop, the gym, or a room at Fort Mason when the club needs one.",
  },
  {
    label: "The name",
    detail: "It's a Founders, Inc. club. That's why someone from a reel actually walks in.",
  },
  {
    label: "Logistics",
    detail: "The calendar, the RSVP, and a person to text when the gate code changes.",
  },
  {
    label: "A media team",
    detail: "We shoot the events. That's how the next room fills up.",
  },
] as const;

export const expectations = [
  "Run it on the schedule you agreed to.",
  "Send us the headcount after each event.",
  "Use the brand like a host, not a billboard. We'll show you how.",
  "Tell us when it isn't working. Early, not after a month of empty rooms.",
] as const;

export const goodApplication = [
  {
    title: "A specific cadence",
    body: "“Thursdays at 7” beats “whenever people are free.”",
  },
  {
    title: "A realistic first event",
    body: "A date, a place, and what actually happens when people arrive.",
  },
  {
    title: "Ten names",
    body: "People you can already say will come to that first one.",
  },
  {
    title: "Proof you've hosted something",
    body: "Even if it was small, unofficial, and held together in a group chat.",
  },
] as const;

export const timeline = [
  { title: "Apply", body: "The form on this page." },
  { title: "Within a week", body: "We write back." },
  { title: "Twenty minutes", body: "An interview. Not a deck." },
  { title: "Within a week", body: "Yes, no, or not this version." },
] as const;

export const faqs = [
  {
    q: "Do I need to be a member?",
    a: "No. Clubs are how most people meet the campus. You don't need to be in a Founders, Inc. program, and you don't need to be building a company. Show up to the session.",
  },
  {
    q: "How much funding do I get?",
    a: "Enough to run the thing properly. Court time, materials, entry fees, coffee. Not a salary and not a blank check. You tell us what the first few events cost. Most clubs land between a few hundred and a few thousand dollars a month, depending on whether it's a gym or a race track.",
  },
  {
    q: "How often do I have to run it?",
    a: "On the schedule you proposed. Weekly, every other week, monthly, quarterly. Car Club runs track days a few times a year. A weekly gym night would count too. A one-off you never repeat doesn't.",
  },
  {
    q: "What if nobody shows up?",
    a: "Tell us. We'll help you move the time, change the format, or post it differently. If it stays empty, we shut it down without a speech. A dead club on the calendar is worse than no club.",
  },
  {
    q: "Can I run a club that has nothing to do with startups?",
    a: "Yes. That's the point. The people in the room are founders and operators. The activity doesn't have to be a company. Cars, basketball, paintball, fabrication — whatever you can get ten people to actually do.",
  },
  {
    q: "What happens if I stop?",
    a: "You say so. We find another lead, or we end it. No penalty, and no clawback for nights that already happened. These only work if the person running it wants to be there.",
  },
  {
    q: "Who's allowed to come?",
    a: "Anyone you're willing to have in the room. If a session needs a cap — the machines, a track day — put it on the RSVP. Don't turn it into a membership.",
  },
  {
    q: "Do I get paid?",
    a: "No. You get a budget, space at Fort Mason, the Founders, Inc. name, and a media team that shoots the events. You run it because you wanted it to exist.",
  },
] as const;
