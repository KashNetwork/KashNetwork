export type Block = {
  k: string;
  x?: string;
  size?: string | null;
  w?: string | number | null;
  c?: string | null;
  a?: string | null;
  lh?: string | null;
  ls?: string | null;
  card?: boolean;
  src?: string;
  h?: number;
  round?: boolean;
  label?: string;
  sub?: string;
  items?: Block[];
};


export type Section = { kind: string; items: Block[] };

export const salesSections: Section[] = [
 {
  "kind": "hero",
  "items": [
   {
    "k": "p",
    "x": "ATTENTION: Anyone Who Wants REAL Income Online — 24 Hours A Day, 7 Days A Week…",
    "size": "18",
    "w": "800",
    "c": "rgb(36, 96, 232)",
    "a": "center",
    "lh": "1.35em",
    "ls": "0.08em"
   },
   {
    "k": "badge",
    "x": "Trusted by members worldwide"
   },
   {
    "k": "h1",
    "x": "⚠️ Need {{rgb(208, 2, 27)}}Emergency{{/}} Cash? ⚠️ {{/}}\n$37 Per Hour Sending Emails{{/}}",
     "size": "50",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
     "lh": "1.33em",
    "ls": "-0.045em"
   },
    {
     "k": "p",
     "x": "Click ▶️ “PLAY” to watch the 4-minute video below — see how it works…",
      "size": "22",
      "w": "600",
     "c": "rgb(4, 24, 78)",
     "a": "center",
     "lh": "1.35em",
     "ls": "-0.02em"
    },
   {
    "k": "video"
   },
   {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   }
  ]
 },
 {
  "kind": "tint",
  "items": [
   {
    "k": "h2",
    "x": "Zero Experience? {{/}}{{rgb(208, 2, 27)}}PERFECT.{{/}}",
     "size": "58",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.2em",
    "ls": "-0.035em"
   },
   {
    "k": "p",
    "x": "**60 SECONDS** to get set up and ready to earn commissions!",
     "size": "27",
     "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.4em",
    "ls": "-0.01em"
   },
   {
    "k": "h2",
    "x": "Here’s how it works:",
     "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.3em",
    "ls": "-0.03em"
   },
   {
    "k": "bullet",
    "card": true,
    "x": "**Step 1:** Get Your Personal Affiliate Link (DONE-FOR-YOU Website) — Earn $37 monthly residual commissions when people join through your link.",
     "size": "22",
    "w": "600"
   },
   {
    "k": "bullet",
    "card": true,
    "x": "**Step 2:** Your Affiliate Link Gets Shared — Our trusted email advertising sources will write the email ad for you and send it to THOUSANDS of people interested in earning extra income online.",
     "size": "22",
    "w": "600"
   },

   {
    "k": "bullet",
    "card": true,
    "x": "**Step 3:** Our A.I. assistant replies to emails from interested people on your behalf to turn conversations into commissions — 24 hours a day, 7 days a week… IT NEVER SLEEPS!",
     "size": "22",

    "w": "600"
   }
  ]
 },
 {
  "kind": "band",
  "items": [
   {
    "k": "h2",
    "x": "The Result?",
    "size": "60",
    "w": "800",
    "c": "rgb(255, 255, 255)",
    "a": "center",
    "lh": "1.05em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "The FASTEST way to earn commissions online without needing any special skills.",
     "size": "35",
    "w": "700",
    "c": "rgb(214, 230, 255)",
    "a": "center",
    "lh": "1.4em",
    "ls": null
   },
    {
     "k": "p",
     "x": "{{rgb(255, 255, 255)}} {{/}}100% BEGINNER-FRIENDLY!{{/}}",
      "size": "52",

     "w": "700",
     "c": "rgb(117, 239, 78)",
     "a": "center",
     "lh": "1.35em",
     "ls": null
    }
  ]
 },
 {
  "kind": "white",
  "items": [
   {
    "k": "h2",
    "x": "Hi, I’m Harley Carter…\nCreator of Kash Network.",
    "size": "42",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.1em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "I’ve been helping people earn income online for 15+ years. **And before that, I was struggling with the same thing as you.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.6em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Waking up every day to the annoying alarm… quickly making breakfast I couldn’t even enjoy…waiting in boring traffic…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.6em",
    "ls": null
   },
   {
    "k": "img",
    "src": "founder",
    "w": 220,
    "h": 220,
    "round": true
   },
   {
    "k": "p",
    "x": "Only to reach a workplace that paid me peanuts — just barely enough to pay my bills.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**I wanted to break free from this stressful life where I couldn’t even think of spending an extra dollar on myself.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Where I watched everyone else succeed while I felt stuck.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You know... seeing people take vacations, buy the things they wanted without checking the price tag, and enjoy the kind of freedom I wished I had.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "And above all, I wanted my family to enjoy life. **I knew I wanted to break this painful chain and live the life I daydreamed about.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "That's when I decided to try this **\"make money online\"** thing every other person seemed to be raving about.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "I tried making YouTube videos… **(that didn’t work).**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Writing blogs… **(that didn’t work).**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "And everything else you can think of… **(that also didn’t work).**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "But those things were really time-consuming.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "I wanted to do something that\nwould help me get results **— FAST.**",
    "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.12em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "I started analyzing top earners online.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**It turns out, they do something called “email marketing” —** which is basically sending emails to people who are interested in what you offer.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "When I stumbled upon this thing called \"email marketing\" I decided to give it a try **— but to my disappointment, it didn't work as well as I'd hoped when I first started.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "This left me confused and thinking…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**\"How come other people were making REAL money online in just a few days just by sending “stupid” emails, when I was struggling to make even a single dollar?\"**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "There must be something they weren't sharing — something that was working for them.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**So I became OBSESSED** with learning everything I could about how this whole \"email marketing\" thing actually worked.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "I burned through more courses and YouTube tutorials than I can count, spending countless hours trying to figure it all out.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "I tested, failed, tested again,\nand spent YEARS refining.",
    "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.12em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "I spent thousands of my own dollars trying different programs, testing different ideas, and making expensive mistakes along the way **— always hoping the next thing would finally be what helped me succeed.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Eventually, after years of trial and error, I realized I was making things way more complicated than they needed to be.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**The simple, ‘unsexy’ truth is that…**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "I just needed to keep it super simple and stick with the basics.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The people who actually make money online **don't rely on luck.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "They follow a simple process that goes like this:",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Find Interested People → Send Emails → Reply To Emails → Get Paid!**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "FINALLY, I had a system that worked!",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "quotecard",
    "items": [
     {
      "k": "p",
      "x": "“I’ve earned commissions online since 2011. My inbox lights up with commission notifications from opportunities I’ve been a part of over the years.”",
      "size": "30",
      "w": "600",
      "c": "rgb(4, 24, 78)",
      "a": "center",
      "lh": "1.45em",
      "ls": "-0.02em"
     },
     {
      "k": "img",
      "src": "results1",
      "w": null,
      "h": 294,
      "round": false
     },
     {
      "k": "p",
      "x": "Results vary widely and are not a guarantee of income.",
      "size": "14",
      "w": null,
      "c": "rgb(71, 91, 129)",
      "a": "center",
      "lh": "1.45em",
      "ls": null
     }
    ]
   },
   {
    "k": "p",
    "x": "But there was still one problem. 🤔",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Even with a **‘fool-proof’ system** that worked well, it still took way too much time to keep it going — MANUALLY replying to emails at 2 AM when people were ready to respond and answering messages on Sunday mornings before they lost interest.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "No human could keep that up without burning out.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**That's when A.I. changed everything.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Modern A.I. assistants can now answer questions, follow up, and handle conversations through email for you **— at a quality level that was impossible even two years ago.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "It never misses a follow-up, it never sleeps, it never gets tired, and it replies to every person simultaneously.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**So I built a ‘new system’ around that breakthrough.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The A.I. assistant handles the email conversations for you, 24/7 **— so you can just check your commission notifications.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Cha-ching! 🤑",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "**Here's what Kash Network does for you:\n**",
    "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.12em",
    "ls": "-0.04em"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "**You Get A Personal Affiliate Link (DONE-FOR-YOU Website) —** so you can earn $37 monthly residual commissions when people join through your link.",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "**Your Affiliate Link Gets Shared —** our trusted email advertising sources will write the email ad for you and send it to THOUSANDS of people who are interested in earning extra income online. It only takes 60 seconds to get fully setup and ready to earn commissions.",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "**Works FOR YOU 24 Hours a Day, 7 Days a Week —** our A.I. assistant replies to emails from interested people on your behalf to turn conversations into commissions, even while you sleep, so you can breathe and live your life!",
    "size": "22",
    "w": "500"
   },
   {
    "k": "p",
    "x": "This isn't \"hype\"... It's a proven process — now running on A.I. so it never stops, never sleeps, and **works for you 24/7.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   },
   {
    "k": "p",
    "x": "The actual truth is…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Making money online doesn't have to take weeks or months.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "In fact, you can have everything fully set up and ready to earn commissions **in as little as 60 seconds…**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Without spending any time “guessing” about what to do.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**I can say this confidently because our members are satisfied. **",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Look at the kind of commissions this system has generated in 1 day for one of our members…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "quotecard",
    "items": [
     {
      "k": "p",
       "x": "“After following the system, I earned $100 in commissions!” — Jehoyakim Jena",
      "size": "30",
      "w": "600",
      "c": "rgb(4, 24, 78)",
      "a": "center",
      "lh": "1.45em",
      "ls": "-0.02em"
     },
     {
      "k": "img",
      "src": "results2",
      "w": null,
      "h": 285,
      "round": false
     },
     {
      "k": "p",
      "x": "Member result shown. Results vary widely and are not a guarantee of income.",
      "size": "14",
      "w": null,
      "c": "rgb(71, 91, 129)",
      "a": "center",
      "lh": "1.45em",
      "ls": null
     }
    ]
   },
   {
    "k": "p",
    "x": "**That's why I built Kash Network —** to help you turn something you're already doing into an income opportunity.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You already send emails all the time (or at least once a week).",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Why not get paid for it?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You only need to bring one thing to the table: **consistency.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "This system brings everything else — done-for-you website, email advertising sources, A.I. follow-up conversations.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "All of it works for you 24 hours a day, 7 days a week — and it doesn't stop.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Not on weekends… Not at 3 AM… Not when everyone else is asleep.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   }
  ]
 },
 {
  "kind": "band",
  "items": [
   {
    "k": "h2",
    "x": "Email + A.I. = EASY MODE",
    "size": "50",
    "w": "800",
    "c": "rgb(255, 255, 255)",
    "a": "center",
    "lh": "1.05em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "The A.I. assistant handles the email\nconversations for you, 24/7 — so you can\njust check your commission notifications.\u00a0🤑",
    "size": "35",
    "w": "700",
    "c": "rgb(117, 239, 78)",
    "a": "center",
    "lh": "1.35em",
    "ls": null
   }
  ]
 },
 {
  "kind": "white",
  "items": [
   {
    "k": "p",
    "x": "Here's the part nobody tells you.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**You don't get results by “spamming links” on social media.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "And the people actually making money on the internet?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "They don't do that either.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "They know the same thing I know — that posting content, buying ads, and becoming an “influencer” on social media isn’t what helps you earn commissions from day 1.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Those things are a distraction.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "A way to ‘look’ busy while your bank account stays empty.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "What actually helps you earn commissions is “stupidly” simple.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Find Interested People → Send Emails → Reply To Emails → Get Paid!**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "That's it.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "That's the whole game.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   },
   {
    "k": "h2",
    "x": "Right now, you might be...",
    "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.12em",
    "ls": "-0.04em"
   },
   {
    "k": "minus",
    "x": "Barely Covering Your Bills",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "minus",
    "x": "**Dreaming Of Earning More Income So You Can Eventually Quit Your Job**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "minus",
    "x": "Drowning In Information But Starving For Real Support",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "minus",
    "x": "**Tired Of Watching Others Succeed While You're Still Struggling**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "minus",
    "x": "Feeling Overwhelmed By Complicated Things That Never Give You Results",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Sound familiar?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Here's why…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**You've tried those \"get-rich-quick\" schemes.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Spent money on courses that left you hanging.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Watched countless YouTube videos that only confused you more.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You've probably bought a course or two from a so-called “coach” that promised to show you exactly what to do… then left you **feeling lost and trying to figure it out on your own.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You've probably downloaded a \"how-to” guide that turned out to be 14 pages of obvious advice you already knew **— a complete waste of time.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You've probably tried to run paid ads, watched $300 disappear, and got nothing to show for it but a confused, sinking feeling.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**I mean come on…**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Have you ever wondered why some people consistently earn commissions…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "While others struggle to make even $100 online?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "Here's the honest answer…",
    "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.12em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "The difference is a \"proven system\", my friend.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Yes.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "People who consistently earn online don't grind harder.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "They use a system that simply works — reach interested people, send emails, have conversations, **and get paid!**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Now, I know what you might be thinking right now.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**“Why are you sharing it?”**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Well, because I don't want to hide anything that can help you turn your dreams into reality.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**And I know how it feels when you're stuck and frustrated.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Been there, my friend.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Already fought that exhausting battle.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   },
   {
    "k": "p",
    "x": "**Before we go further, by now you're probably thinking…**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "\"But what if I've never made a dime online before?\"",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Perfect!**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "This system works best for complete beginners — because you won't have any bad habits to unlearn.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "What Could You Do With\nExtra Income On The Side?",
    "size": "38",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.12em",
    "ls": "-0.04em"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "Rest whenever you want",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "**Relax from wherever you want**",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "Buy things for yourself and your family that you've always wanted",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "**Enjoy vacations without watching your bank balance shrink**",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "Save more — and spend more freely",
    "size": "22",
    "w": "500"
   },
   {
    "k": "bullet",
    "card": false,
    "x": "**Build the kind of financial cushion that lets you sleep at night**",
    "size": "22",
    "w": "500"
   },
   {
    "k": "p",
    "x": "Think about it for a second…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "What does your monthly budget look like right now?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "For most people, an extra few hundred — or a few thousand — dollars a month wouldn't just pay a bill **— it would change what feels possible.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**That dinner you keep putting off.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The trip you keep promising your family.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**The savings account you keep meaning to start growing.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The \"rainy day\" cushion that's been on your to-do list for three years.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "That's exactly why this system was created — to help you reach those goals.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "Who Is This Really For?",
    "size": "44",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.1em",
    "ls": "-0.04em"
   },
   {
    "k": "person",
    "x": "**The 9-to-5 worker** who's tired of working 40+ hours a week for a paycheck that barely covers the bills.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "person",
    "x": "**The single parent** who needs an extra source of income, but doesn't have time to figure everything out from scratch.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "person",
    "x": "**The side-hustler** who's tried several ways to make money and wants a simpler way to earn online.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "person",
    "x": "**The retired or semi-retired person** who wants to add a meaningful supplemental income without going back to a full-time job.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "person",
    "x": "**The aspiring entrepreneur** who knows they want to build something but is realistic about how much time they actually have right now.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "person",
    "x": "**ANYONE who's tired of trying to do everything alone** and wants a system that provides real support to help them win.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "This is for people who want to use a proven system that's already built and **ready to earn commissions.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "If any of that sounds like you, this could be exactly what you've been looking for.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   }
  ]
 },
 {
  "kind": "band",
  "items": [
   {
    "k": "h2",
    "x": "Earn Your First 7 Commissions Within 7 Days — Or Don’t Pay.",
    "size": "50",
    "w": "800",
    "c": "rgb(255, 255, 255)",
    "a": "center",
    "lh": "1.08em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "Here’s how confident I am in this system: if you don’t like what you see, just click “cancel” inside your member dashboard before your trial ends on Day 7. No phone calls, no hassle, no questions asked.",
    "size": "35",
    "w": "700",
    "c": "rgb(214, 230, 255)",
    "a": "center",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "period",
    "x": "PERIOD.",
    "size": "50",
    "w": "700",
    "c": "rgb(117, 239, 78)",
    "a": "center",
    "lh": "1.35em",
    "ls": null
   }
  ]
 },
 {
  "kind": "white",
  "items": [
   {
    "k": "h2",
    "x": "Why this is a no-brainer…",
    "size": "44",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.1em",
    "ls": "-0.04em"
   },
   {
    "k": "check",
    "x": "**Test-drive it for 7 days before deciding if it's right for you.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "check",
    "x": "**No huge upfront commitment. **",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "check",
    "x": "**No complicated setup or guesswork.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "check",
    "x": "**Backed by a real, proven system that runs around the clock.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.65em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The 7-day trial has your back!",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Either you get your **first 7 commissions within 7 days…** or simply cancel before your trial ends on ‘Day 7’.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**So the real question isn't \"is this worth it?\"**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The real question is: what does the next 7 days look like for you if you don't take action?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "You Have Two Paths From Here.",
    "size": "44",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.1em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "**Path 1:** You close this page. You go back to whatever you were doing before. Maybe you go look at another \"make money online\" YouTube video. Maybe you sign up for another course. Maybe you try to run Facebook ads and lose another $300. **Maybe you do nothing and feel a little worse about your situation than you did when you opened this page.** In a month, you'll be exactly where you are now — except a month older. In a year, the same. You'll have spent another year wishing things were different.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Path 2:** You go all in. You spend 60 seconds on setup. Then go live your life. You log into your member dashboard from time to time to see what's happening. **Maybe earn commissions. Maybe earn more commissions.** Maybe you're not happy with it after 7 days and you cancel.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**But here's the twist… I want you to think about this for a second.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Either way — at the end of 7 days, you'll have done something different.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You'll have actual proof about whether this works for you, instead of wondering.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Only you can decide which path is right for you.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "But I can tell you that \"doing nothing\" has a cost too. It's just hidden, because you don't see the bill arrive each month.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   },
   {
    "k": "h2",
    "x": "Live the life you daydream about...",
    "size": "44",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.1em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "I've designed this system to **help you earn extra income on the side** — so you can have more freedom and spend more time with the people who matter most in your life.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Imagine waking up, checking your bank account with your coffee, and seeing that **another commission came in overnight while you were sleeping.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Because while you were sleeping, the A.I. assistant was working.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**That's a $37 commission. Maybe two. Maybe more.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Imagine your weekend looking different — because you're no longer relying only on your 9-to-5 paycheck — you now have another way to earn.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Imagine being able to say **\"yes\"** to things you've been saying \"we can't right now\" to for years.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You see how this system can change things?",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "h2",
    "x": "You've made it this far.",
    "size": "44",
    "w": "800",
    "c": "rgb(4, 24, 78)",
    "a": "center",
    "lh": "1.1em",
    "ls": "-0.04em"
   },
   {
    "k": "p",
    "x": "Which means one of two things.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Either you've read this whole page and you're still on the fence — wondering whether this is the thing that finally moves the needle for you.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Or you've already decided.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Either way, here's what comes next.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "I get it.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**You've been burned before.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Most so-called \"online experts\" tried to rip you off with flashy nonsense that didn't** **work.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**You've earned the right to be skeptical.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "So don't trust me on faith. Don't take a screenshot at face value.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Don't \"just hope it works.\"",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**That's the entire point of the 7-day trial.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You sign up, follow the process, and at the end of 7 days you have a real answer — **either commissions are coming in, or you can cancel with no hassle.**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "You have nothing to lose by giving it a try.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "So don't wait.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "**Your first commission is just clicks away —** but only if you take action now.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "If you want to transform your life — and finally build the kind of income stream you've been chasing — then simply…",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
    },
    {
    "k": "cta",
    "label": "Activate My Commissions for $1",
    "sub": "Try it risk-free for 7 days, then $47/month. Cancel anytime.",
    "card": false
   },
   {
    "k": "p",
    "x": "Or if you'd rather stay where you are — bills piling up, putting off the things you want, and watching everyone else on vacations living the life you wish you had — that's fine too.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "p",
    "x": "The choice is yours.",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": null,
    "lh": null,
    "ls": null
   },
   {
    "k": "p",
    "x": "_**P.S. I'm not sure how much longer you want to keep wondering 'what if.' I'd suggest you don't wait — get started now so you can start reaching your goals as soon as possible. It’s YOUR future. It's YOUR choice.**_",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   },
   {
    "k": "img",
    "src": "closing",
    "w": 254,
    "h": 335,
    "round": true
   },
   {
    "k": "p",
    "x": "_“I’m here to help you stop guessing, overcome challenges, and move closer to your goals — because time is something you can never get back. I’m passionate about helping you create more freedom — so you don’t miss any more precious moments with your family and loved ones. The right system, support, and action can change everything. Your success story starts NOW.”_** — Harley Carter**",
    "size": "22",
    "w": "500",
    "c": "rgb(4, 24, 78)",
    "a": "left",
    "lh": "1.7em",
    "ls": null
   }
  ]
 },
 {
  "kind": "footer",
  "items": [
   {
    "k": "p",
    "x": "Terms of Service | Privacy Policy | Income Disclaimer | Refund Policy | Cookie Policy | Affiliate Agreement | Contact | Frequently Asked Questions (FAQ's)",
    "size": "15",
    "w": null,
    "c": "rgb(214, 230, 255)",
    "a": "center",
    "lh": "1.5em",
    "ls": null
   },
   {
    "k": "p",
    "x": "Income Disclaimer: Results discussed on this page are not typical and are not a guarantee of income. Your results will depend on your effort,\nmarket conditions, the response of people, and other factors. Read our full Income Disclaimer for details. © Kash Network LLC. All rights reserved.",
    "size": "13",
    "w": null,
    "c": "rgb(174, 194, 228)",
    "a": "center",
    "lh": "1.55em",
    "ls": null
   }
  ]
 }
];
