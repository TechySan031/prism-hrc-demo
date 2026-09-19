'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Modal } from '@/components/ui';
import { useApp } from '@/lib/context';
import { mockPricingPlans } from '@/lib/mock/user';

export default function PricingPage() {
  const { loginDemo, addToast } = useApp();
  const router = useRouter();
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [checkoutStage, setCheckoutStage] = useState<'form' | 'success'>('form');

  const handleCheckout = () => {
    setCheckoutStage('success');
    setTimeout(() => {
      addToast('success', 'Mock payment successful');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-prism-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-sm font-semibold text-navy-800">Prism HRC Resume Studio</span>
          </Link>
          <Link href="/login" className="text-sm text-warm-600 hover:text-navy-800">Sign in</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-800">Simple, transparent pricing</h1>
          <p className="text-warm-600 mt-2">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {mockPricingPlans.map((plan) => (
            <Card key={plan.id} className={`!p-6 relative ${plan.highlighted ? '!border-prism-400 ring-2 ring-prism-100' : ''}`}>
              {plan.highlighted && (
                <Badge variant="prism" className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <h3 className="text-lg font-bold text-navy-800">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-navy-800">${plan.price}</span>
                {plan.price > 0 && <span className="text-sm text-warm-500">/{plan.period}</span>}
                {plan.price === 0 && <span className="text-sm text-warm-500 ml-1">{plan.period}</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-warm-700">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => {
                  if (plan.price === 0) {
                    loginDemo();
                    router.push('/dashboard');
                  } else {
                    setCheckoutPlan(plan.id);
                    setCheckoutStage('form');
                  }
                }}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-[10px] text-warm-400 text-center mt-6">
          This is a demo pricing page. No real payments are processed.
        </p>
      </div>

      {/* Mock checkout */}
      <Modal open={!!checkoutPlan} onClose={() => setCheckoutPlan(null)} title="Checkout" maxWidth="max-w-sm">
        {checkoutStage === 'form' && (
          <div className="space-y-4">
            <div className="p-3 bg-warm-50 rounded-lg border border-border">
              <p className="text-sm font-medium text-navy-800">Professional Plan</p>
              <p className="text-lg font-bold text-navy-800">$12/month</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-navy-800 block mb-1">Card Number</label>
                <input placeholder="4242 4242 4242 4242" className="w-full px-3 py-2 text-sm border rounded-lg border-border bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-navy-800 block mb-1">Expiry</label>
                  <input placeholder="12/25" className="w-full px-3 py-2 text-sm border rounded-lg border-border bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-navy-800 block mb-1">CVC</label>
                  <input placeholder="123" className="w-full px-3 py-2 text-sm border rounded-lg border-border bg-white" />
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={handleCheckout}>
              Pay $12.00
            </Button>
            <p className="text-[10px] text-warm-400 text-center">
              Demo only. No real payment is processed.
            </p>
          </div>
        )}
        {checkoutStage === 'success' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-success" />
            </div>
            <p className="text-base font-semibold text-navy-800">Payment Successful</p>
            <p className="text-sm text-warm-500 mt-1">Your Pro plan is now active (demo)</p>
            <Button className="mt-4" onClick={() => { loginDemo(); router.push('/dashboard'); setCheckoutPlan(null); }}>
              Go to Dashboard
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
