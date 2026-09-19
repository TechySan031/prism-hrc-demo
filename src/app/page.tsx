'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, BarChart3, Target, Sparkles, CheckCircle,
  Shield, ArrowRight, Upload, Palette
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui';

export default function LandingPage() {
  const router = useRouter();
  const { loginDemo } = useApp();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleAnalyze = () => {
    loginDemo();
    router.push('/analyzer/upload');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-prism-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-navy-800">Prism HRC</span>
              <span className="text-xs text-warm-500 ml-1.5 hidden sm:inline">Resume Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-warm-600 hover:text-navy-800 transition-colors hidden sm:inline">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-warm-600 hover:text-navy-800 transition-colors">
              Sign in
            </Link>
            <Button size="sm" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-prism-50 text-prism-700 text-xs font-medium mb-6 border border-prism-100">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Prism HRC recruitment expertise
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-800 leading-tight mb-5">
            Build a resume that reflects your{' '}
            <span className="text-prism-600">real potential</span>
          </h1>
          <p className="text-base sm:text-lg text-warm-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Create, improve, and tailor your resume with guidance grounded in your experience.
            Designed for modern careers across technology, business, and specialized roles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleGetStarted} icon={<FileText className="w-4.5 h-4.5" />}>
              Build my resume
            </Button>
            <Button variant="outline" size="lg" onClick={handleAnalyze} icon={<Upload className="w-4.5 h-4.5" />}>
              Analyze existing resume
            </Button>
          </div>
        </div>

        {/* Preview mockup */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-warm-50 border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white rounded-xl border border-border p-4 sm:p-6">
                <div className="space-y-4">
                  <div>
                    <div className="h-5 w-48 bg-navy-800 rounded mb-2" />
                    <div className="h-3 w-32 bg-prism-200 rounded" />
                  </div>
                  <div className="h-px bg-border" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-warm-100 rounded" />
                    <div className="h-3 w-5/6 bg-warm-100 rounded" />
                    <div className="h-3 w-4/6 bg-warm-100 rounded" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-40 bg-navy-800 rounded" />
                    <div className="h-3 w-full bg-warm-100 rounded" />
                    <div className="h-3 w-5/6 bg-warm-100 rounded" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-prism-500" />
                    <span className="text-xs font-semibold text-navy-800">Resume Score</span>
                  </div>
                  <div className="text-2xl font-bold text-prism-600">74<span className="text-sm text-warm-400">/100</span></div>
                  <div className="mt-2 h-2 bg-warm-100 rounded-full">
                    <div className="h-2 bg-prism-500 rounded-full" style={{ width: '74%' }} />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold text-navy-800">Job Match</span>
                  </div>
                  <div className="text-2xl font-bold text-success">78<span className="text-sm text-warm-400">%</span></div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-prism-400" />
                    <span className="text-xs font-semibold text-navy-800">3 suggestions</span>
                  </div>
                  <p className="text-xs text-warm-500 mt-1">Ready to improve</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-warm-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-warm-600 mb-12 max-w-xl mx-auto">
            A structured workflow that turns your experience into a clear, professional resume.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Upload className="w-5 h-5" />, title: 'Start', desc: 'Upload an existing resume, start from scratch, or use a template.' },
              { icon: <BarChart3 className="w-5 h-5" />, title: 'Analyze', desc: 'Get a detailed quality analysis with specific, actionable recommendations.' },
              { icon: <Sparkles className="w-5 h-5" />, title: 'Improve', desc: 'Review AI-powered suggestions that you control and verify before applying.' },
              { icon: <Target className="w-5 h-5" />, title: 'Tailor', desc: 'Match your resume to a specific role with keyword and skill alignment.' },
            ].map((step, i) => (
              <div key={step.title} className="relative bg-white rounded-xl border border-border p-5 group hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-prism-50 flex items-center justify-center text-prism-600 mb-4 group-hover:bg-prism-100 transition-colors">
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 text-xs font-bold text-warm-300">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-base font-semibold text-navy-800 mb-2">{step.title}</h3>
                <p className="text-sm text-warm-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-4">
                Analyze your existing resume
              </h2>
              <p className="text-warm-600 mb-6 leading-relaxed">
                Upload your current resume and receive a detailed quality report. See exactly where your resume is strong and where specific improvements can make a difference.
              </p>
              <ul className="space-y-3">
                {['ATS compatibility analysis', 'Content quality scoring', 'Skills and keyword alignment', 'Specific improvement recommendations'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-warm-700">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-warm-50 rounded-2xl border border-border p-6">
              <div className="space-y-4">
                {[
                  { label: 'ATS Compatibility', score: 82, color: 'bg-success' },
                  { label: 'Content Quality', score: 71, color: 'bg-prism-500' },
                  { label: 'Skills & Keywords', score: 68, color: 'bg-warn' },
                  { label: 'Experience Impact', score: 72, color: 'bg-prism-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-warm-700 font-medium">{item.label}</span>
                      <span className="text-warm-500">{item.score}/100</span>
                    </div>
                    <div className="h-2 bg-warm-200 rounded-full">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-warm-50 rounded-2xl border border-border p-6">
              <div className="bg-white rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-navy-800">
                  <Sparkles className="w-3.5 h-3.5 text-prism-500" />
                  AI Suggestion
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-prism-50 text-prism-600 text-[10px] font-medium">Simulated</span>
                </div>
                <div className="p-3 bg-warm-50 rounded-lg border border-border">
                  <p className="text-xs text-warm-500 mb-1">Original</p>
                  <p className="text-sm text-warm-700">Built an ML pipeline using Kubeflow</p>
                </div>
                <div className="p-3 bg-prism-50 rounded-lg border border-prism-100">
                  <p className="text-xs text-prism-600 mb-1">Suggested improvement</p>
                  <p className="text-sm text-navy-800">Architected end-to-end MLOps pipeline with Kubeflow, accelerating model deployment from 2 weeks to 4 hours</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-4">
                Improve with grounded guidance
              </h2>
              <p className="text-warm-600 mb-6 leading-relaxed">
                Receive practical, explainable suggestions to strengthen your resume. Every recommendation is based on your actual experience — you always control what gets applied.
              </p>
              <ul className="space-y-3">
                {['Achievement-focused rewording', 'Quantified impact suggestions', 'Grammar and clarity improvements', 'Role-specific tailoring'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-warm-700">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Templates preview */}
      <section className="bg-warm-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 text-center mb-4">
            Professional templates
          </h2>
          <p className="text-center text-warm-600 mb-12 max-w-xl mx-auto">
            Choose from three carefully designed templates. Each one works with the same resume data — switch instantly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: 'ATS Professional', label: 'ATS-Friendly', desc: 'Clean single-column layout optimized for applicant tracking systems' },
              { name: 'Modern Split', label: 'Modern', desc: 'Contemporary two-column design balancing visual appeal with readability' },
              { name: 'Minimal Executive', label: 'Executive', desc: 'Refined, spacious layout for senior professionals and leadership roles' },
            ].map((tmpl) => (
              <div key={tmpl.name} className="bg-white rounded-xl border border-border p-5 group hover:shadow-md transition-all cursor-pointer" onClick={handleGetStarted}>
                <div className="aspect-[8.5/11] bg-warm-50 rounded-lg border border-border mb-4 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-warm-300" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-navy-800">{tmpl.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-prism-50 text-prism-600 text-[10px] font-medium">{tmpl.label}</span>
                </div>
                <p className="text-xs text-warm-500">{tmpl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-10 h-10 text-prism-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-4">
            Your privacy matters
          </h2>
          <p className="text-warm-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your resume data is yours. We don&apos;t share your information with employers without your explicit consent.
            All AI processing is designed to help you present your experience more effectively.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            {[
              { title: 'You control your data', desc: 'Delete your data at any time. No hidden data retention.' },
              { title: 'Transparent AI', desc: 'Every AI suggestion includes an explanation. You decide what to apply.' },
              { title: 'No false promises', desc: 'We help improve your resume. We don\'t guarantee interview outcomes.' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-warm-50 border border-border">
                <h3 className="text-sm font-semibold text-navy-800 mb-1">{item.title}</h3>
                <p className="text-xs text-warm-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-800 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Your experience deserves a stronger presentation
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-8">
            Turn your real experience into a clear, professional resume. Start for free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleGetStarted} icon={<ArrowRight className="w-4 h-4" />}>
              Start building
            </Button>
            <Button variant="ghost" size="lg" className="!text-white/80 hover:!text-white hover:!bg-white/10" onClick={handleAnalyze}>
              Analyze my resume
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-warm-50 border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-prism-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">P</span>
                </div>
                <span className="text-sm font-semibold text-navy-800">Prism HRC Resume Studio</span>
              </div>
              <p className="text-xs text-warm-500 max-w-xs">
                A product by Prism HRC — specialized recruitment and staffing. Building teams, not merely filling roles.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="text-xs font-semibold text-navy-800 mb-3 uppercase tracking-wider">Product</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Resume Builder', href: '#' },
                    { label: 'Resume Analyzer', href: '#' },
                    { label: 'Templates', href: '#' },
                    { label: 'Pricing', href: '/pricing' },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-xs text-warm-500 hover:text-prism-600 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-navy-800 mb-3 uppercase tracking-wider">Company</h4>
                <ul className="space-y-2">
                  {['About Prism HRC', 'Privacy Policy', 'Terms of Service'].map((label) => (
                    <li key={label}>
                      <span className="text-xs text-warm-500">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-warm-400">
              © {new Date().getFullYear()} Prism HRC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
