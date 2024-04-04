"use client";
import { Layout, Typography } from "antd";
import { ConnectWallet } from "@thirdweb-dev/react";

import Image from "next/image";
import styles from "./SiteLayout.module.css";
import Link from "next/link";

const { Content, Footer } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div className={styles.navbar}>
        <Link href="/">
          <div className={styles.logo}>
            <Image
              src="/nav_logo.png"
              alt="Logo"
              className={styles.logoImage}
              width={40}
              height={40}
            />
            <Typography.Text strong className={styles.logoText}>
              Push Communities
            </Typography.Text>
          </div>
        </Link>
        <div className={styles.navbarButtons}>
          <ConnectWallet
            theme="light"
            modalSize={"wide"} // compact | wide
            dropdownPosition={{
              side: "bottom", //  "top" | "bottom" | "left" | "right";
              align: "end" // "start" | "center" | "end";
            }}
            termsOfServiceUrl="https://example.com/terms"
            privacyPolicyUrl="https://example.com/privacy"
          />
        </div>
      </div>
      <Content style={{ minHeight: 300 }}>{children}</Content>
      <Footer className={styles.footer}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ by Salman Dabbakuti. Powered by Nextjs & Ant Design
        </a>
      </Footer>
    </Layout>
  );
}
