// Ready-to-read blogs used by prisma/replace-blogs.ts.
// Content is plain editor HTML (h2, p, lists, code, quotes), so it looks the same as a blog
// written in the admin editor. Covers live in public/thumbnails.

export type ReadableBlog = {
  slug: string;
  title: string;
  description: string;
  category: string; // category name; created if it doesn't exist
  tags: string[];
  cover: string; // file name in public/thumbnails
  content: string;
};

export const READABLE_BLOGS: ReadableBlog[] = [
  {
    slug: "nextjs-app-router-beginners-guide",
    title: "A Beginner's Guide to the Next.js App Router",
    description:
      "Folders become pages, layouts stay on screen, and data loads on the server. Here is how the App Router works, explained without the jargon.",
    category: "Web Development",
    tags: ["Next.js", "React"],
    cover: "nextjs-app-router.webp",
    content: `
<p>If you have opened a new Next.js project recently, you have seen the <code>app</code> folder. That folder is the App Router, and once you understand three ideas, the whole thing clicks: <strong>folders are routes</strong>, <strong>layouts wrap pages</strong>, and <strong>components run on the server by default</strong>.</p>

<h2>1. Folders are your URLs</h2>
<p>Every folder inside <code>app</code> becomes a part of the URL. A folder only becomes a real page when it has a <code>page.tsx</code> file inside it.</p>
<pre><code>app/
  page.tsx            →  /
  blog/
    page.tsx          →  /blog
    [slug]/
      page.tsx        →  /blog/any-post-name</code></pre>
<p>The square brackets in <code>[slug]</code> mean "this part can be anything". Next.js passes that value to your page, so one file can show every blog post.</p>

<h2>2. Layouts stay, pages change</h2>
<p>A <code>layout.tsx</code> file wraps every page inside its folder. Put your navbar and footer in the root layout and they appear on every page automatically. When the reader moves from one page to another, the layout does not reload. Only the page part changes, which is why App Router sites feel fast.</p>
<p>You can also use folders in round brackets, like <code>(public)</code>. They group pages under one layout without adding anything to the URL.</p>

<h2>3. Server Components by default</h2>
<p>Every component in the <code>app</code> folder is a <strong>Server Component</strong> unless you say otherwise. It runs on the server, so it can read from your database directly and send finished HTML to the browser. No loading spinners for basic data, and no secret keys in the browser.</p>
<p>When a component needs clicks, state or browser APIs, add <code>"use client"</code> at the top of the file. A good rule: keep pages on the server, and make only the small interactive pieces (a menu button, a like button, a form) client components.</p>

<h2>4. Loading and error states for free</h2>
<p>Add a <code>loading.tsx</code> next to a page and Next.js shows it while the page loads. Add an <code>error.tsx</code> and it shows that instead of a crash if something fails. You can also wrap slow parts of a page in <code>&lt;Suspense&gt;</code> so the rest of the page appears instantly.</p>

<h2>5. API routes live here too</h2>
<p>A file called <code>route.ts</code> creates an API endpoint instead of a page. Export a function named after the HTTP method:</p>
<pre><code>// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: "Hello!" });
}</code></pre>

<h2>Quick summary</h2>
<ul>
  <li><strong>page.tsx</strong> makes a folder visitable.</li>
  <li><strong>layout.tsx</strong> wraps pages and stays on screen.</li>
  <li><strong>Server Components</strong> are the default; add <code>"use client"</code> only when you need interactivity.</li>
  <li><strong>loading.tsx</strong> and <strong>error.tsx</strong> handle the in-between states.</li>
  <li><strong>route.ts</strong> builds your API.</li>
</ul>
<p>Start with one page and one layout, then add folders as your site grows. The structure of your project will read exactly like the structure of your website.</p>
`,
  },
  {
    slug: "clean-code-habits-for-beginners",
    title: "Clean Code: 7 Habits That Make Your Code Easy to Read",
    description:
      "Code is read far more often than it is written. These seven small habits make your code easier for teammates, reviewers and future you.",
    category: "Programming",
    tags: ["Clean Code", "Best Practices"],
    cover: "clean-code-habits.webp",
    content: `
<p>Most of your time as a developer is not spent writing new code. It is spent reading code: your teammate's, a library's, and your own from three months ago. Clean code simply means code that is easy to read and safe to change. Here are seven habits that get you most of the way there.</p>

<h2>1. Name things by what they mean</h2>
<p>A good name removes the need for a comment. Compare these two lines:</p>
<pre><code>const d = 7;
const daysUntilTrialEnds = 7;</code></pre>
<p>The second one explains itself. Use full words, name booleans like questions (<code>isPublished</code>, <code>hasAccess</code>) and name functions after what they do (<code>sendInvoice</code>, not <code>handleStuff</code>).</p>

<h2>2. Keep functions small and focused</h2>
<p>A function should do one job. If you need the word "and" to describe it, it probably wants to be two functions. Small functions are easier to test, easier to reuse and much easier to name well.</p>

<h2>3. Return early</h2>
<p>Deep nesting makes code hard to follow. Handle the bad cases first and leave the function early:</p>
<pre><code>function publish(post) {
  if (!post) return "No post";
  if (!post.title) return "Title is missing";

  // the happy path, with no nesting
  return save(post);
}</code></pre>

<h2>4. Don't repeat yourself, but don't rush it</h2>
<p>If the same logic appears in three places, move it into one function. But wait until you actually see the repetition. Combining two things that only look similar often creates a confusing function full of special cases.</p>

<h2>5. Write comments that explain why</h2>
<p>The code already says <em>what</em> it does. A useful comment explains <em>why</em>: a business rule, a workaround, or a decision that looks strange without context.</p>
<blockquote>Bad: "add 1 to count". Good: "the API counts from zero, our UI counts from one".</blockquote>

<h2>6. Be consistent</h2>
<p>Pick one style for naming, quotes, spacing and file structure, then stick to it. Tools like Prettier and ESLint do this automatically, so your reviews can focus on logic instead of commas.</p>

<h2>7. Leave it a little better</h2>
<p>Every time you touch a file, improve one small thing: rename a vague variable, delete dead code, split a long function. Small cleanups add up, and the codebase gets better instead of slowly decaying.</p>

<h2>The real test</h2>
<p>Ask yourself: could a classmate understand this file in five minutes without asking me anything? If yes, your code is clean enough. If not, you now know exactly what to fix.</p>
`,
  },
  {
    slug: "git-and-github-commands-you-will-use",
    title: "Git and GitHub: The Commands You Will Actually Use",
    description:
      "You don't need 100 Git commands. These are the ones you will use every week, explained with a simple team workflow.",
    category: "Programming",
    tags: ["Git", "GitHub"],
    cover: "git-github-commands.webp",
    content: `
<p>Git looks scary because it has hundreds of commands. The good news: on a normal team project you will use about ten of them. Learn these well and you can work with anyone.</p>

<h2>Git vs GitHub</h2>
<p><strong>Git</strong> is the tool on your laptop that saves versions of your code. <strong>GitHub</strong> is a website that stores a copy online so your team can share it. You commit with Git, and you push to GitHub.</p>

<h2>Getting the project</h2>
<pre><code>git clone https://github.com/team/project.git
cd project</code></pre>

<h2>The daily loop</h2>
<ol>
  <li><strong>See what changed:</strong> <code>git status</code></li>
  <li><strong>Choose what to save:</strong> <code>git add .</code> (or name specific files)</li>
  <li><strong>Save a version:</strong> <code>git commit -m "feat: add search bar"</code></li>
  <li><strong>Share it:</strong> <code>git push</code></li>
</ol>
<p>Write commit messages that finish the sentence "This commit will...". Short and specific beats long and vague.</p>

<h2>Work on branches, not on main</h2>
<p>A branch is your own copy of the project where you can build a feature without breaking anyone else's work.</p>
<pre><code>git checkout -b feat/search      # create and switch
git push -u origin feat/search   # first push of the branch</code></pre>
<p>When the feature is ready, open a <strong>Pull Request</strong> on GitHub. Your teammate reviews it, and once approved it gets merged into <code>main</code>.</p>

<h2>Stay up to date</h2>
<pre><code>git checkout main
git pull                 # get your team's latest work
git checkout feat/search
git merge main           # bring it into your branch</code></pre>
<p>Do this often. Small, frequent merges mean small, easy conflicts.</p>

<h2>When things go wrong</h2>
<ul>
  <li><code>git diff</code> shows exactly what you changed before you commit.</li>
  <li><code>git restore file.ts</code> throws away your changes to one file.</li>
  <li><code>git log --oneline</code> shows recent commits in a short list.</li>
  <li><code>git stash</code> puts your changes aside so you can switch branches, and <code>git stash pop</code> brings them back.</li>
</ul>

<h2>A simple team rule set</h2>
<ul>
  <li>Never commit directly to <code>main</code>.</li>
  <li>One branch per feature.</li>
  <li>Pull before you start, push before you stop.</li>
  <li>Never commit your <code>.env</code> file or passwords.</li>
</ul>
<p>Follow these and Git stops being scary. It becomes a safety net that lets you try anything, because you can always go back.</p>
`,
  },
  {
    slug: "what-is-serverless-and-when-to-use-it",
    title: "What Is Serverless, and When Should You Use It?",
    description:
      "Serverless doesn't mean there are no servers. It means you stop managing them. Here is how it works, what it costs, and when it is the right choice.",
    category: "Cloud",
    tags: ["Serverless", "Cloud Computing"],
    cover: "what-is-serverless.webp",
    content: `
<p>"Serverless" is one of the most confusing names in tech. Your code still runs on servers. The difference is that <strong>you never set up, patch or scale those servers yourself</strong>. The cloud provider does it, and you only pay when your code actually runs.</p>

<h2>How it works</h2>
<p>Instead of a server that runs all day waiting for visitors, you write small functions. When a request comes in, the platform starts your function, runs it, returns the answer, and shuts it down. If a thousand people arrive at once, it runs a thousand copies. If nobody visits at night, nothing runs and you pay nothing.</p>
<p>Popular examples include AWS Lambda, Vercel Functions and Cloudflare Workers. Databases have gone serverless too: services like Neon scale a Postgres database down when it is idle and wake it up on the next query.</p>

<h2>Why people love it</h2>
<ul>
  <li><strong>No server management.</strong> No operating system updates, no SSH, no 2 a.m. crashes because a disk filled up.</li>
  <li><strong>Automatic scaling.</strong> Traffic spikes from a viral post are handled for you.</li>
  <li><strong>Pay per use.</strong> Side projects and college apps often stay inside the free tier.</li>
  <li><strong>Fast to ship.</strong> Push your code and it is live in minutes.</li>
</ul>

<h2>The trade-offs</h2>
<ul>
  <li><strong>Cold starts.</strong> A function that hasn't run for a while can take a moment to wake up.</li>
  <li><strong>Time limits.</strong> Functions usually stop after a few seconds or minutes, so long video processing jobs are a poor fit.</li>
  <li><strong>Costs at scale.</strong> For apps with heavy, constant traffic, a regular server can become cheaper.</li>
  <li><strong>Harder debugging.</strong> Your app is spread across many small pieces, so good logging matters.</li>
</ul>

<h2>When to choose serverless</h2>
<p>Serverless is a great fit for websites, APIs, blogs, form handlers, webhooks and apps with unpredictable traffic. It is the default choice for most student projects and early startups because it lets a small team move fast without a DevOps engineer.</p>
<p>Pick a traditional server (or containers) when you have long running jobs, need a constant connection like a game server, or have steady heavy traffic where every rupee of cloud cost matters.</p>

<h2>The bottom line</h2>
<blockquote>Serverless lets you spend your time on your product instead of your servers.</blockquote>
<p>Start serverless, measure your usage, and move only the parts that outgrow it. That is how most modern products are built today.</p>
`,
  },
  {
    slug: "docker-for-beginners-containers-explained",
    title: "Docker for Beginners: Containers Explained Simply",
    description:
      "\"It works on my machine\" stops being a problem with containers. Learn what Docker is, why teams use it, and the five commands to get started.",
    category: "DevOps",
    tags: ["Docker", "Containers"],
    cover: "docker-for-beginners.webp",
    content: `
<p>Every developer has heard this line: "But it works on my machine!" Your app runs perfectly on your laptop and breaks on your friend's laptop or the server, because of a different Node version, a missing library or a different operating system. Docker exists to end that problem.</p>

<h2>The shipping container idea</h2>
<p>Before shipping containers, every port loaded cargo differently. Then the world agreed on one standard box, and suddenly any ship, truck or crane could carry anything. Docker does the same for software. It packs your app <strong>together with everything it needs</strong> (runtime, libraries, settings) into one standard box called a <strong>container</strong>. If the box runs on your laptop, it runs the same way everywhere.</p>

<h2>Three words to know</h2>
<ul>
  <li><strong>Dockerfile:</strong> a recipe that lists how to build your app.</li>
  <li><strong>Image:</strong> the result of that recipe, a frozen package ready to run.</li>
  <li><strong>Container:</strong> a running copy of an image. You can start many containers from one image.</li>
</ul>

<h2>A tiny Dockerfile for a Node app</h2>
<pre><code>FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]</code></pre>
<p>Read it top to bottom: start from Node 22, copy the package files, install dependencies, copy the rest of the code, and start the app on port 3000.</p>

<h2>The five commands you need first</h2>
<ol>
  <li><code>docker build -t my-app .</code> builds an image from your Dockerfile.</li>
  <li><code>docker run -p 3000:3000 my-app</code> starts a container and opens port 3000.</li>
  <li><code>docker ps</code> lists running containers.</li>
  <li><code>docker logs &lt;id&gt;</code> shows what the app printed.</li>
  <li><code>docker stop &lt;id&gt;</code> stops it.</li>
</ol>

<h2>Containers vs virtual machines</h2>
<p>A virtual machine copies an entire computer, operating system included, so it is heavy and slow to start. A container shares the host's system and only carries what your app needs. It starts in seconds and uses far less memory, which is why you can run dozens on one laptop.</p>

<h2>Where Docker helps most</h2>
<ul>
  <li>New teammates run one command instead of following a long setup guide.</li>
  <li>You can run a database like Postgres locally without installing it.</li>
  <li>What you test is exactly what you deploy.</li>
</ul>
<p>Start by putting one small project in a container. Once you see it run identically on two machines, you will understand why almost every modern team uses Docker.</p>
`,
  },
  {
    slug: "how-to-spot-a-phishing-message",
    title: "How to Spot a Phishing Message Before It Fools You",
    description:
      "Fake bank SMS, \"urgent\" emails and too-good-to-be-true offers. Learn the warning signs of phishing and exactly what to do if you clicked.",
    category: "Cybersecurity",
    tags: ["Phishing", "Online Safety"],
    cover: "spot-phishing-messages.webp",
    content: `
<p>Most hacks don't start with clever code. They start with a message that tricks a person into clicking a link, sharing an OTP or typing a password into a fake page. This is called <strong>phishing</strong>, and the best defence is simply knowing what it looks like.</p>

<h2>The six warning signs</h2>
<ol>
  <li><strong>Urgency or fear.</strong> "Your account will be blocked in 2 hours!" Real companies rarely give you minutes to act.</li>
  <li><strong>A strange sender.</strong> The name says your bank, but the email address or number is random.</li>
  <li><strong>Lookalike links.</strong> Watch for small changes like <code>amaz0n</code>, <code>paytm-kyc-update.xyz</code> or extra words added to a real brand name.</li>
  <li><strong>Requests for secrets.</strong> No bank, delivery app or college will ever ask for your OTP, PIN or password.</li>
  <li><strong>Too good to be true.</strong> Free iPhones, surprise cashback or a job offer you never applied for.</li>
  <li><strong>Unexpected attachments.</strong> Files like "invoice.apk" or a zip you weren't expecting.</li>
</ol>

<h2>Check before you click</h2>
<ul>
  <li>On a laptop, hover over the link to see the real address. On a phone, press and hold.</li>
  <li>Don't use the link in the message. Open the official app or type the website yourself.</li>
  <li>If a "friend" asks for money urgently on chat, call them on their normal number first.</li>
</ul>
<blockquote>Rule of thumb: if a message makes you panic, pause. Panic is exactly what the attacker wants.</blockquote>

<h2>Make yourself a harder target</h2>
<ul>
  <li><strong>Turn on two-factor authentication</strong> for email, banking and social media. A stolen password alone is then not enough.</li>
  <li><strong>Use a password manager</strong> so every account has a different strong password. It also won't autofill on a fake site, which is a useful warning.</li>
  <li><strong>Keep your phone and apps updated.</strong> Updates fix security holes attackers rely on.</li>
</ul>

<h2>Already clicked? Do this now</h2>
<ol>
  <li>Don't enter anything else on that page. Close it.</li>
  <li>Change the password of the affected account, and any account that used the same password.</li>
  <li>If you shared bank details or an OTP, call your bank immediately to block the card or account.</li>
  <li>In India, report financial fraud on the cybercrime helpline <strong>1930</strong> or at cybercrime.gov.in.</li>
</ol>
<p>Phishing works because it is fast and emotional. Slow down for ten seconds, check the sender and the link, and you will avoid almost every scam that lands in your inbox.</p>
`,
  },
  {
    slug: "how-to-land-your-first-tech-internship",
    title: "How to Land Your First Tech Internship as a Student",
    description:
      "No experience? No problem. A practical plan to build proof of skill, write a resume that gets read, and turn applications into interviews.",
    category: "Career",
    tags: ["Internships", "Resume"],
    cover: "first-tech-internship.webp",
    content: `
<p>The hardest internship to get is the first one. Every posting seems to want experience, and you can't get experience without an internship. The way out is simple: <strong>stop trying to look experienced and start showing proof</strong>.</p>

<h2>Step 1: Pick one direction</h2>
<p>"Open to anything" sounds flexible but reads as unfocused. Choose one role for now: frontend, backend, data analyst, product, or design. You can change later, but one clear direction makes every next step easier.</p>

<h2>Step 2: Build two real projects</h2>
<p>Tutorial clones don't stand out. Build something that solves a real problem for real people, even a small group: your college club, a local shop, your hostel.</p>
<ul>
  <li>Put the code on GitHub with a clear README and screenshots.</li>
  <li>Deploy it so anyone can open a live link.</li>
  <li>Write down one problem you faced and how you solved it. Interviewers love this story.</li>
</ul>

<h2>Step 3: A one-page resume that gets read</h2>
<ul>
  <li><strong>Projects first</strong> if you don't have work experience yet.</li>
  <li>Start each point with an action and end with a result: "Built a booking page that cut manual calls by half".</li>
  <li>List only the skills you can talk about for five minutes.</li>
  <li>Add your GitHub, LinkedIn and portfolio links at the top.</li>
</ul>

<h2>Step 4: Apply smart, not just more</h2>
<p>Sending 200 copies of the same resume rarely works. Send 20 tailored ones instead.</p>
<ul>
  <li>Match the words in your resume to the job description.</li>
  <li>Find someone on the team on LinkedIn and send a short, specific message, not "please refer me".</li>
  <li>Startups often hire faster than big companies and give you more real work.</li>
  <li>Use your college placement cell, alumni and hackathons. Many first internships come from people, not portals.</li>
</ul>

<h2>Step 5: Prepare for the interview</h2>
<ol>
  <li>Know every line of your resume and every decision in your projects.</li>
  <li>Practice explaining your project in two minutes: the problem, what you built, and what you learned.</li>
  <li>Revise the basics of your field, and solve a few easy coding or case problems out loud.</li>
  <li>Prepare one good question to ask them about the team or the work.</li>
</ol>

<h2>Handle rejection like data</h2>
<p>You will hear "no" many times. That is normal. After each rejection, ask what you can improve: the resume, the projects or the interview answers. Fix one thing, then apply again.</p>
<blockquote>You don't need to be the best candidate. You need to be the clearest one.</blockquote>
`,
  },
  {
    slug: "use-ai-tools-to-learn-faster",
    title: "How to Use AI Tools to Learn Faster (Without Cheating Yourself)",
    description:
      "AI can be the best tutor you've ever had or a shortcut that leaves you knowing nothing. Here is how to use it so you actually learn.",
    category: "Technology",
    tags: ["AI", "Learning"],
    cover: "learn-faster-with-ai.webp",
    content: `
<p>AI assistants can explain any topic, at any hour, as many times as you need. That makes them incredible learning tools. They can also do your work for you, which feels productive but teaches you nothing. The difference is in how you ask.</p>

<h2>Ask for explanations, not answers</h2>
<p>Instead of "solve this question", try:</p>
<ul>
  <li>"Explain this concept like I'm new to it, then give me one example."</li>
  <li>"I think the answer is X because Y. Where is my reasoning wrong?"</li>
  <li>"Give me a hint for the next step, but don't solve it."</li>
</ul>
<p>You still do the thinking. The AI just removes the moments where you are completely stuck.</p>

<h2>Make it quiz you</h2>
<p>Reading feels like learning, but recalling is what makes it stick. After studying a topic, ask: "Ask me five questions on this, one at a time, and tell me what I got wrong." Five minutes of this beats an hour of rereading notes.</p>

<h2>Use it to understand code, not copy it</h2>
<p>When you find code you don't understand, paste it and ask the AI to explain it line by line. Then close the chat and rewrite it yourself from memory. If you can't, you didn't understand it yet, and that is useful to know.</p>

<h2>Always verify</h2>
<p>AI tools can sound confident and still be wrong, especially with facts, numbers, recent events and new versions of libraries. Check important answers against official documentation or your textbook. Treat the AI as a smart friend, not as the final source.</p>

<h2>A simple study routine</h2>
<ol>
  <li><strong>Learn:</strong> read or watch the material first.</li>
  <li><strong>Clarify:</strong> ask the AI about the parts that confused you.</li>
  <li><strong>Practice:</strong> solve problems yourself, asking only for hints.</li>
  <li><strong>Test:</strong> have the AI quiz you without notes.</li>
  <li><strong>Teach:</strong> explain the topic back to the AI and ask it to find gaps in your explanation.</li>
</ol>

<h2>Know where the line is</h2>
<p>Submitting AI-written work as your own in an exam or assignment usually breaks your college's rules, and it skips the exact skill the assignment was meant to build. Use AI to understand, practice and review. Do the final work yourself.</p>
<blockquote>The goal isn't to finish faster. It's to understand faster.</blockquote>
<p>Used this way, AI turns every topic into a one-on-one tutoring session. That is a huge advantage, as long as you are the one doing the learning.</p>
`,
  },
];
