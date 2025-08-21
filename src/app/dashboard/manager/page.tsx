
// app/dashboard/manager/page.tsx
"use client";
import { useEffect, useState } from "react";
import { gqlFetch } from "../../../lib/graphqlfetch";
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  List,
  Card,
  Space,
  Typography,
  Tag,
  App,
} from "antd";
import { PlusOutlined, EnvironmentOutlined } from "@ant-design/icons";
import ManagerAnalytics from "../../components/ManagerAnalytics"
export default function ManagerDashboard() {
  const { message } = App.useApp(); // ✅ Scoped message API from AntD context
  const [worksites, setWorksites] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(true);
  const [worksiteId, setWorksiteId] = useState<number | null>(null);
 const [shifts, setShifts] = useState<any[]>([]);

  const [form] = Form.useForm();

   async function load() {
    setLoading(true);
    try {
      const d = await gqlFetch(`
        query {
          myShifts {
            worksite { id name createdAt radius latitude longitude  }
          }
        }
      `);
      setShifts(d.myShifts);
      const worksites = d.myShifts
      .map((s: any) => s.worksite) // take only worksite
      .filter((w: any) => !!w); // drop nulls

    // Deduplicate by worksite.id
    const uniqueWorksites = Array.from(
      new Map(worksites.map((w: any) => [w.id, w])).values()
    );

    setWorksites(uniqueWorksites);
    

      // NEW: derive latest worksite from shifts
      const latest = [...(d.myShifts ?? [])]
        .filter((s: any) => s?.worksite?.id)
        .sort(
          (a: any, b: any) =>
            new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
        )[0];

      setWorksiteId(latest?.worksite?.id ?? null);
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }


  async function onCreate(values: any) {
    try {
      await gqlFetch(
        `mutation($n:String!, $lat:Float!, $lng:Float!, $r:Float!){
          createWorksite(name:$n, latitude:$lat, longitude:$lng, radius:$r){ id }
        }`,
        {
          n: values.name,
          lat: values.latitude,
          lng: values.longitude,
          r: values.radius,
        }
      );
      message.success("Worksite created!");
      form.resetFields();
      setOpen(false);
      load();
    } catch (e: any) {
      message.error(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      {/* Create Worksite Card */}
      <Card
        style={{
          border: "2px solid #EDA35A",
          background: "#FEE8D9",
        }}
        styles={{ body: { display: "flex", flexDirection: "column", gap: "12px"} }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: "#2E2E2E" }}>
          Manage Worksites
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
          style={{ backgroundColor: "#EDA35A", borderColor: "#EDA35A" }}
          block
        >
          New Worksite
        </Button>
      </Card>

      {/* Worksites List */}
      <List
        dataSource={worksites}
        renderItem={(w) => (
          <Card
            key={w.id}
            style={{
              marginBottom: 12,
              borderLeft: `6px solid #CADCAE`,
              background: "#fff",
            }}
          >
            <List.Item>
              <List.Item.Meta
                title={
                  <span style={{ color: "#2E2E2E", fontWeight: 600 }}>
                    {w.name}
                  </span>
                }
                description={
                  <>
                    <div>
                      <EnvironmentOutlined /> {w.latitude},{" "}
                      {w.longitude}
                    </div>
                    <div>Radius: {w.radius}m</div>
                    <Tag color="orange">
                      Created: {new Date(Number(w.createdAt)).toLocaleDateString()}
                    </Tag>
                  </>
                }
              />
            </List.Item>
          </Card>
        )}
      />

      {/* Drawer Form */}
      <Drawer
        title="Create Worksite"
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
        styles={{
          header: { background: "#CADCAE" },
          body: { background: "#E1E9C9" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item
            name="name"
            label="Worksite Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g., Sunrise Clinic" />
          </Form.Item>
          <Form.Item
            name="latitude"
            label="Latitude"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="28.6139" />
          </Form.Item>
          <Form.Item
            name="longitude"
            label="Longitude"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="77.2090" />
          </Form.Item>
          <Form.Item
            name="radius"
            label="Radius (m)"
            rules={[{ required: true, type: "number", min: 10 }]}
          >
            <InputNumber style={{ width: "100%" }} placeholder="200" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#EDA35A", borderColor: "#EDA35A" }}
              block
            >
              Save Worksite
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
      <ManagerAnalytics />
    </>
  );
}
