// The 30-day free-lead nurture sequence — sent to anyone who enters their
// email on the video gate but doesn't buy the $1 trial. Stops immediately
// the moment they convert (see markLeadConverted in payments.ts).
//
// Copy supplied by the client ("The Email Templates (Ready to Copy & Paste)").
//
// Body format (one paragraph per blank-line-separated block):
//   {{link:Some Text}}  -> "Some Text" becomes a hyperlink to THIS lead's credited
//                          affiliate's own sales-page link (/activate?ref=CODE),
//                          or the admin's link when nobody is credited. The raw
//                          URL never appears in the HTML email.
//   {{affiliate_link}}  -> the raw URL (only used by the AI replies, not here)
//   **bold**  _italic_   -> simple emphasis
//   "1. text" lines make a numbered list, "🔹 text" lines make bullets.
//
// Timing: Day 1 goes 1 hour after sign-up; every later email is 24 hours after
// the one before it (`afterHours` counts from sign-up).
//
// `hold`: an email with a reason here is kept in the file but NOT sent, because
// it states something that is not true about the product. Remove `hold` once
// the claim is true or the wording is changed.

export interface SequenceStep {
  /** Day label from the client's document (1–30). */
  day: number;
  /** Hours after the lead signed up that this email is due. */
  afterHours: number;
  subject: string;
  /** Inbox preview line (hidden preheader). */
  preview: string;
  body: string;
  /** Closing line above the signature, e.g. "Talk soon,". */
  signoff: string;
  /** If set, this email is skipped (not sent) and the reason is recorded here. */
  hold?: string;
}

export const SIGNATURE = '— Harley Carter';

const at = (day: number) => 1 + (day - 1) * 24;

export const FREE_NURTURE_SEQUENCE: SequenceStep[] = [
  {
    day: 1,
    afterHours: at(1),
    subject: '⚠️ Your spot is waiting (Finish reading my story)',
    preview: "Don't let your free account sit idle. Click here to resume the presentation.",
    body: `Life gets busy, I get it.

You were right in the middle of watching how the done-for-you system works when you had to jump off.

Because you entered your email, your free account has already been automatically created.

You are permanently logged in, meaning you don't need a password to get back to where you left off.

Simply click the link below to resume the video and see the exact system that is turning normal people into successful digital business owners:

👉 {{link:Click Here to Resume the Video & Access Your Dashboard}}

You can unlock the full platform today for just $1.

Don't leave your potential sitting on the table.`,
    signoff: 'Talk soon,',
  },
  {
    day: 2,
    afterHours: at(2),
    subject: 'From absolute zero to this... (my turning point)',
    preview: 'Discover how an automated system completely bypassed bad credit and zero capital.',
    body: `When I first started out, things looked bleak.

No money. Bad credit. No connections.

It felt like working 80 hours a week just to hit a brick wall over and over again.

Sound familiar?

The turning point wasn't finding a massive investor or getting lucky.

It was shifting away from the traditional, broken business models and using a streamlined automated system.

You don't need a massive budget to break the cycle.

You just need the right blueprint.

We laid the entire framework out right here.

Watch the rest of the breakdown and see how you can apply it immediately:

👉 {{link:Watch the Rest of My Breakthrough Here}}

It costs exactly $1 to start your 7-day trial.`,
    signoff: 'To your success,',
  },
  {
    day: 3,
    afterHours: at(3),
    subject: 'What happens if you do nothing today?',
    preview: 'Staying stuck is a choice. See how a single dollar changes your direction.',
    body: `Think about where you were 30 days ago.

If you’re still pushing against the exact same financial obstacles, it’s because you haven’t changed your engine.

Doing nothing is still a choice, but it keeps you locked in place with bad credit and zero leverage.

Breaking the cycle requires a single, decisive step that shifts you from trying to force things alone to plugging into an automated system.

Take that step right here for a single dollar:

👉 {{link:Activate Your $1 Trial & Start Moving Forward}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 4,
    afterHours: at(4),
    subject: 'What’s the catch with the $1 trial? 🤔',
    preview: 'No contracts, no hidden catches, and 100% your control. See how it works.',
    body: `People ask me all the time: _"Why only $1 for a 7-day trial? What's the catch?"_

There is no catch.

I know that when you have no capital and no connections, taking a financial risk on a new platform is terrifying.

So I eliminated the risk entirely.

For literally one dollar, you get a full 7 days to explore the complete system, access the step-by-step traffic source, and activate your own automated tools.

If you love it, stay and grow your empire for $47/month. If you don't, cancel with a single click inside your profile before the 7 days are up.

You lose nothing.

Your free account is waiting.

Click below to upgrade and unlock your tools right now:

👉 {{link:Unlock Your Complete Done-For-You System for $1}}`,
    signoff: 'See you on the inside,',
  },
  {
    day: 5,
    afterHours: at(5),
    subject: '"But I don\'t know how to build a website..."',
    preview: 'Forget expensive developers. Our pre-built dashboard lets you launch in seconds.',
    body: `A lot of people walk away from great ideas because they think they need to be software developers or hire expensive freelancers to code a system.

We built this platform precisely so you never have to write a line of code, worry about database servers, or manage complex tracking setups.

The moment you activate your trial, your custom affiliate dashboard and unique referral links are instantly live and ready to capture recurring commissions.

Let our system do the heavy lifting while you focus on scaling:

👉 {{link:Claim Your Pre-Built Done-For-You System for Just $1}}`,
    signoff: 'Best,',
  },
  {
    day: 6,
    afterHours: at(6),
    subject: 'Let’s look at the numbers (The 1-to-37 flip)',
    preview: 'Break down the exact recurring commission numbers inside this automated system.',
    body: `Let's look at the math behind this automated system, because numbers don't lie.

When you upgrade for $1, you get a unique tracking link.

When someone clicks it and joins the 7-day trial, you earn a clean $30 every single month they remain a member—while we handle all user support and tech upgrades.

If you refer just two active members, you are already making a net profit every single month while your system runs completely on autopilot.

👉 {{link:Turn On Your Recurring Revenue Machine Right Here}}`,
    signoff: 'To your success,',
  },
  {
    day: 7,
    afterHours: at(7),
    subject: 'Look at what happened inside the community this week…',
    preview: 'Real members are activating their referral links right now. See their progress.',
    body: `While you’ve been thinking about it, other members have been executing.

People who started exactly where you are right now—with nothing but a smartphone and pure drive—are actively generating recurring commissions using this exact system.

They didn't build custom tech.

They didn't hire developers.

They just plugged into our done-for-you system.

You have the exact same opportunity sitting right in front of you.

Your free account is already active, you just need to turn the key.

👉 {{link:See the System and Upgrade for $1 Today}}

Stop pushing closed doors.

Let’s build your path of least resistance.`,
    signoff: 'Best,',
  },
  {
    day: 8,
    afterHours: at(8),
    subject: 'Banks say no. We say yes.',
    preview: "Skip the traditional commercial banking run. You don't need a credit check here.",
    body: `Traditional business advice tells you to write a 40-page plan, march into a local bank, and beg for a commercial loan.

But if you have bad credit, that door is slammed shut before you even sit down.

This system is built to completely bypass traditional banking institutions and high-interest financing.

You don't need a credit score check to run an automated affiliate link—you just need a dollar bill and a few minutes to share it.

Stop letting old financial scars dictate your future potential:

👉 {{link:Bypass the Banks and Unlock Your Trial Instantly}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 9,
    afterHours: at(9),
    subject: 'It’s not about who you know anymore',
    preview: "You don't need an elite professional network when you possess leverage.",
    body: `"You need connections to win."

That used to be true when business happened behind closed doors in private boardrooms.

Today, internet traffic is the ultimate equalizer.

When you use our pre-built system, you don't need to know influencers, millionaires, or corporate executives to scale your link—the system routes real, targeted visitors straight to your page automatically.

You don't need a network when you have a high-converting system:

👉 {{link:Get Your Link and Start Driving Traffic Now}}`,
    signoff: 'Best,',
  },
  {
    day: 10,
    afterHours: at(10),
    subject: 'What goes on behind your dashboard?',
    preview: 'From referral tracking to account setup, our engine handles the tech.',
    body: `When a visitor clicks your referral link, an entire automated digital army goes to work for you behind the scenes.

The system instantly drops a 30-day tracking cookie, locks in your attribution, and sets up their account state without you lifting a finger.

If they buy today or three weeks from now, you get credited automatically.

You are getting thousands of dollars worth of custom software architecture for a literal pocket-change investment:

👉 {{link:See How the Automated Engine Works for $1}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 11,
    afterHours: at(11),
    subject: 'Cheaper than a cup of coffee. Literally.',
    preview: 'Swap your morning coffee expense for a compounding monthly recurring income stream.',
    body: `Think about the last thing you spent $1 on.

It probably didn't have the power to change your financial trajectory.

Right now, that single dollar bill can buy you full, unrestricted access to a system designed to scale recurring monthly revenue.

Look at the math: If you refer just two people who continue past the trial, you earn $60/month.

Your entire membership is practically covered, and you're building pure profit.

Skip the coffee today. Invest that dollar into your own freedom instead.

👉 {{link:Activate Your Premium Account and Affiliate Link for $1}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 12,
    afterHours: at(12),
    subject: 'Why hard work alone is failing you',
    preview: 'Stop grinding 80 hours a week down the wrong path. Lean on automation instead.',
    body: `If sheer willpower and working 14 hours a day were enough to make you rich, you’d already be a millionaire.

The trap is trying to handle the passion, the traffic, the tracking, the cashouts, and the customer management completely by yourself.

True leverage comes from using automated system pathways that process customer transactions while you sleep.

Stop working harder down the wrong path, and start working smarter with an automated framework:

👉 {{link:Trade Burnout for Automation – Join the Trial}}`,
    signoff: 'Best,',
  },
  {
    day: 13,
    afterHours: at(13),
    subject: 'Why we charge a single dollar',
    preview: 'Why a single dollar bill keeps the automated system safe from spam bots.',
    body: `Why don't we just make the 7-day trial completely free?

It’s a fair question.

Charging a single dollar creates a psychological filter that keeps out automated spam bots and tire-kickers who just waste system bandwidth.

It proves to our payment processors that you are a real person with a valid card, clearing the way to legally link commissions to your profile.

If you have a single dollar of skin in the game, you have what it takes to launch:

👉 {{link:Verify Your Profile and Step Into the Dashboard}}`,
    signoff: 'See you inside,',
  },
  {
    day: 14,
    afterHours: at(14),
    subject: 'How we protect your earnings (The Net-30 rule)',
    preview: 'Learn how our iron-clad Net-30 holding window secures your growing digital empire.',
    body: `Let's talk about security.

When you start generating $30 monthly recurring commissions, you want to know that money is safe.

Our system uses an iron-clad Net-30 holding window on all transactions.

This completely blocks internet fraudsters from using stolen cards to fake sales and drain payouts, keeping your account safe from bank reversals.

We run this platform like a secure corporate bank so your growing empire is protected from day one:

👉 {{link:Build a Highly Secure Side Stream for $1}}`,
    signoff: 'Best,',
  },
  {
    day: 15,
    afterHours: at(15),
    subject: 'Where do the visitors actually come from?',
    preview: 'No social media following? No problem. Use our internal traffic source.',
    body: `You might be wondering: _"Once I get my unique link, how do I actually get people to look at it if I have no social media following?"_

Inside your premium dashboard, you will find our built-in "Buy Traffic" module.

We have vetted high-tier digital advertising loops that allow you to order clean, targeted clicks straight to your link with a few taps.

You don't have to beg friends or family to buy—the system lets you buy traffic directly to feed your engine:

👉 {{link:Unlock the Traffic Hub and Claim Your Link}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 16,
    afterHours: at(16),
    subject: 'Be honest... what’s holding you back?',
    preview: "Let's address your hesitation head-on. Check out our transparent trial policy.",
    body: `I’m checking in directly because I hate seeing raw passion and hard work go to waste.

Usually, when people don't take the $1 trial, it boils down to one of three things:

1. _"I don't have enough time."_ (The system runs automatically once set up).
2. _"I'm worried I can't do the tech stuff."_ (Our done-for-you system handles 100% of the tech for you).
3. _"I've been burned by online promises before."_ (That's why it's $1. Test it yourself risk-free).

If you have 60 seconds, we have the engine.

Don't let hesitation keep you in the exact same spot next month.

Hit reply if you have questions, or click below to instantly jump into your dashboard:

👉 {{link:Claim Your 7-Day $1 Trial Right Now}}`,
    signoff: 'Best,',
  },
  {
    day: 17,
    afterHours: at(17),
    subject: 'What if it doesn’t work for you?',
    preview: 'Cancel with a single click anytime. Explore our platform entirely risk-free.',
    body: `Let's address the elephant in the room: the fear of failure.

It's completely normal to worry that this will be just another thing that doesn't pan out.

That is exactly why the 7-day trial is structured to be completely transparent.

You can log into your profile, click through every single tab, review the payout settings, and look at the traffic source before you commit to anything long-term.

If you decide it's not a perfect fit, hit cancel inside your account dashboard before day 7, and you will never be charged the monthly fee:

👉 {{link:Test Drive the System Entirely on Your Terms}}`,
    signoff: 'Best,',
  },
  {
    day: 18,
    afterHours: at(18),
    subject: 'The compounding magic of monthly rebills',
    preview: 'Ditch one-off payouts and start stacking predictable monthly recurring revenue.',
    body: `Standard affiliate networks pay you a one-time commission, which means you start back at zero dollars every single Monday morning.

Our system uses a monthly recurring engine.

When you refer a user who stays past their trial, that $30 commission flows into your account month after month.

As you add more referrals, your baseline income stacks up like building blocks.

Stop trading time for one-off payments and start building a predictable, compounding asset:

👉 {{link:Start Stacking Your Monthly Recurring Streams}}`,
    signoff: 'To your success,',
  },
  {
    day: 19,
    afterHours: at(19),
    subject: 'How I manage your cashout requests',
    preview: 'A quick behind-the-scenes look at how cashouts are processed',
    body: `I wanted to give you a quick look at how the back-end operation works.

Inside my private Admin portal, I can see every commission request the moment it matures past the 30-day holding lock.

With a single click, I can verify your account stats, approve your balance, and export a payment file to send your funds directly through PayPal, Cash App, or standard bank rails.

The system is fully greased and ready to pay out—all that is missing right now is your active profile data:

👉 {{link:Create Your Profile and Secure Your Tracking Loop}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 20,
    afterHours: at(20),
    subject: 'Stop buying systems. Start owning them.',
    preview: 'Cross the line from scrolling consumer to digital platform owner today.',
    body: `Most people spend their entire lives scrolling online, clicking other people's affiliate links, buying courses, and feeding someone else’s automated business engine.

It's time to cross the line from being a consumer to becoming a producer.

By spending a single dollar today, you stop being the person who fills out the form and become the account owner who collects the recurring processing revenue.

Flip the switch on your digital identity right here:

👉 {{link:Step Into Owner Status and Claim Your Link}}`,
    signoff: 'Best,',
  },
  {
    day: 21,
    afterHours: at(21),
    subject: 'No phone calls. No retention traps.',
    preview: 'No phone retention traps or long customer service holds. You have total control.',
    body: `We've all been trapped by subscription services that make you call a corporate hotline or chat with an aggressive representative just to close your account.

We absolutely detest those traps.

Inside our platform, subscription management is entirely user-controlled.

If you ever need to cancel, you simply click a button in your profile settings, and your account status downgrades to free instantly with zero friction.

You maintain 100% control over your financial commitments from start to finish:

👉 {{link:Enjoy Complete Freedom of Control for Only $1}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 22,
    afterHours: at(22),
    subject: 'The invisible penalty of staying a free member',
    preview: 'Your inactive tracking links are redirecting back to Admin. Turn your key on.',
    body: `Right now, your profile status is set to 'Free'.

While that lets you view basic content updates, it carries an invisible penalty.

Because you don't have an active tracking link, any traffic or potential leads you could be generating are routed directly back to the Admin pool.

You are essentially letting cash flow pass you by simply because your registration tag isn't turned on.

Don't let your digital real estate sit vacant:

👉 {{link:Activate Your Active Referral Link Instantly}}`,
    signoff: 'Best,',
  },
  {
    day: 23,
    afterHours: at(23),
    subject: 'Everything you get for $1 (A quick recap)',
    preview: 'Review the full list of tools, premium dashboard, and traffic hub waiting for you.',
    body: `Before your free account gets archived, let’s look at exactly what you're leaving on the table if you don't upgrade:

🔹 **Your Premium Dashboard:** Full access to track metrics, leads, and earnings.

🔹 **Your Active Affiliate Link:** Ready to instantly pass to traffic to start earning $30/monthly recurring commissions.

🔹 **Traffic Systems:** Access to our "Buy Traffic" module to feed your link instantly.

🔹 **Full Support & Community:** You don't have to build this alone anymore.

All of this is ready for you. It takes 60 seconds to upgrade.

👉 {{link:Click Here to Activate Everything for $1}}`,
    signoff: 'To your empire,',
  },
  {
    day: 24,
    afterHours: at(24),
    subject: 'Your link goes live in 60 seconds',
    preview: 'Our database updates instantly. Your link goes live in 60 seconds.',
    body: `If you hit the upgrade button right now, you won't have to wait for an approval team to verify your application.

The millisecond your $1 payment transaction clears, your dashboard layout shifts, your dashboard tabs unlock, and your custom referral link is live before you can even refresh the page.

Speed is leverage. Claim yours right now:

👉 {{link:Launch Your Complete System Instantly}}`,
    signoff: 'To your success,',
  },
  {
    day: 25,
    afterHours: at(25),
    subject: 'The cost of sitting on the sidelines ⏳',
    preview: 'Procrastination is the ultimate dream killer. See how other members are moving forward.',
    body: `You created a free member account nearly a month ago, because you wanted a real change.

You were tired of pushing against the same financial walls, dealing with bad outcomes, and trying to force things to happen with zero leverage.

Yet, your account is still sitting on the 'Free' tier.

Let's be honest: procrastination is the ultimate dream killer.

While you’ve been waiting for the "perfect moment" to start, other members have activated their links, utilized our traffic source, and started building compounding revenue.

The system is fully pre-built and waiting for you.

The only thing missing is your decision to turn the key.

It costs literally one dollar to step off the sidelines:

👉 {{link:Activate Your $1 Trial & Turn Your Engine On}}`,
    signoff: 'Best,',
  },
  {
    day: 26,
    afterHours: at(26),
    subject: 'Is someone else claiming your commissions?',
    preview: 'Lock in your digital real estate before other affiliates secure those commissions.',
    body: `Our system operates on a strict 30-day Last-Click cookie attribution framework.

This means internet traffic is a race of execution.

If you wait to turn on your link, other active affiliates are using our traffic source to claim cookie spaces across the web.

The longer you leave your engine turned off, the more potential referrals are snapped up by affiliates who chose to execute while you hesitated.

Get your link into the game today:

👉 {{link:Activate Your Link and Start Locking In}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 27,
    afterHours: at(27),
    subject: 'Stop starting over from scratch',
    preview: 'Stop rebuilding your business from scratch. Plug into a permanent framework.',
    body: `The most exhausting part of building a business with no money or connections is the constant cycle of starting over.

You try a strategy, hit an obstacle, run out of funds, and have to reset to absolute zero.

This automated affiliate model breaks that loop.

Because the entire website, A.I. email nurturing, and customer support system is permanently hosted and managed by us, you never have to rebuild from scratch again.

Lock into a permanent framework that builds equity over time:

👉 {{link:Plug into a Done-For-You System That Stays Turned On}}`,
    signoff: 'Best,',
  },
  {
    day: 28,
    afterHours: at(28),
    subject: 'Let our A.I. close your sales for you',
    preview: 'Our integrated A.I. assistant automatically answers inbound questions and closes your sales.',
    body: `One of the most powerful features waiting inside your dashboard is our automated email A.I. responder.

When you drive leads to your referral link, some of them will hit reply to our nurture emails with questions or hesitations.

You don't have to spend your day answering emails—our integrated A.I. assistant automatically takes over the email conversations, handles their objections, and directs them back to your link to close the sale.

Put a 24/7 digital closer to work for your bank account:

👉 {{link:Unlock Your A.I. Done-For-You System for Only $1}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 29,
    afterHours: at(29),
    subject: 'Where will you be 30 days from now?',
    preview: 'Did your financial situation shift over the last month? Here is how to break the loop.',
    body: `Tomorrow marks exactly 30 days since you entered your email to read my story.

Look back at your last month.

Did your financial situation shift?

Did your credit score magically fix itself?

Did a network of wealthy connections suddenly appear to hand you business funding?

If the answer is no, it's because you are still relying on pure willpower instead of digital leverage.

Hard work alone doesn't build wealth—automated systems do.

Your free account gives you a front-row seat, but it won't build your bank account.

Stop restarting from scratch every single Monday morning.

Invest a single dollar bill to completely change your operational leverage today:

👉 {{link:Claim Your $1 Trial Before Another Month Passes}}`,
    signoff: 'Talk soon,',
  },
  {
    day: 30,
    afterHours: at(30),
    subject: 'Final Notice: This is my final check-in. 🚨',
    preview: 'This is your final invitation to lock in the $1 trial.',
    body: `This is the 30th and final email regarding your free member account.

I’m checking in one last time because I hate seeing raw ambition and work ethic go to waste.

From this point forward, the automated daily follow-ups will stop.

The blueprints, the math, the pre-built dashboards, and the traffic strategy have all been laid out in front of you.

Your free account remains active, and you can still view it whenever you log in.

But these daily updates will no longer nudge you forward.

The choice is entirely yours.

You can choose to keep scrolling, consuming, and feeding other people's automated business engines.

Or, you can cross the line, invest a single dollar, and step up as the producer and owner you were meant to be.

The door is open. I hope to see you on the inside.

👉 {{link:Your Last Step: Activate Your 7-Day $1 Trial Here}}`,
    signoff: 'To your absolute freedom,',
  },
];

/** Index of the first email at or after `from` that is actually sent (skips held ones), or -1. */
export function nextSendableIndex(from: number): number {
  for (let i = Math.max(0, from); i < FREE_NURTURE_SEQUENCE.length; i++) {
    if (!FREE_NURTURE_SEQUENCE[i]!.hold) return i;
  }
  return -1;
}
