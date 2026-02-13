import DashboardLayout from "./_components/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <DashboardLayout>
        <section className=" p-8">{children}</section>
      </DashboardLayout>
    </section>
  );
}
