
import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ReportChartProps {
  type: 'income-expense' | 'categories' | 'net-worth' | 'budget-performance' | 'savings-rate';
  dateRange: { from: Date; to: Date };
}

const ReportChart: React.FC<ReportChartProps> = ({ type, dateRange }) => {
  // These would come from API in a real app
  const incomeExpenseData = [
    { month: 'Jan', income: 4000, expenses: 2400 },
    { month: 'Feb', income: 3000, expenses: 1398 },
    { month: 'Mar', income: 2000, expenses: 9800 },
    { month: 'Apr', income: 2780, expenses: 3908 },
    { month: 'May', income: 1890, expenses: 4800 },
    { month: 'Jun', income: 2390, expenses: 3800 },
  ];

  const categoryData = [
    { name: 'Housing', value: 1200, color: '#0088FE' },
    { name: 'Food', value: 700, color: '#00C49F' },
    { name: 'Transport', value: 500, color: '#FFBB28' },
    { name: 'Entertainment', value: 300, color: '#FF8042' },
    { name: 'Utilities', value: 200, color: '#8884d8' },
  ];

  const netWorthData = [
    { month: 'Jan', value: 10000 },
    { month: 'Feb', value: 12000 },
    { month: 'Mar', value: 11800 },
    { month: 'Apr', value: 13500 },
    { month: 'May', value: 14500 },
    { month: 'Jun', value: 15200 },
  ];

  const budgetData = [
    { category: 'Housing', budget: 1200, actual: 1150 },
    { category: 'Food', budget: 800, actual: 750 },
    { category: 'Transport', budget: 400, actual: 450 },
    { category: 'Entertainment', budget: 300, actual: 350 },
    { category: 'Utilities', budget: 250, actual: 230 },
  ];

  const savingsRateData = [
    { month: 'Jan', rate: 15 },
    { month: 'Feb', rate: 18 },
    { month: 'Mar', rate: 12 },
    { month: 'Apr', rate: 20 },
    { month: 'May', rate: 22 },
    { month: 'Jun', rate: 25 },
  ];

  const renderChart = () => {
    switch (type) {
      case 'income-expense':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={incomeExpenseData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#14b8a6" />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'categories':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'net-worth':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={netWorthData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="Net Worth"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'budget-performance':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={budgetData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#a3a3a3" />
              <Bar dataKey="actual" name="Actual" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'savings-rate':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={savingsRateData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis unit="%" />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                name="Savings Rate"
                stroke="#22c55e"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return <div className="w-full h-full">{renderChart()}</div>;
};

export default ReportChart;
