import { Body, Button, Html, Preview } from "@react-email/components";

export default function MyEmail() {
  return (
    <Html>
      <Preview>Download and view receipt</Preview>
      <Body>
        <Button href="https://example.com" style={{ background: "#000", color: "#fff", padding: "12px 20px" }}>
          Click me
        </Button>
      </Body>
    </Html>
  );
}
