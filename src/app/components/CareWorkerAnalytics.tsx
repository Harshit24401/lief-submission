"use client";
import { useEffect, useState, useRef } from "react";
import { gqlFetch } from "../../lib/graphqlfetch";
import { Row, Col, Card, Typography, Space, Spin, Empty } from "antd";
import * as d3 from "d3";
import gsap from "gsap";

const { Title, Text } = Typography;

export default function CareWorkerAnalytics() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRefs = {
    pie: useRef(null),
    bar: useRef(null),
    line: useRef(null),
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const d = await gqlFetch(`
          query {
            myShifts {
              id
              clockIn
              clockOut
              worksite { id name }
            }
          }
        `);
        setShifts(d.myShifts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // --- KPIs ---
  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((sum, s) => {
    if (!s.clockIn || !s.clockOut) return sum;
    return sum + (Number(s.clockOut) - Number(s.clockIn)) / (1000 * 60 * 60);
  }, 0);
  const avgHours = totalShifts ? (totalHours / totalShifts).toFixed(1) : 0;

  // Calculate additional metrics
  const thisWeekHours = shifts
    .filter(s => {
      if (!s.clockIn) return false;
      const shiftDate = new Date(Number(s.clockIn));
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return shiftDate >= weekAgo;
    })
    .reduce((sum, s) => {
      if (!s.clockOut) return sum;
      return sum + (Number(s.clockOut) - Number(s.clockIn)) / (1000 * 60 * 60);
    }, 0);

  // --- Render Charts ---
  useEffect(() => {
    if (shifts.length === 0) return;

    // Enhanced responsive chart rendering
    const renderChart = (selector: string, draw: (w: number, h: number) => void) => {
      const el = document.getElementById(selector);
      if (!el) return;
      
      // Add loading state
      d3.select(`#${selector}`).html('<div class="chart-loading">Loading...</div>');
      
      setTimeout(() => {
        const w = el.clientWidth - 40; // Account for padding
        const h = el.clientHeight - 80; // Account for title and padding
        d3.select(`#${selector}`).html(""); // clear old
        draw(w, h);
        
        // Enhanced entrance animation
        gsap.fromTo(`#${selector} svg`, 
          { opacity: 0, scale: 0.8, y: 30 }, 
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
        );
      }, 100);
    };

    // Enhanced Line chart (hours over time)
    renderChart("lineChart", (width, height) => {
      const svg = d3.select("#lineChart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
        .style("border-radius", "12px");
        
      const data = shifts.filter(s => s.clockOut).map(s => ({
        date: new Date(Number(s.clockIn)),
        hours: (Number(s.clockOut) - Number(s.clockIn)) / 3600000,
      })).sort((a, b) => a.date.getTime() - b.date.getTime());

      if (data.length === 0) return;

      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date) as [Date, Date])
        .range([0, innerWidth]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.hours) || 1])
        .range([innerHeight, 0]);

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      // Add gradient for line
      const gradient = svg.append("defs").append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(0))
        .attr("x2", 0).attr("y2", y(d3.max(data, d => d.hours) || 1));

      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#ff6b6b");
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#4ecdc4");

      const line = d3.line<any>()
        .x(d => x(d.date))
        .y(d => y(d.hours))
        .curve(d3.curveCardinal);

      // Add area under curve
      const area = d3.area<any>()
        .x(d => x(d.date))
        .y0(innerHeight)
        .y1(d => y(d.hours))
        .curve(d3.curveCardinal);

      g.append("path")
        .datum(data)
        .attr("fill", "url(#line-gradient)")
        .attr("fill-opacity", 0.3)
        .attr("d", area);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // Add dots
      g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.hours))
        .attr("r", 4)
        .attr("fill", "#fff")
        .attr("stroke", "#4ecdc4")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).attr("r", 6);
        })
        .on("mouseout", function(event, d) {
          d3.select(this).attr("r", 4);
        });

      // Styled axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat("%m/%d") as any))
        .style("color", "#fff")
        .style("font-size", "12px");

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .style("color", "#fff")
        .style("font-size", "12px");
    });

    // Enhanced Pie chart (shifts by worksite)
    renderChart("pieChart", (w, h) => {
      const radius = Math.min(w, h) / 2 - 20;
      const svg = d3.select("#pieChart").append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background", "radial-gradient(circle, #ffecd2 0%, #fcb69f 100%)")
        .style("border-radius", "12px");
        
      const g = svg.append("g").attr("transform", `translate(${w/2},${h/2})`);

      const counts = d3.rollup(shifts, v => v.length, s => s.worksite?.name || "Unknown");
      const pie = d3.pie<any>().value(d => d[1]).sort(null);
      const arc = d3.arc<any>().innerRadius(radius * 0.4).outerRadius(radius);
      const labelArc = d3.arc<any>().innerRadius(radius * 0.7).outerRadius(radius * 0.7);

      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
      const color = d3.scaleOrdinal(colors);

      const arcs = g.selectAll(".arc")
        .data(pie(Array.from(counts.entries())))
        .enter().append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i.toString()))
        .style("opacity", 0.9)
        .style("stroke", "#fff")
        .style("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 1).style("transform", "scale(1.05)");
        })
        .on("mouseout", function(event, d) {
          d3.select(this).style("opacity", 0.9).style("transform", "scale(1)");
        });

      arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
        .text(d => d.data[1] > 0 ? d.data[0] : "");
    });

    // Enhanced Bar chart (hours per day)
    renderChart("barChart", (w, h) => {
      const data = d3.rollups(
        shifts,
        v => d3.sum(v, s => s.clockOut ? (Number(s.clockOut)-Number(s.clockIn))/3600000 : 0),
        s => new Date(Number(s.clockIn)).toDateString()
      ).slice(-10); // Show last 10 days

      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
      const innerWidth = w - margin.left - margin.right;
      const innerHeight = h - margin.top - margin.bottom;

      const svg = d3.select("#barChart").append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background", "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)")
        .style("border-radius", "12px");

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .domain(data.map(d => d[0]))
        .range([0, innerWidth])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1]) || 1])
        .range([innerHeight, 0]);

      // Add gradient for bars
      const barGradient = svg.append("defs").append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(0))
        .attr("x2", 0).attr("y2", y(d3.max(data, d => d[1]) || 1));

      barGradient.append("stop").attr("offset", "0%").attr("stop-color", "#667eea");
      barGradient.append("stop").attr("offset", "100%").attr("stop-color", "#764ba2");

      g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0])!)
        .attr("y", innerHeight)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "url(#bar-gradient)")
        .style("border-radius", "4px 4px 0 0")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this).style("opacity", 0.8);
        })
        .on("mouseout", function(event, d) {
          d3.select(this).style("opacity", 1);
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d[1]))
        .attr("height", d => innerHeight - y(d[1]));

      // Styled axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d => new Date(d as string).toLocaleDateString('en', {month: 'short', day: 'numeric'})))
        .style("color", "#666")
        .style("font-size", "11px")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .style("color", "#666")
        .style("font-size", "12px");
    });
  }, [shifts]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px'
      }}>
        <Spin size="large" style={{ color: '#fff' }} />
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <Card style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        borderRadius: '16px',
        border: 'none'
      }}>
        <Empty 
          description={
            <Text style={{ fontSize: '16px', color: '#666' }}>
              No shift data available yet. Start tracking your shifts to see analytics!
            </Text>
          }
        />
      </Card>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Care Worker Analytics
          </Title>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Track your performance and work patterns
          </Text>
        </div>

        {/* Enhanced KPI Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card kpi-shifts">
              <div className="kpi-icon">📊</div>
              <Title level={2} style={{ margin: '8px 0 4px 0', color: '#667eea' }}>
                {totalShifts}
              </Title>
              <Text style={{ color: '#8892b0', fontSize: '14px', fontWeight: 500 }}>
                Total Shifts
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card kpi-hours">
              <div className="kpi-icon">⏰</div>
              <Title level={2} style={{ margin: '8px 0 4px 0', color: '#4ecdc4' }}>
                {totalHours.toFixed(1)}
              </Title>
              <Text style={{ color: '#8892b0', fontSize: '14px', fontWeight: 500 }}>
                Total Hours
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card kpi-avg">
              <div className="kpi-icon">📈</div>
              <Title level={2} style={{ margin: '8px 0 4px 0', color: '#ff6b6b' }}>
                {avgHours}
              </Title>
              <Text style={{ color: '#8892b0', fontSize: '14px', fontWeight: 500 }}>
                Avg Hours/Shift
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card kpi-week">
              <div className="kpi-icon">📅</div>
              <Title level={2} style={{ margin: '8px 0 4px 0', color: '#96ceb4' }}>
                {thisWeekHours.toFixed(1)}
              </Title>
              <Text style={{ color: '#8892b0', fontSize: '14px', fontWeight: 500 }}>
                This Week
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Charts Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="chart-card" style={{ height: 400 }}>
              <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                🏢 Shifts by Worksite
              </Title>
              <div id="pieChart" style={{ width:"100%", height:"300px" }}/>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="chart-card" style={{ height: 400 }}>
              <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                📊 Daily Hours (Last 10 Days)
              </Title>
              <div id="barChart" style={{ width:"100%", height:"300px" }}/>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="chart-card" style={{ height: 400 }}>
              <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
                📈 Hours Trend
              </Title>
              <div id="lineChart" style={{ width:"100%", height:"300px" }}/>
            </Card>
          </Col>
        </Row>

        <style jsx>{`
          .kpi-card {
            text-align: center;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: none;
            background: white;
            padding: 24px 16px;
            position: relative;
            overflow: hidden;
          }
          
          .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }
          
          .kpi-card:hover { 
            transform: translateY(-8px) scale(1.02); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          }
          
          .kpi-icon {
            font-size: 32px;
            margin-bottom: 12px;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
          }
          
          .kpi-shifts::before { background: linear-gradient(90deg, #667eea, #764ba2); }
          .kpi-hours::before { background: linear-gradient(90deg, #4ecdc4, #44a08d); }
          .kpi-avg::before { background: linear-gradient(90deg, #ff6b6b, #ee5a52); }
          .kpi-week::before { background: linear-gradient(90deg, #96ceb4, #4abdcc); }
          
          .chart-card {
            border-radius: 16px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border: none;
            background: white;
          }
          
          .chart-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.12);
          }
          
          .chart-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
            font-size: 14px;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .ant-card-body {
            padding: 24px;
          }
          
          @media (max-width: 768px) {
            .kpi-card {
              margin-bottom: 16px;
            }
            
            .chart-card {
              margin-bottom: 16px;
            }
          }
        `}</style>
      </Space>
    </div>
  );
}
