import { redirect } from "next/navigation";

/**
 * Convenience shortcut so an editor can append /edit to any article
 * URL and be taken to the admin editor:
 *
 *   /articles/cant-stop-comparing/edit
 *     → /admin/edit/cant-stop-comparing  (Basic Auth)
 */
export default function ArticleEditRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/admin/edit/${params.slug}`);
}
