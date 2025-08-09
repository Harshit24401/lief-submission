
'use client';

import React from 'react';
import { Card, Table, Row, Col, Form, InputNumber, Button, Select } from 'antd';

// Mock chart components — replace with Chart.js or Ant Design Charts
const PlaceholderChart: React.FC<{ title: string }> = ({ title }) => (
  <div style={{
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    border: '1px dashed #ccc'
  }}>
    {title} Chart
  </div>
);

interface StaffClockIn {
  name: string;
  clockIn: string;
  location: string;
  note?: string;
}

export default function ManagerDashboardPage() {
  const staffClockedIn: StaffClockIn[] = [
    { name: 'Alice', clockIn: '08:45', location: 'Ward A', note: '' },
    { name: 'Bob', clockIn: '09:10', location: 'Reception', note: 'Late' }
  ];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Clock In Time', dataIndex: 'clockIn', key: 'clockIn' },
    { title: 'Clock In Location', dataIndex: 'location', key: 'location' },
    { title: 'Note', dataIndex: 'note', key: 'note' }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Perimeter Settings */}
      <Card title="Perimeter Settings" style={{ marginBottom: 24 }}>
        <Form layout="inline">
          <Form.Item label="Latitude" name="latitude">
            <InputNumber style={{ width: 120 }} />
          </Form.Item>
          <Form.Item label="Longitude" name="longitude">
            <InputNumber style={{ width: 120 }} />
          </Form.Item>
          <Form.Item label="Radius (km)" name="radius">
            <InputNumber min={0} style={{ width: 120 }} />
          </Form.Item>
          <Button type="primary">Save</Button>
        </Form>
      </Card>

      {/* Staff Clocked In */}
      <Card title="Staff Clocked In" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={staffClockedIn}
          rowKey={(record) => record.name}
          pagination={false}
        />
      </Card>

      {/* Analytics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Avg Hours per Day">
            <PlaceholderChart title="Avg Hours" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Clock-ins per Day">
            <PlaceholderChart title="Clock-ins" />
          </Card>
        </Col>
      </Row>

      <Card title="Total Hours per Staff (Last 7 Days)" style={{ marginBottom: 24 }}>
        <PlaceholderChart title="Total Hours" />
      </Card>

      {/* Staff History */}
      <Card title="Staff History">
        <Select placeholder="Select staff" style={{ width: 200, marginBottom: 16 }}>
          <Select.Option value="alice">Alice</Select.Option>
          <Select.Option value="bob">Bob</Select.Option>
        </Select>
        <Table
          columns={columns}
          dataSource={staffClockedIn}
          rowKey={(record) => record.name}
          pagination={false}
        />
      </Card>
    </div>
  );
}
