"use client";
import { useEffect, useState } from "react";
import { gqlFetch } from "../../lib/graphqlfetch";
import { Modal, Input, List, Card, Button, Space, Typography, Tag, App, Statistic, Row, Col, Divider, Tooltip, Badge } from "antd";
import { FieldTimeOutlined, ClockCircleOutlined, EnvironmentOutlined, CalendarOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import CareWorkerAnalytics from "../components/CareWorkerAnalytics"

export default function CareWorkerDashboard() {
  const { message } = App.useApp();   // ✅ grab message API from context
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [worksiteId, setWorksiteId] = useState<number | null>(null);
  const [clockingIn, setClockingIn] = useState(false); // ✅ prevent multiple clicks
  const [modal, contextHolder] = Modal.useModal();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const d = await gqlFetch(`
        query {
          myShifts {
            id
            clockIn
            clockOut
            location
            note
            worksite { id name }
          }
        }
      `);
      setShifts(d.myShifts);

      // ✅ derive latest worksite from shifts
      const latest = [...(d.myShifts ?? [])]
        .filter((s: any) => s?.worksite?.id)
        .sort(
          (a: any, b: any) =>
            new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
        )[0];

      setWorksiteId(Number(latest?.worksite?.id) ?? null);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
      setClockingIn(false);
    }
  }

  async function onClockIn() {
    if (!worksiteId) {
      message.error("No recent worksite found from your shifts.");
      return;
    }
    if (!navigator.geolocation) {
      message.error("Geolocation not supported by this browser");
      return;
    }

    setClockingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await gqlFetch(
            `mutation($lat: Float!, $lng: Float!, $wid: Int!) {
              clockIn(latitude: $lat, longitude: $lng, worksiteId: $wid) { id }
            }`,
            { lat: latitude, lng: longitude, wid: Number(worksiteId) }
          );
          message.success("Clocked in successfully!");
          await load();
        } catch (e: any) {
          message.error(e.message);
          setClockingIn(false);
        }
      },
      (err) => {
        message.error("Failed to get location: " + err.message);
        setClockingIn(false);
      }
    );
  }

  async function onClockOut(id: number) {
    let note: string | undefined = undefined;
    modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogoutOutlined style={{ color: '#ff4d4f' }} />
          Clock Out Confirmation
        </div>
      ),
      content: (
        <div style={{ padding: '16px 0' }}>
          <Typography.Text style={{ marginBottom: '12px', display: 'block' }}>
            Add an optional note about your shift:
          </Typography.Text>
          <Input.TextArea
            placeholder="e.g., Completed all rounds, handed over to next shift..."
            onChange={(e) => (note = e.target.value)}
            rows={3}
            maxLength={500}
            showCount
          />
        </div>
      ),
      okText: "Clock Out",
      cancelText: "Cancel",
      okButtonProps: { danger: true },
      width: 500,
      async onOk() {
        try {
          await gqlFetch(
            `mutation($id: Int!, $note: String){
              clockOut(shiftId: $id, note: $note){ id }
            }`,
            { id: Number(id), note }
          );
          message.success("Clocked out successfully!");
          load();
        } catch (e: any) {
          message.error(e.message);
        }
      },
    });
  }

  useEffect(() => { load(); }, []);

  const activeShift = shifts.find((s) => !s.clockOut);
  const completedShifts = shifts.filter((s) => s.clockOut);
  const latestWorksite = shifts.find((s) => s?.worksite?.id === worksiteId)?.worksite;

  // Calculate active shift duration
  const getActiveShiftDuration = () => {
    if (!activeShift) return null;
    const startTime = new Date(Number(activeShift.clockIn));
    const duration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* Header Card with Current Time */}
      <Card
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          color: "white"
        }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Typography.Title level={3} style={{ margin: 0, color: "white", fontWeight: 300 }}>
                Welcome Back!
              </Typography.Title>
              <Typography.Text style={{ color: "rgba(255,255,255,0.8)", fontSize: '16px' }}>
                {currentTime.toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography.Text>
              {latestWorksite && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <EnvironmentOutlined style={{ color: "rgba(255,255,255,0.8)" }} />
                  <Typography.Text style={{ color: "rgba(255,255,255,0.8)" }}>
                    Last worksite: {latestWorksite.name}
                  </Typography.Text>
                </div>
              )}
            </Space>
          </Col>
          <Col xs={24} md={12}>
            {activeShift ? (
              <Card 
                size="small" 
                style={{ 
                  background: "rgba(255,255,255,0.1)", 
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)"
                }}
              >
                <Statistic
                  title={<span style={{ color: "rgba(255,255,255,0.8)" }}>Active Shift Duration</span>}
                  value={getActiveShiftDuration() ?? 0}
                  valueStyle={{ color: "#52c41a", fontSize: "24px", fontWeight: "bold" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Typography.Text style={{ color: "rgba(255,255,255,0.6)" }}>
                  Ready to start your shift
                </Typography.Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* Clock In/Out Card */}
      <Card
        style={{
          border: `2px solid ${activeShift ? "#ff4d4f" : "#52c41a"}`,
          background: activeShift ? "linear-gradient(135deg, #fff5f5 0%, #ffe7e7 100%)" : "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {!activeShift ? (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Typography.Title level={4} style={{ margin: 0, color: "#2E2E2E" }}>
                  Ready to Clock In?
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                  {worksiteId ? `You'll be clocked in at ${latestWorksite?.name}` : 'No recent worksite found'}
                </Typography.Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<FieldTimeOutlined />}
                onClick={onClockIn}
                loading={clockingIn}
                style={{ 
                  backgroundColor: "#52c41a", 
                  borderColor: "#52c41a", 
                  borderRadius: 12,
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '200px'
                }}
                disabled={!worksiteId}
              >
                {clockingIn ? "Clocking In..." : "Clock In"}
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Badge status="processing" />
                <Typography.Title level={4} style={{ margin: '0 0 0 8px', color: "#2E2E2E", display: 'inline' }}>
                  Currently Active
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px' }}>
                  Started at {new Date(Number(activeShift.clockIn)).toLocaleString()}
                </Typography.Text>
              </div>
              <Button
                danger
                size="large"
                icon={<LogoutOutlined />}
                onClick={() => onClockOut(activeShift.id)}
                style={{ 
                  backgroundColor: "#ff4d4f", 
                  borderRadius: 12,
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '200px'
                }}
              >
                Clock Out
              </Button>
            </Space>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      {shifts.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
              <Statistic
                title="Total Shifts"
                value={shifts.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
              <Statistic
                title="Completed"
                value={completedShifts.length}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
              <Statistic
                title="Active"
                value={activeShift ? 1 : 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: activeShift ? '#faad14' : '#d9d9d9' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
              <Statistic
                title="Worksites"
                value={new Set(shifts.map(s => s.worksite?.id).filter(Boolean)).size}
                prefix={<EnvironmentOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Divider orientation="left" style={{ margin: '24px 0', fontSize: '16px', fontWeight: 600 }}>
        Recent Shifts
      </Divider>

      {/* Enhanced Shifts List */}
      <List
        loading={loading}
        dataSource={shifts}
        locale={{ emptyText: "No shifts found. Clock in to get started!" }}
        renderItem={(s, index) => {
          const inTime = new Date(Number(s.clockIn)).toLocaleString();
          const outTime = s.clockOut ? new Date(Number(s.clockOut)).toLocaleString() : null;
          const isActive = !outTime;
          
          // Calculate shift duration
          const duration = outTime 
            ? Math.floor((new Date(Number(s.clockOut)).getTime() - new Date(Number(s.clockIn)).getTime()) / (1000 * 60 * 60))
            : Math.floor((currentTime.getTime() - new Date(Number(s.clockIn)).getTime()) / (1000 * 60 * 60));

          return (
            <Card
              style={{
                marginBottom: 16,
                borderLeft: `4px solid ${isActive ? "#faad14" : "#52c41a"}`,
                borderRadius: 12,
                background: isActive ? "#fffbe6" : "#fff",
                boxShadow: isActive ? "0 4px 12px rgba(250, 173, 20, 0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'linear-gradient(45deg, #faad14, #ffc53d)',
                  color: 'white',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderBottomLeftRadius: '8px'
                }}>
                  ACTIVE
                </div>
              )}
              
              <List.Item
                actions={[
                  !outTime ? (
                    <Tooltip title="Clock out from this shift">
                      <Button 
                        danger 
                        onClick={() => onClockOut(s.id)} 
                        size="small"
                        icon={<LogoutOutlined />}
                        style={{ borderRadius: 8 }}
                      >
                        Clock Out
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tag 
                      color="success" 
                      style={{ borderRadius: 12, padding: '4px 12px', fontWeight: 500 }}
                    >
                      Completed
                    </Tag>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Typography.Text strong style={{ color: "#2E2E2E", fontSize: '16px' }}>
                        {s.worksite?.name ?? "Unknown Worksite"}
                      </Typography.Text>
                      {duration > 0 && (
                        <Tag color={isActive ? "processing" : "default"} style={{ borderRadius: 8 }}>
                          {duration}h {isActive ? "(ongoing)" : ""}
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClockCircleOutlined style={{ color: '#52c41a' }} />
                        <Typography.Text>Started: {inTime}</Typography.Text>
                      </div>
                      
                      {outTime && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <LogoutOutlined style={{ color: '#ff4d4f' }} />
                          <Typography.Text>Ended: {outTime}</Typography.Text>
                        </div>
                      )}
                      
                      {s.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <EnvironmentOutlined style={{ color: '#1890ff' }} />
                          <Typography.Text type="secondary">Location: {s.location}</Typography.Text>
                        </div>
                      )}
                      
                      {s.note && (
                        <div style={{ 
                          background: '#f0f2f5', 
                          padding: '8px 12px', 
                          borderRadius: 8, 
                          marginTop: '8px',
                          border: '1px solid #d9d9d9'
                        }}>
                          <Typography.Text italic style={{ color: '#666' }}>
                            Note: {s.note}
                          </Typography.Text>
                        </div>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            </Card>
          );
        }}
      />
      {contextHolder}
    </Space>
    <CareWorkerAnalytics  />
    </>
  );
}
