import ContextLayout from "@components/layouts/context-layout";
import Layout from "@components/layouts/layout";
import "@repo/ui/globals.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ContextLayout>
          <Layout>{children}</Layout>
        </ContextLayout>
      </body>
    </html>
  );
}
