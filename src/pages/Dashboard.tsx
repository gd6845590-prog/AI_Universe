import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, BarChart3, Cpu, Zap, Settings, Home, LogOut, ChevronRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "t2.micro", AWS: 8.5, Azure: 9.2, GCP: 7.8, Oracle: 6.5 },
  { name: "t2.small", AWS: 16.8, Azure: 18.1, GCP: 15.2, Oracle: 12.9 },
  { name: "t2.medium", AWS: 33.4, Azure: 35.6, GCP: 30.1, Oracle: 25.8 },
  { name: "t2.large", AWS: 66.9, Azure: 71.2, GCP: 60.3, Oracle: 51.6 },
  { name: "t2.xlarge", AWS: 133.7, Azure: 142.5, GCP: 120.5, Oracle: 103.2 },
];

const cloudProviders = [
  { name: "AWS", price: "$66.90", score: 82, color: "hsl(217, 91%, 60%)" },
  { name: "Azure", price: "$71.20", score: 76, color: "hsl(270, 60%, 55%)" },
  { name: "Google Cloud", price: "$60.30", score: 88, color: "hsl(142, 71%, 45%)" },
  { name: "Oracle Cloud", price: "$51.60", score: 91, color: "hsl(35, 92%, 50%)" },
];

const navItems = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Comparisons", icon: BarChart3 },
  { label: "Instances", icon: Cpu },
  { label: "AI Insights", icon: Zap },
  { label: "Settings", icon: Settings },
];

const Dashboard = () => {
  const [region, setRegion] = useState("us-east-1");
  const [instanceType, setInstanceType] = useState("t2.large");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 md:w-16"
        } border-r border-border bg-card/50 backdrop-blur-xl flex-shrink-0 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 border-b border-border flex items-center gap-2 min-w-[240px]">
          <Cloud className="h-5 w-5 text-primary flex-shrink-0" strokeWidth={1.5} />
          {sidebarOpen && <span className="text-sm font-bold text-foreground">CloudCompare AI</span>}
        </div>
        <nav className="p-3 space-y-1 min-w-[240px]">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                item.active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-3 min-w-[240px]">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
            {sidebarOpen && <span>Back to Home</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
              {sidebarOpen ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Menu className="h-4 w-4" strokeWidth={1.5} />}
            </button>
            <span className="text-sm text-muted-foreground">Dashboard</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-foreground">Cloud Comparison</span>
          </div>
          <Link
            to="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </Link>
        </header>

        <div className="p-6 space-y-6">
          {/* Top row: Config + AI Rec */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Config */}
            <motion.div
              className="surface-card p-6 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Instance Type</label>
                  <select
                    value={instanceType}
                    onChange={(e) => setInstanceType(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="t2.micro">t2.micro (1 vCPU, 1 GB)</option>
                    <option value="t2.small">t2.small (1 vCPU, 2 GB)</option>
                    <option value="t2.medium">t2.medium (2 vCPU, 4 GB)</option>
                    <option value="t2.large">t2.large (2 vCPU, 8 GB)</option>
                    <option value="t2.xlarge">t2.xlarge (4 vCPU, 16 GB)</option>
                  </select>
                </div>
                <button className="w-full bg-foreground text-background py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                  Compare Now
                </button>
              </div>
            </motion.div>

            {/* AI Recommendation */}
            <motion.div
              className="surface-card p-6 lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold text-foreground">AI Recommendation</h3>
              </div>
              <div className="bg-secondary/50 rounded-xl p-5 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_hsl(217,91%,60%)]" />
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">
                      Oracle Cloud is recommended for this configuration
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Based on your selection of <span className="font-mono-tabular text-foreground">{instanceType}</span> in{" "}
                      <span className="font-mono-tabular text-foreground">{region}</span>, Oracle Cloud offers the best
                      price-to-performance ratio at <span className="font-mono-tabular text-foreground">$51.60/mo</span>, saving you
                      up to 27% compared to Azure. Performance benchmarks show comparable compute throughput with 15% better I/O latency.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cloud Provider Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cloudProviders.map((provider, i) => (
              <motion.div
                key={provider.name}
                className="surface-card card-glow p-6 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">
                    {provider.name}
                  </span>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: provider.color, boxShadow: `0 0 8px ${provider.color}` }}
                  />
                </div>
                <div className="text-3xl font-bold font-mono-tabular text-foreground">
                  {provider.price}
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${provider.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: provider.color }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Score: {provider.score}/100</span>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            className="surface-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-6">Monthly Cost Comparison (USD)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 4%, 16%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(240, 5%, 52%)", fontSize: 12 }} stroke="hsl(240, 4%, 16%)" />
                  <YAxis tick={{ fill: "hsl(240, 5%, 52%)", fontSize: 12 }} stroke="hsl(240, 4%, 16%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(240, 4%, 7%)",
                      border: "1px solid hsl(0, 0%, 100%, 0.08)",
                      borderRadius: "8px",
                      color: "hsl(0, 0%, 98%)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="AWS" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Azure" fill="hsl(270, 60%, 55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="GCP" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Oracle" fill="hsl(35, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
