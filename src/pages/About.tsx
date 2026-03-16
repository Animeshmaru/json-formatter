import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  CheckCircle,
  Minimize2,
  Layers,
  Share2,
  Lock,
  WifiOff,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Zap,
    title: 'Format & Beautify',
    desc: 'Instantly pretty-print JSON with configurable 2-space, 4-space or tab indentation.',
  },
  {
    icon: CheckCircle,
    title: 'Real-time Validation',
    desc: 'Errors are highlighted as you type with the exact line and column number shown.',
  },
  {
    icon: Minimize2,
    title: 'Minify JSON',
    desc: 'Strip all whitespace to produce compact JSON ready for APIs and production use.',
  },
  {
    icon: Layers,
    title: 'Multi-tab Editing',
    desc: 'Open and work on multiple JSON documents simultaneously in independent tabs.',
  },
  {
    icon: Share2,
    title: 'Share via URL',
    desc: 'Generate a shareable link that encodes your JSON directly in the URL — no upload needed.',
  },
  {
    icon: Lock,
    title: '100% Private',
    desc: 'Everything runs in your browser. No data is ever sent to any server.',
  },
  {
    icon: WifiOff,
    title: 'Works Offline',
    desc: 'Once loaded, all features work without an internet connection.',
  },
];

const faqs = [
  {
    q: 'What is a JSON formatter?',
    a: 'A JSON formatter (also called a JSON beautifier or pretty printer) takes raw or minified JSON and adds proper indentation and line breaks, making it easy to read and understand.',
  },
  {
    q: 'Is my data safe?',
    a: 'Completely. This tool runs entirely in your browser — there is no server and no network request is ever made with your data.',
  },
  {
    q: 'Does it work offline?',
    a: 'Yes. Once the page loads, all features work without an internet connection.',
  },
  {
    q: 'How do I validate JSON?',
    a: 'Paste your JSON into the editor. Errors are shown in real time with the exact location so you can fix them quickly.',
  },
  {
    q: 'Can I format multiple JSON files at once?',
    a: 'Yes. Use the multi-tab interface to open and work on multiple JSON documents simultaneously. Each tab is fully independent.',
  },
];

const About = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'About — Multi JSON Formatter';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Formatter
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">About</h1>
            <p className="text-muted-foreground">Free, fast, private JSON tooling</p>
          </div>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Multi JSON Formatter</strong> is a free, open-source
            JSON formatter, validator, and beautifier that runs entirely in your browser. No
            sign-up, no ads, no tracking — just fast JSON tooling for developers.
          </p>
        </div>

        {/* Features */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
        <div className="space-y-3 mb-10">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="text-lg font-semibold text-foreground mb-4">
          <span className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </span>
        </h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <div key={q} className="p-4 rounded-lg bg-card border border-border">
              <dt className="font-semibold text-foreground mb-1">{q}</dt>
              <dd className="text-sm text-muted-foreground">{a}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
