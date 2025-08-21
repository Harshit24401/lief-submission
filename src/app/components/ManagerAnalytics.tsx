"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { gqlFetch } from "../../lib/graphqlfetch";
import { Row, Col, Card, Typography, Select, Spin, Empty, Badge, Tooltip } from "antd";
import * as d3 from "d3";
import React from "react";
const { Title, Text } = Typography;
const { Option } = Select;

export default function ManagerAnalytics() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await gqlFetch(`
          query {
            myShifts {
              id
              clockIn
              clockOut
              note
              worksite { id name }
              user { id email }
            }
          }
        `);
        setShifts(d.myShifts || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- massage data
  const data = useMemo(() => {
    return (shifts ?? []).map((s) => {
      const ciNum = Number(s.clockIn);
      const coNum = s.clockOut != null ? Number(s.clockOut) : null;

      const clockIn = isFinite(ciNum) ? new Date(ciNum) : null;
      const clockOut = coNum != null && isFinite(coNum) ? new Date(coNum) : null;

      const hours =
        clockIn && clockOut ? (coNum! - ciNum) / (1000 * 60 * 60) : 0;

      return {
        id: s.id,
        worksite: s.worksite?.name ?? "Unknown",
        worker: s.user?.email ?? "Unknown",
        clockIn,
        clockOut,
        hours,
      };
    });
  }, [shifts]);

  const filtered = selectedWorker
    ? data.filter((d) => d.worker === selectedWorker)
    : data;

  // --- KPIs
  const closed = filtered.filter((d) => d.clockIn && d.clockOut && d.hours > 0);
  const totalShifts = filtered.length;
  const totalHours = closed.reduce((sum, d) => sum + d.hours, 0);
  const avgHours = totalShifts ? totalHours / totalShifts : 0;

  const workers = Array.from(new Set(data.map((d) => d.worker)));

  // --- Additional Analytics
  const activeShifts = filtered.filter(d => d.clockIn && !d.clockOut).length;
  const completionRate = totalShifts > 0 ? ((totalShifts - activeShifts) / totalShifts * 100).toFixed(1) : 0;
  
  // Worker performance metrics
  const workerStats = useMemo(() => {
    const stats = new Map();
    workers.forEach(worker => {
      const workerShifts = data.filter(d => d.worker === worker);
      const completedShifts = workerShifts.filter(d => d.clockIn && d.clockOut && d.hours > 0);
      const totalWorkerHours = completedShifts.reduce((sum, d) => sum + d.hours, 0);
      
      stats.set(worker, {
        totalShifts: workerShifts.length,
        completedShifts: completedShifts.length,
        totalHours: totalWorkerHours,
        avgHours: completedShifts.length ? totalWorkerHours / completedShifts.length : 0,
        efficiency: workerShifts.length ? (completedShifts.length / workerShifts.length * 100) : 0
      });
    });
    return stats;
  }, [data, workers]);

  // Top performer
  const topPerformer = useMemo(() => {
    let top = { worker: '', hours: 0 };
    workerStats.forEach((stats, worker) => {
      if (stats.totalHours > top.hours) {
        top = { worker, hours: stats.totalHours };
      }
    });
    return top;
  }, [workerStats]);

  // Worksite distribution
  const worksiteStats = useMemo(() => {
    const stats = d3.rollup(
      filtered,
      v => ({
        totalShifts: v.length,
        totalHours: v.filter(d => d.hours > 0).reduce((sum, d) => sum + d.hours, 0),
        uniqueWorkers: new Set(v.map(d => d.worker)).size
      }),
      d => d.worksite
    );
    return Array.from(stats.entries()).sort((a, b) => b[1].totalHours - a[1].totalHours);
  }, [filtered]);

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

  if (data.length === 0) {
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
              No shift data available for team analytics
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
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          📊 Manager Analytics Dashboard
        </Title>
        <Text style={{ fontSize: '16px', color: '#666' }}>
          Monitor team performance and track workforce productivity
        </Text>
      </div>

      {/* Enhanced KPI Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <KPI 
          title="Total Shifts" 
          value={totalShifts} 
          icon="📋"
          color="#667eea"
          subtitle={`${activeShifts} active`}
        />
        <KPI 
          title="Total Hours" 
          value={totalHours.toFixed(1)} 
          icon="⏰"
          color="#4ecdc4"
          subtitle="logged by team"
        />
        <KPI 
          title="Avg Hours/Shift" 
          value={avgHours.toFixed(1)} 
          icon="📈"
          color="#ff6b6b"
          subtitle="per shift"
        />
        <KPI 
          title="Completion Rate" 
          value={`${completionRate}%`}
          icon="✅"
          color="#96ceb4"
          subtitle="shifts completed"
        />
      </Row>

      {/* Team Performance Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card className="performance-card">
            <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
              🏆 Top Performer
            </Title>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {topPerformer.worker || 'N/A'}
              </div>
              <Text style={{ color: '#666' }}>
                {topPerformer.hours.toFixed(1)} total hours logged
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="performance-card">
            <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
              👥 Team Overview
            </Title>
            <div style={{ padding: '10px 0' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                      {workers.length}
                    </div>
                    <Text style={{ color: '#666', fontSize: '12px' }}>Active Workers</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ecdc4' }}>
                      {worksiteStats.length}
                    </div>
                    <Text style={{ color: '#666', fontSize: '12px' }}>Worksites</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Worker Selector with Stats */}
      <Card style={{ marginBottom: '24px', background: 'white', borderRadius: '12px', border: 'none' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#2d3748' }}>Filter by Worker:</Text>
            </div>
            <Select
              placeholder="🔍 Select a worker to analyze"
              style={{ width: '100%' }}
              allowClear
              onChange={(v) => setSelectedWorker(v || null)}
              size="large"
            >
              {workers.map((w) => {
                const stats = workerStats.get(w);
                return (
                  <Option key={w} value={w}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{w}</span>
                      <Badge 
                        count={stats?.totalShifts || 0} 
                        style={{ backgroundColor: '#52c41a' }}
                      />
                    </div>
                  </Option>
                );
              })}
            </Select>
          </Col>
          {selectedWorker && (
            <Col xs={24} md={16}>
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, #e8f4fd 0%, #f0e6ff 100%)',
                borderRadius: '8px'
              }}>
                <Text strong style={{ color: '#2d3748', marginRight: '16px' }}>
                  {selectedWorker} Stats:
                </Text>
                {(() => {
                  const stats = workerStats.get(selectedWorker);
                  return (
                    <div style={{ marginTop: '8px' }}>
                      <Tooltip title="Total shifts assigned">
                        <Badge count={stats?.totalShifts || 0} style={{ marginRight: '12px' }} />
                        <Text style={{ color: '#666', marginRight: '16px' }}>Shifts</Text>
                      </Tooltip>
                      <Tooltip title="Average hours per shift">
                        <Text style={{ color: '#666', marginRight: '16px' }}>
                          Avg: {stats?.avgHours.toFixed(1)}h
                        </Text>
                      </Tooltip>
                      <Tooltip title="Completion efficiency">
                        <Text style={{ color: stats && stats.efficiency >= 80 ? '#52c41a' : '#ff4d4f' }}>
                          Efficiency: {stats?.efficiency.toFixed(1)}%
                        </Text>
                      </Tooltip>
                    </div>
                  );
                })()}
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Charts */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="chart-card" style={{ height: 450 }}>
            <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
              🏢 Shifts Distribution by Worksite
            </Title>
            <PieChart data={filtered} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" style={{ height: 450 }}>
            <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
              📈 Worker Performance Timeline
            </Title>
            <MultiLineChart data={filtered} />
          </Card>
        </Col>
      </Row>

      {/* Worksite Performance Table */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card className="chart-card">
            <Title level={4} style={{ marginBottom: '16px', color: '#2d3748' }}>
              🏭 Worksite Performance Summary
            </Title>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', minWidth: '600px' }}>
                <div style={{ fontWeight: 'bold', color: '#667eea', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                  Worksite
                </div>
                <div style={{ fontWeight: 'bold', color: '#667eea', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                  Total Shifts
                </div>
                <div style={{ fontWeight: 'bold', color: '#667eea', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                  Total Hours
                </div>
                <div style={{ fontWeight: 'bold', color: '#667eea', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                  Workers
                </div>
                {worksiteStats.map(([worksite, stats], index) => (
                  <React.Fragment key={worksite}>
                    <div style={{ 
                      padding: '12px', 
                      background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                      borderRadius: '8px',
                      fontWeight: 500
                    }}>
                      {worksite}
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <Badge count={stats.totalShifts} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: '#4ecdc4',
                      fontWeight: 'bold'
                    }}>
                      {stats.totalHours.toFixed(1)}h
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      👥 {stats.uniqueWorkers}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .performance-card {
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: none;
          background: white;
          height: 100%;
        }
        
        .performance-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.12);
        }
        
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
      `}</style>
    </div>
  );
}

function KPI({ title, value, icon, color, subtitle }: { title: string; value: any; icon?: string; color?: string; subtitle?: string }) {
  return (
    <Col xs={24} sm={12} lg={6}>
      <Card className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="kpi-icon" style={{ fontSize: '32px', marginBottom: '12px' }}>
          {icon || '📊'}
        </div>
        <Title level={2} style={{ margin: '8px 0 4px 0', color: color || '#667eea' }}>
          {value}
        </Title>
        <Text style={{ color: '#8892b0', fontSize: '14px', fontWeight: 500 }}>
          {title}
        </Text>
        {subtitle && (
          <div style={{ marginTop: '4px' }}>
            <Text style={{ color: '#a0aec0', fontSize: '12px' }}>
              {subtitle}
            </Text>
          </div>
        )}
        <div 
          className="kpi-border" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color || '#667eea'}, ${color ? color + '80' : '#764ba2'})`
          }}
        />
        <style jsx>{`
          .kpi-card {
            text-align: center;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: none;
            background: white;
            padding: 24px 16px;
          }
          
          .kpi-card:hover { 
            transform: translateY(-8px) scale(1.02); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          }
          
          .kpi-icon {
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
          }
        `}</style>
      </Card>
    </Col>
  );
}

/* --- Enhanced Pie Chart --- */
function PieChart({ data }: { data: any[] }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const containerWidth = ref.current.parentElement?.clientWidth || 300;
    const width = Math.min(containerWidth - 40, 350);
    const height = 350;
    const radius = Math.min(width, height) / 2 - 20;

    const grouped = d3.rollup(
      data,
      (v) => v.length,
      (d) => d.worksite
    );

    if (grouped.size === 0) return;

    const pie = d3.pie<any>().value(([, v]) => v).sort(null);
    const arc = d3.arc<any>().innerRadius(radius * 0.4).outerRadius(radius);
    const labelArc = d3.arc<any>().innerRadius(radius * 0.7).outerRadius(radius * 0.7);

    // Modern color palette
    const colors = ['#667eea', '#4ecdc4', '#ff6b6b', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#ffb8b8'];
    const color = d3.scaleOrdinal(colors);

    svg
      .attr("width", width)
      .attr("height", height)
      .style("background", "radial-gradient(circle, #ffecd2 0%, #fcb69f 100%)")
      .style("border-radius", "12px");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const arcs = g.selectAll(".arc")
      .data(pie(Array.from(grouped.entries())))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(String(i)))
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
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)")
      .text((d) => d.data[1] > 0 ? d.data[0] : "");

    // Add center label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#666")
      .text("Worksites");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("fill", "#667eea")
      .text(grouped.size);

  }, [data]);

  return <svg ref={ref} style={{ width: '100%', height: '350px' }} />;
}

/* --- Enhanced Multi-line Chart --- */
function MultiLineChart({ data }: { data: any[] }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const containerWidth = ref.current.parentElement?.clientWidth || 400;
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const width = Math.min(containerWidth - 40, 500) - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
      .style("border-radius", "12px");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter out invalid dates and group data by worker
    const validData = data.filter(d => d.clockIn && d.hours > 0);
    const grouped = d3.group(validData, (d) => d.worker);

    if (validData.length === 0) return;

    const x = d3
      .scaleTime()
      .domain(d3.extent(validData, (d) => d.clockIn) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(validData, (d) => d.hours) || 1])
      .nice()
      .range([height, 0]);

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    const color = d3.scaleOrdinal(colors);

    // Add gradient for axes
    const axisGradient = svg.append("defs").append("linearGradient")
      .attr("id", "axis-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", height);

    axisGradient.append("stop").attr("offset", "0%").attr("stop-color", "#fff");
    axisGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f0f0f0");

    // Styled axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%m/%d") as any))
      .style("color", "#fff")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .style("color", "#fff")
      .style("font-size", "12px");

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", "12px")
      .text("Hours Worked");

    let workerIndex = 0;
    for (const [worker, values] of grouped) {
      if (values.length === 0) continue;
      
      const sortedValues = values.sort((a, b) => a.clockIn.getTime() - b.clockIn.getTime());
      const workerColor = color(String(workerIndex));
      
      const line = d3
        .line<any>()
        .x((d) => x(d.clockIn))
        .y((d) => y(d.hours))
        .curve(d3.curveCardinal);

      // Add glow effect
      g.append("path")
        .datum(sortedValues)
        .attr("fill", "none")
        .attr("stroke", workerColor as string)
        .attr("stroke-width", 6)
        .attr("stroke-opacity", 0.3)
        .attr("d", line);

      g.append("path")
        .datum(sortedValues)
        .attr("fill", "none")
        .attr("stroke", workerColor as string)
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("d", line);

      // Add dots for data points
      g.selectAll(`.dot-${workerIndex}`)
        .data(sortedValues)
        .enter().append("circle")
        .attr("class", `dot-${workerIndex}`)
        .attr("cx", (d) => x(d.clockIn))
        .attr("cy", (d) => y(d.hours))
        .attr("r", 4)
        .attr("fill", "#fff")
        .attr("stroke", workerColor as string)
        .attr("stroke-width", 2)
        .style("cursor", "pointer");

      // Worker label
      const lastPoint = sortedValues[sortedValues.length - 1];
      g.append("text")
        .attr("x", x(lastPoint.clockIn) + 5)
        .attr("y", y(lastPoint.hours))
        .text(worker.split('@')[0]) // Show only username part of email
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.5)");

      workerIndex++;
    }
  }, [data]);

  return <svg ref={ref} style={{ width: '100%', height: '350px' }} />;
}
