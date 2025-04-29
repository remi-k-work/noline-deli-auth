/** @jsxImportSource react */

// Load environment variables
import "dotenv/config";

import { Body, Button, Container, Head, Html, Img, Preview, Section, Tailwind } from "@react-email/components";

export default function PinCode() {
  return (
    <Html>
      <Head>
        <title>NoLine-Deli ► Pin Code</title>
      </Head>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Preview>NoLine-Deli ► Pin Code</Preview>
          <Container className="m-auto max-w-xl rounded-xl border border-solid border-gray-500 p-8">
            <Section>
              <Img src={`${process.env.AUTH_SERVER_URL}/logo.png`} alt="logo" width={1024} height={1024} className="h-auto max-w-full object-contain" />
            </Section>
            <Button href="https://example.com" style={{ background: "#000", color: "#fff", padding: "12px 20px" }}>
              Click me
            </Button>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
