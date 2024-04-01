import ContextLayout from "@components/layouts/context-layout";
import Layout from "@components/layouts/layout";
import "@repo/ui/globals.css";
export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale}>
      <body>
        <ContextLayout>
          <Layout>{children} </Layout>{" "}
        </ContextLayout>
      </body>
    </html>
  );
}
