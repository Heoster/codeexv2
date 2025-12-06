'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { sendContactFormEmail } from '@/lib/contact-email';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'support',
    message: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await sendContactFormEmail({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      category: formData.category as
        | 'support'
        | 'feedback'
        | 'bug'
        | 'partnership'
        | 'other',
      message: formData.message,
    });

    if (result.success) {
      setSubmitted(true);
      toast({
        title: 'Message Sent! ✅',
        description: result.message,
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'support',
        message: '',
      });
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold">Thank you for reaching out!</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              We&apos;ve received your message and our team will get back to you as soon as possible.
              You should receive a confirmation email at the address you provided.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-border p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <Mail className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <a
                    href="mailto:codeex@email.com"
                    className="text-primary hover:underline"
                  >
                    codeex@email.com
                  </a>
                </p>
              </div>

              <div className="rounded-lg border border-border p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <Phone className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold">Response Time</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We typically respond within 24 hours
                </p>
              </div>

              <div className="rounded-lg border border-border p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <MapPin className="text-primary" size={28} />
                </div>
                <h3 className="font-semibold">Follow Up</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check your email for further updates
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row justify-center">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  Back to Home
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false);
                }}
                className="btn-gradient gap-2"
              >
                Send Another Message <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Get in Touch</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Have questions or feedback? We&apos;d love to hear from you. Fill out the form below
            and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
          {/* Contact Info - Reorder on mobile */}
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:codeex@email.com"
                      className="text-muted-foreground hover:text-primary"
                    >
                      codeex@email.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-muted-foreground">Typically within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Follow Us</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <a
                        href="https://github.com/Heoster"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-muted-foreground hover:text-primary"
                      >
                        GitHub
                      </a>
                      <a
                        href="https://www.instagram.com/codeex._.heoster/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-muted-foreground hover:text-primary"
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/documentation"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Documentation
                </Link>
                <Link
                  href="/pricing"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Pricing
                </Link>
                <Link
                  href="/privacy"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/support"
                  className="block text-muted-foreground hover:text-primary"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger id="category" disabled={isLoading}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Message */}
                <div className="grid gap-2">
                  <Label htmlFor="message">
                    Message * (Max 5000 characters)
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    rows={6}
                    maxLength={5000}
                  />
                  <div className="text-xs text-muted-foreground">
                    {formData.message.length} / 5000 characters
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="btn-gradient w-full py-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Button>

                <p className="text-xs text-muted-foreground">
                  We respect your privacy. Your contact information will only be used to
                  respond to your inquiry.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
