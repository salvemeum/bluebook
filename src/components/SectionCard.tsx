import { PropsWithChildren } from "react";

export default function SectionCard({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <section className="bg-white rounded-2xl shadow border p-4 mb-5
                        dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-700">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
