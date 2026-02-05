import { motion } from 'framer-motion';
import { useMoney } from '@/context/MoneyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingDown, IndianRupee } from 'lucide-react';

export default function SummaryPage() {
  const { getCategoryData, getExpenseTotal, transactions } = useMoney();

  const categoryData = getCategoryData('expense');
  const totalExpense = getExpenseTotal();

  // Transform data and add percentage
  const categorySummary = categoryData.map(item => ({
    category: item.name,
    amount: item.value,
    percentage: totalExpense > 0 ? (item.value / totalExpense) * 100 : 0
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const COLORS = [
    'hsl(160, 84%, 25%)',
    'hsl(15, 85%, 60%)',
    'hsl(200, 75%, 50%)',
    'hsl(280, 65%, 55%)',
    'hsl(45, 90%, 50%)',
    'hsl(340, 80%, 60%)',
    'hsl(220, 70%, 50%)',
    'hsl(100, 60%, 45%)',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold">Expense Summary</h1>
        <p className="text-muted-foreground">Category-wise breakdown of your expenses</p>
      </motion.div>

      {/* Total Expense Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-[#156F99] to-[#0E4F6D] text-white overflow-hidden relative">

          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-expense-foreground/80 text-sm font-medium mb-1">
                  Total Expenses
                </p>
                <p className="text-4xl md:text-5xl font-display font-bold">
                  {formatCurrency(totalExpense)}
                </p>
                <p className="text-expense-foreground/70 text-sm mt-2">
                  Across {categorySummary.length} categories
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-card h-full">
            <CardHeader>
              <CardTitle className="font-display">Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySummary}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      dataKey="amount"
                      nameKey="category"
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-card h-full">
            <CardHeader>
              <CardTitle className="font-display">Category Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categorySummary}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={100}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Category Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySummary.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}
                      >
                        <IndianRupee
                          className="w-5 h-5"
                          style={{ color: COLORS[index % COLORS.length] }}
                        />
                      </div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-display font-bold">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
