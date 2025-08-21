
// providers/AntdProvider.tsx
"use client";

import { ConfigProvider, App as AntApp } from "antd";
import { StyleProvider, legacyLogicalPropertiesTransformer } from "@ant-design/cssinjs";

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (

<StyleProvider transformers={[legacyLogicalPropertiesTransformer]}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#EDA35A", // main accent
              colorBgBase: "#FEE8D9",  // soft background
              colorTextBase: "#2E2E2E",
              borderRadius: 12,
              fontFamily: "Inter, sans-serif",
            },
            components: {
              Layout: {
                headerBg: "#CADCAE",
              },
              Button: {
                colorPrimary: "#EDA35A",
                colorPrimaryHover: "#e28d38",
              },
              Card: {
                headerBg: "#E1E9C9",
              },
            },
          }}
        >
          <AntApp>{children}</AntApp>
        </ConfigProvider>
 </StyleProvider>

  );
}
