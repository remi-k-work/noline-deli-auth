/** @jsxImportSource react */

// Load environment variables
import "dotenv/config";

// components
import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Tailwind, Text } from "@react-email/components";

// types
interface PinCodeProps {
  code: string;
}

PinCode.PreviewProps = {
  code: "123456",
} satisfies PinCodeProps;

export default function PinCode({ code }: PinCodeProps) {
  return (
    <Html>
      <Head>
        <title>NoLine-Deli ► Your One-Time Login PIN</title>
      </Head>
      <Tailwind>
        <Body className="bg-white text-center font-sans text-gray-500">
          <Preview>NoLine-Deli ► Your One-Time Login PIN</Preview>
          <Container className="mx-auto max-w-xl rounded-xl border border-solid border-gray-500 p-4">
            <Img src={`${process.env.AUTH_SERVER_URL}/logo.png`} alt="logo" width={1024} height={1024} className="mx-auto h-36 w-auto" />
            <Hr />
            <Text>Here is your one-time PIN to log in:</Text>
            <Heading>{code}</Heading>
            <Text>Please enter this PIN on the login page.</Text>
            <Text>This PIN will expire shortly for security reasons.</Text>
            <Hr />
            <Img src={`${process.env.AUTH_SERVER_URL}/favicon.svg`} alt="logo" width={16} height={16} className="mx-auto h-9 w-auto" />
            <Text className="text-black">Thanks, The NoLine-Deli Team</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
