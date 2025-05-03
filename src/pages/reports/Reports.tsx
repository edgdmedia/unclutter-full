
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowUpDown, 
  DollarSign,
  Calendar,
  Download
} from 'lucide-react';
import ReportChart from '@/components/reports/ReportChart';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { useToast } from '@/hooks/use-toast';

type ReportType = 'income-expense' | 'categories' | 'net-worth' | 'budget-performance' | 'savings-rate';

interface ReportOption {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date()
  });
  const { toast } = useToast();

  const reportOptions: ReportOption[] = [
    {
      id: 'income-expense',
      title: 'Income vs. Expenses',
      description: 'Compare your income and expenses over time',
      icon: <BarChart3 className="h-10 w-10 text-finance-blue" />
    },
    {
      id: 'categories',
      title: 'Category Breakdown',
      description: 'See where your money is going by category',
      icon: <PieChart className="h-10 w-10 text-finance-green" />
    },
    {
      id: 'net-worth',
      title: 'Net Worth',
      description: 'Track your overall financial position over time',
      icon: <LineChart className="h-10 w-10 text-finance-blue" />
    },
    {
      id: 'budget-performance',
      title: 'Budget Performance',
      description: 'Compare your actual spending against your budgets',
      icon: <ArrowUpDown className="h-10 w-10 text-amber-500" />
    },
    {
      id: 'savings-rate',
      title: 'Savings Rate',
      description: 'Track how much of your income you\'re saving',
      icon: <DollarSign className="h-10 w-10 text-finance-green" />
    }
  ];

  const generateReport = () => {
    if (!selectedReport) return;
    // In a real app, this would fetch data from the API
    toast({
      title: "Report Generated",
      description: `${getReportTitle(selectedReport)} report generated successfully.`,
    });
  };

  const exportReport = () => {
    toast({
      title: "Report Exported",
      description: "Your report has been exported to CSV.",
    });
    // In a real app, this would trigger a download
  };

  const getReportTitle = (type: ReportType) => {
    const report = reportOptions.find(r => r.id === type);
    return report ? report.title : '';
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold">Reports</h1>
      
      {!selectedReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportOptions.map((option) => (
            <Card 
              key={option.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(option.id)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="mb-4">{option.icon}</div>
                <h2 className="text-lg font-medium mb-1">{option.title}</h2>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Back to Reports
            </Button>
            <h2 className="text-xl font-medium">{getReportTitle(selectedReport)}</h2>
            <div className="invisible">Placeholder</div> {/* For centering the title */}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configure Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1 flex-1">
                  <label className="text-sm font-medium">Date Range</label>
                  <DateRangePicker 
                    dateRange={dateRange} 
                    onDateRangeChange={setDateRange} 
                  />
                </div>
                <div>
                  <Button onClick={generateReport}>
                    <FileText className="mr-2 h-4 w-4" /> Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Report Results</CardTitle>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ReportChart type={selectedReport} dateRange={dateRange} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
