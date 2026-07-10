import fs from "node:fs";
import path from "node:path";
import PrototypeRuntime from "@/components/PrototypeRuntime";

export default function HomePage({ params }) {
  const slug = params?.slug ? params.slug.join("/") : "";
  const markup = fs.readFileSync(
    path.join(process.cwd(), "src", "prototype", "hrms-markup.html"),
    "utf8"
  );

  return (
    <>
      <div
        id="hrms-prototype-root"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      <PrototypeRuntime initialSlug={slug} />
    </>
  );
}
