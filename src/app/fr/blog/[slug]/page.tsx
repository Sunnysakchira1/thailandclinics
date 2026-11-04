import { makeLocalizedPostPage } from "@/components/blog/LocalizedPostPage";

const page = makeLocalizedPostPage("fr");
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export const dynamicParams = false;
export default page.Page;
