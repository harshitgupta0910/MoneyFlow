import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const featureCards = [
  {
    icon: TrendingUp,
    title: 'Track Everything',
    description: 'Monitor income, expenses, and transfers with category-level clarity.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Accounts',
    description: 'Keep your data private with authenticated access and protected routes.',
  },
  {
    icon: Zap,
    title: 'Fast Insights',
    description: 'See quick summaries for dashboard, accounts, and monthly performance.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbfd] via-background to-[#eaf5fb]">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Money Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link to={isAuthenticated ? '/app' : '/signup'}>
              <Button className="primary-gradient text-primary-foreground">
                {isAuthenticated ? 'Go to App' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-5">
              Personal Finance, Simplified
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight tracking-tight">
              Stay in control of every rupee, every day.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
              Money Manager helps you record transactions, organize accounts, and understand your spending trends with clean dashboards and practical summaries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={isAuthenticated ? '/app' : '/signup'}>
                <Button size="lg" className="primary-gradient text-primary-foreground">
                  {isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">I already have an account</Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#156F99] to-[#1d8ec5] opacity-20 blur-xl" />
            <Card className="relative rounded-2xl shadow-card">
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <span className="text-xs rounded-full bg-income/10 text-income px-2 py-1">+ Healthy</span>
                </div>
                <p className="text-3xl font-display font-bold">INR 1,24,860.00</p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-income/10 p-3">
                    <p className="text-xs text-muted-foreground">This Month Income</p>
                    <p className="font-semibold text-income">INR 56,400</p>
                  </div>
                  <div className="rounded-xl bg-expense/10 p-3">
                    <p className="text-xs text-muted-foreground">This Month Expense</p>
                    <p className="font-semibold text-expense">INR 22,950</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((item) => (
            <Card key={item.title} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-5">
                <item.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
