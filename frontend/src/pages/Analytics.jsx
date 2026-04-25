import { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { Leaf } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/analytics?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to fetch analytics data:", err));
  }, []);

  if (!data) return <div className="page-title">Loading Analytics...</div>;

  return (
    <div className="standard-page">
      <h1 className="page-title">Performance Analytics</h1>
      
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>System Efficiency Gain (%) over 5 Months</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.efficiencyGainOverMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[50, 100]} />
                <LineTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                <Line type="monotone" dataKey="gain" stroke="var(--success)" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Transport Cost Reduction (₹) over 5 Months</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.transportCostOverMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[30000, 60000]} />
                <LineTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                <Area type="monotone" dataKey="cost" stroke="var(--primary)" fill="rgba(59,130,246,0.3)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid-2">
         {/* ESG Chart */}
         <div className="card" style={{ border: '1px solid var(--success)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Leaf size={20} /> Corporate Sustainability (ESG): CO2 Emmisions Avoided
            </h2>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.carbonOffsetOverMonths}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <LineTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--success)' }} />
                  <Bar dataKey="co2SavedKg" fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Summary text */}
         <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Impact Analysis Summary</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              The implementation of Dijkstra's Algorithm for routing vehicles has resulted in a steady increase in logistics efficiency. Early data implies an expected <strong>25% reduction</strong> in transport spending year-over-year.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Furthermore, the optimized graph paths drastically shorten idle drive durations, resulting in a phenomenal <strong style={{ color: 'var(--success)' }}>ESG contribution</strong>. We are actively offsetting hundreds of kilograms of diesel CO2 emissions natively through mathematics, cementing the plant's reputation as a fully green energy facility.
            </p>
         </div>
      </div>
    </div>
  );
}
