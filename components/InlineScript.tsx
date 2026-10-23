/**
 * A `<script>` that runs synchronously while the HTML is parsed, i.e.
 * before first paint. On the client it renders as inert `text/plain`
 * (React warns about rendering executable scripts), and
 * `suppressHydrationWarning` covers that type mismatch — the pattern
 * from Next's "Preventing flash before hydration" guide.
 */
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
