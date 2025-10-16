import { html as beautifyHtml } from "js-beautify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ResultCard({ result }) {
  const statusClass = result.found ? "border-[#10b981]" : "border-[#e89090]";
  const statusText = result.found
    ? "Authentication component found"
    : "No authentication component";

  // Debug logging
  console.log("📊 ResultCard received:", result);
  console.log("🚨 CAPTCHA flag:", result.captcha_detected);

  const confidenceBadgeColor = {
    high: "bg-[#10b981] text-white",
    medium: "bg-[#f0c875] text-[#2d2d2d]",
    low: "bg-[#e89090] text-white",
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("HTML copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy to clipboard");
    }
  };

  // Function to format HTML with proper indentation
  const formatHtml = (html) => {
    if (!html) return "";

    try {
      return beautifyHtml(html, {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 1,
        preserve_newlines: true,
        indent_inner_html: true,
        wrap_line_length: 0,
        unformatted: [],
      });
    } catch (error) {
      console.error("Error formatting HTML:", error);
      return html;
    }
  };

  return (
    <div className={`card border-l-2 ${statusClass} animate-slide-up`}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-base font-light text-[#5a5a5a] mb-2 uppercase tracking-wider">
          {statusText}
        </p>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#5b7fd4] hover:text-[#4a6ec3] transition-colors break-all text-base font-normal"
        >
          {result.url}
        </a>
      </div>

      {/* CAPTCHA Warning - Show prominently if detected */}
      {result.captcha_detected && (
        <div className="mb-6 p-6 bg-gradient-to-r from-[#fef3c7] to-[#fed7aa] rounded-xl border-2 border-[#f59e0b] animate-pulse-slow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-3xl">🤖🚫</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#92400e] mb-2">
                AI Agent Protection Detected
              </h3>
              <p className="text-[#92400e] text-sm font-normal leading-relaxed mb-3">
                This website uses{" "}
                <strong>CAPTCHA or anti-bot protection</strong> (DataDome,
                Cloudflare, reCAPTCHA, etc.) that prevents automated scraping.
                The login page cannot be accessed programmatically.
              </p>
              <div className="bg-white/60 rounded-lg p-3 mt-3">
                <p className="text-xs font-semibold text-[#92400e] mb-2">
                  🔑 Alternatives:
                </p>
                <ul className="text-xs text-[#92400e] space-y-1 ml-4 list-disc">
                  <li>Use the site's official API if available</li>
                  <li>Manually export HTML from your browser DevTools</li>
                  <li>Test with similar sites without bot protection</li>
                  <li>Check CAPTCHA_PROTECTED_SITES.md for workarounds</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If not found, just show a simple message */}
      {!result.found && !result.captcha_detected && (
        <div className="mb-6 p-6 bg-[#fafafa] rounded-xl border border-[#e0e0e0] text-center">
          <p className="text-[#5a5a5a] text-base font-light">
            No authentication components found in this webpage
          </p>
        </div>
      )}

      {/* Details */}
      {result.found && result.details && (
        <div className="mb-6 space-y-3">
          <p className="text-sm font-light text-[#5a5a5a] uppercase tracking-wider mb-3">
            Details
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="text-center py-3 px-3 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
              <p className="text-[#5a5a5a] text-sm font-light mb-1">Type</p>
              <p className="text-[#2d2d2d] text-base font-normal capitalize">
                {result.component_type || "N/A"}
              </p>
            </div>
            <div className="text-center py-3 px-3 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
              <p className="text-[#5a5a5a] text-sm font-light mb-1">Password</p>
              <p className="text-[#2d2d2d] text-base">
                {result.details.has_password_field ? "✓" : "—"}
              </p>
            </div>
            <div className="text-center py-3 px-3 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
              <p className="text-[#5a5a5a] text-sm font-light mb-1">Email</p>
              <p className="text-[#2d2d2d] text-base">
                {result.details.has_email_field ? "✓" : "—"}
              </p>
            </div>
            <div className="text-center py-3 px-3 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
              <p className="text-[#5a5a5a] text-sm font-light mb-1">Username</p>
              <p className="text-[#2d2d2d] text-base">
                {result.details.has_username_field ? "✓" : "—"}
              </p>
            </div>
            <div className="text-center py-3 px-3 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
              <p className="text-[#5a5a5a] text-sm font-light mb-1">Submit</p>
              <p className="text-[#2d2d2d] text-base">
                {result.details.has_submit_button ? "✓" : "—"}
              </p>
            </div>
            {result.confidence && (
              <div className="text-center py-3 px-3 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
                <p className="text-[#5a5a5a] text-sm font-light mb-1">
                  Confidence
                </p>
                <p
                  className={`text-base font-normal ${
                    result.confidence === "high"
                      ? "text-[#10b981]"
                      : result.confidence === "medium"
                      ? "text-[#f0c875]"
                      : "text-[#e89090]"
                  }`}
                >
                  {result.confidence}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {result.description && result.found && (
        <div className="mb-6 p-4 bg-[#fafafa] rounded-xl border border-[#e0e0e0]">
          <div className="text-[#2d2d2d] text-base font-light leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mt-3 mb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-bold mt-3 mb-1" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4
                    className="text-base font-semibold mt-2 mb-1"
                    {...props}
                  />
                ),
                h5: ({ node, ...props }) => (
                  <h5 className="text-sm font-semibold mt-2 mb-1" {...props} />
                ),
                h6: ({ node, ...props }) => (
                  <h6 className="text-sm font-semibold mt-1 mb-1" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc ml-6 my-2 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal ml-6 my-2 space-y-1" {...props} />
                ),
                li: ({ node, ...props }) => <li className="ml-0" {...props} />,
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code
                      className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    />
                  ) : (
                    <code
                      className="block bg-gray-200 p-2 rounded text-sm font-mono overflow-x-auto"
                      {...props}
                    />
                  ),
                pre: ({ node, ...props }) => (
                  <pre
                    className="bg-gray-200 p-3 rounded my-2 overflow-x-auto"
                    {...props}
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-3">
                    <table
                      className="min-w-full border-collapse border border-gray-300 text-sm"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-100" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="border border-gray-300 px-3 py-2 text-left font-semibold"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-gray-300 px-3 py-2" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-gray-50" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-4 border-t border-gray-300" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-gray-300 pl-4 italic my-2"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-[#5b7fd4] hover:text-[#4a6ec3] underline"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
              }}
            >
              {result.description}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* HTML Snippet */}
      {result.html_snippet && result.found && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-light text-[#5a5a5a] uppercase tracking-wider">
              HTML Snippet
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5a5a5a] bg-[#fafafa] px-3 py-1 rounded-full border border-[#e0e0e0]">
                {result.html_snippet.length.toLocaleString()} characters
              </span>
              <button
                onClick={() => copyToClipboard(result.html_snippet)}
                className="text-xs text-[#5b7fd4] hover:text-[#4a6ec3] bg-[#fafafa] hover:bg-[#5b7fd4]/10 px-3 py-1 rounded-full border border-[#e0e0e0] hover:border-[#5b7fd4] transition-all"
                title="Copy HTML to clipboard"
              >
                Copy
              </button>
            </div>
          </div>
          <pre className="bg-[#2d2d2d] text-[#10b981] p-4 rounded-xl overflow-x-auto text-sm font-mono border border-[#e0e0e0] whitespace-pre max-h-96 overflow-y-auto">
            <code>{formatHtml(result.html_snippet)}</code>
          </pre>
        </div>
      )}

      {/* Timestamp */}
      {result.analyzed_at && (
        <p className="text-[#5a5a5a] text-sm font-light mt-4">
          {result.analyzed_at}
        </p>
      )}
    </div>
  );
}

export default ResultCard;
