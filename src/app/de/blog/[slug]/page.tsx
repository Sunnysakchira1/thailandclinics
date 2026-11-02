import { makeLocalizedPostPage } from "@/components/blog/LocalizedPostPage";

const page = makeLocalizedPostPage("de");
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export const dynamicParams = false;
export default page.Page;
