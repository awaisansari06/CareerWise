import Link from "next/link";
import { ArrowRight, Check, FileText, Mic, Compass, Sparkles, ChevronRight } from "lucide-react";
import { MotionSection } from "@/components/motion-primitives";
import HeroSection from "@/components/hero";
import { LandingStagger, LandingFadeUp, LandingScale } from "@/components/landing-animations";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "./data/faqs";
import { siteConfig } from "@/lib/site-config";

const stages = [
  { title: "Your experience, understood", description: "Start with what you've done. Find the strengths and experience you can build on.", kind: "profile" },
  { title: "Career options, explained", description: "Connect your skills to career possibilities, then see what it takes to get there.", kind: "roles" },
  { title: "Your next step, made practical", description: "Strengthen your resume, prepare for interviews, and turn your insights into action.", kind: "practice" },
];

function StoryPreview({ kind }) {
  if (kind === "profile") return <div className="cw-story-preview"><div className="cw-mini-label"><FileText size={15} /> YOUR CAREER PROFILE</div><h4>A foundation to build on.</h4><p>Bring your experience into focus.</p><div className="cw-profile-lines">{["Your experience", "Transferable skills", "Growth opportunities"].map((item) => <span key={item}><Check size={14} />{item}</span>)}</div><span className="cw-example-label">Example profile</span></div>;
  if (kind === "roles") return <div className="cw-story-preview"><div className="cw-mini-label"><Compass size={15} /> EXPLORE WHAT&apos;S POSSIBLE</div><h4>More than one way forward.</h4><div className="cw-role-list">{["Business Analyst", "Operations Lead", "Customer Success Manager"].map((role, index) => <span key={role}><span className="cw-role-avatar">0{index + 1}</span><strong>{role}</strong><ChevronRight size={15} /></span>)}</div><span className="cw-example-label">Illustrative career paths</span></div>;
  return <div className="cw-story-preview"><div className="cw-mini-label"><Mic size={15} /> INTERVIEW PRACTICE</div><h4>Build confidence with context.</h4><blockquote>&ldquo;Tell me about a challenge you helped your team overcome.&rdquo;</blockquote><div className="cw-waveform" aria-hidden="true">{[12, 20, 31, 18, 39, 25, 46, 30, 16, 34, 24, 41, 22, 14, 26, 18, 10].map((height, i) => <i key={i} style={{ height }} />)}<span><Mic size={18} /></span></div><span className="cw-example-label">Example practice question</span></div>;
}

export default function LandingPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: siteConfig.name, url: siteConfig.url, applicationCategory: "BusinessApplication", operatingSystem: "Web", description: siteConfig.description, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  return (
    <div className="cw-design cw-landing cw-portrait-landing">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <HeroSection />

      {/* ─── How it works ─── */}
      <MotionSection id="how-it-works" className="cw-section cw-story" aria-labelledby="story-title">
        <div className="cw-container">
          <LandingStagger className="cw-section-heading">
            <LandingFadeUp>
              <p className="cw-eyebrow">How it works</p>
              <h2 id="story-title">From a first direction<br className="hidden lg:block" /> to a plan you can follow.</h2>
            </LandingFadeUp>
            <LandingFadeUp>
              <p>Go deeper at each milestone: understand your strengths, compare directions, then prepare for the role you choose.</p>
            </LandingFadeUp>
          </LandingStagger>

          <LandingStagger className="cw-stage-grid">
            {stages.map((stage, index) => (
              <LandingScale key={stage.kind}>
                <article className="cw-stage">
                  <div className="cw-stage-number"><span>0{index + 1}</span><i aria-hidden="true" /></div>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                  <StoryPreview kind={stage.kind} />
                </article>
              </LandingScale>
            ))}
          </LandingStagger>
        </div>
      </MotionSection>

      {/* ─── Toolkit ─── */}
      <MotionSection id="features" className="cw-section cw-tools" aria-labelledby="tools-title">
        <div className="cw-container">
          <LandingStagger className="cw-section-heading">
            <LandingFadeUp>
              <p className="cw-eyebrow">Your career toolkit</p>
              <h2 id="tools-title">Practical tools.<br />Real forward motion.</h2>
            </LandingFadeUp>
            <LandingFadeUp>
              <p>Everything connects to your experience, so you spend less time wondering and more time preparing.</p>
            </LandingFadeUp>
          </LandingStagger>

          <LandingStagger className="cw-tool-grid">
            <LandingScale>
              <Link href="/resume" className="cw-tool-card cw-tool-blue"><div className="cw-tool-icon"><FileText /></div><div><p className="cw-eyebrow">Resume intelligence</p><h3>Make your experience<br />easier to see.</h3><p>Find the weak spots in your resume and get specific suggestions to strengthen your story.</p><span className="cw-text-link">Review my resume <ArrowRight size={16} /></span></div><div className="cw-tool-excerpt"><span><Check size={15} /> Highlight your strongest experience</span><span><Check size={15} /> Make achievements more specific</span><span><Sparkles size={15} /> Find opportunities to improve</span></div></Link>
            </LandingScale>
            <LandingScale>
              <Link href="/interview" className="cw-tool-card cw-tool-lime"><div className="cw-tool-icon"><Mic /></div><div><p className="cw-eyebrow">Interview lab</p><h3>Practice today.<br />Feel ready tomorrow.</h3><p>Prepare with questions grounded in your background, then learn from targeted feedback.</p><span className="cw-text-link">Start practicing <ArrowRight size={16} /></span></div><div className="cw-tool-excerpt"><span><Check size={15} /> Questions with context</span><span><Check size={15} /> Feedback you can act on</span><span><Sparkles size={15} /> A stronger next attempt</span></div></Link>
            </LandingScale>
          </LandingStagger>

          <LandingStagger>
            <LandingFadeUp>
              <div className="cw-connected"><Compass size={20} /><p>See the bigger picture with <Link href="/dashboard">industry insights</Link>, <Link href="/roadmap">your career roadmap</Link>, and <Link href="/ai-cover-letter">tailored cover letters</Link>.</p><ArrowRight size={20} /></div>
            </LandingFadeUp>
          </LandingStagger>
        </div>
      </MotionSection>

      {/* ─── FAQ ─── */}
      <MotionSection id="questions" className="cw-section" aria-labelledby="faq-title">
        <div className="cw-container cw-faq-grid">
          <LandingStagger>
            <LandingFadeUp>
              <p className="cw-eyebrow">A little more clarity</p>
              <h2 id="faq-title" className="cw-editorial-title">Good questions.<br />Clear answers.</h2>
              <p className="cw-muted">Get to know your career workspace before you get started.</p>
              <Link className="cw-text-link" href="/security">How we protect your information <ArrowRight size={16} /></Link>
            </LandingFadeUp>
          </LandingStagger>
          <LandingFadeUp>
            <Accordion type="single" collapsible className="cw-faq">{faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>)}</Accordion>
          </LandingFadeUp>
        </div>
      </MotionSection>

      {/* ─── Final CTA ─── */}
      <MotionSection className="cw-container cw-final-cta">
        <LandingStagger>
          <LandingFadeUp>
            <span className="cw-eyebrow">Your next chapter starts here</span>
            <h2>You have the experience.<br />Let&apos;s find your direction.</h2>
            <Link href="/dashboard" className="cw-button">Start my career plan <ArrowRight size={18} /></Link>
          </LandingFadeUp>
        </LandingStagger>
        <div className="cw-cta-orbit" aria-hidden="true" />
      </MotionSection>
    </div>
  );
}
