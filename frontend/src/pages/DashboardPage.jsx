import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoney } from '@/context/MoneyContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [period, setPeriod] = useState('month');
  const { getIncomeTotal, getExpenseTotal, getChartData, transactions, getCategoryData } = useMoney();

  const income = getIncomeTotal(period);
  const expense = getExpenseTotal(period);
  const balance = income - expense;
  const chartData = getChartData(period);
  const categorySummary = getCategoryData('expense', period).slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const periodLabels = {
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  };

  const COLORS = ['hsl(160, 84%, 25%)', 'hsl(15, 85%, 60%)', 'hsl(200, 75%, 50%)', 'hsl(280, 65%, 55%)', 'hsl(45, 90%, 50%)'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your financial overview</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="week" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Month
            </TabsTrigger>
            <TabsTrigger value="year" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Year
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{periodLabels[period]} Income</p>
                <p className="text-3xl font-display font-bold text-income mt-1">
                  {formatCurrency(income)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl income-gradient flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-income-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{periodLabels[period]} Expenses</p>
                <p className="text-3xl font-display font-bold text-expense mt-1">
                  {formatCurrency(expense)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl expense-gradient flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-expense-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Net Balance</p>
                <p className={`text-3xl font-display font-bold mt-1 ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl primary-gradient flex items-center justify-center">
                <IndianRupee className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Income vs Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="income" fill="hsl(var(--income))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="hsl(var(--expense))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Expense by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {categorySummary.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySummary}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                      >
                        {categorySummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No expense data for this period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--income))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--income))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="hsl(var(--expense))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--expense))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-income" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-expense" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description || tx.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.category} • {format(tx.dateTime, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.type === 'income' ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
