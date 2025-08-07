import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = {
  primary: "#1976D2",
  secondary: "#388E3C", 
  accent: "#FF5722",
  chart3: "#FFC107",
  chart4: "#9C27B0",
};

interface CategoryChartProps {
  data: { category: string; total: number; count: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: Object.values(COLORS)[index % Object.values(COLORS).length],
  }));

  return (
    <div className="chart-container h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis hide />
          <Bar dataKey="total" radius={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MonthlyChartProps {
  data: { month: string; total: number; count: number }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.slice(-6); // Show last 6 months

  return (
    <div className="chart-container h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis hide />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartProps {
  data: { name: string; value: number }[];
}

export function SimplePieChart({ data }: PieChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: Object.values(COLORS)[index % Object.values(COLORS).length],
  }));

  return (
    <div className="chart-container h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={60}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
