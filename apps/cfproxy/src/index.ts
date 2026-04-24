interface Env {
  KV: KVNamespace;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const incomingHost = url.hostname;
    const targetHost = await env.KV.get(incomingHost);
    if (!targetHost) {
      return new Response(`No mapping found for ${incomingHost}`, { status: 404 });
    }

    const targetUrl = new URL(request.url);
    targetUrl.protocol = "https:";
    targetUrl.hostname = targetHost;
    targetUrl.port = "";

    const outgoingHeaders = new Headers(request.headers);
    outgoingHeaders.set("Host", targetHost);

    const clientIP = request.headers.get("cf-connecting-ip");
    if (clientIP) {
      outgoingHeaders.append("X-Forwarded-For", clientIP);
    }

    const body =
      request.method === "GET" || request.method === "HEAD"
        ? null
        : request.body;

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: outgoingHeaders,
      body,
      redirect: "manual",
    });

    const response = await fetch(proxyRequest);
    const responseHeaders = new Headers(response.headers);

    responseHeaders.delete("content-security-policy");
    responseHeaders.delete("content-security-policy-report-only");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
} satisfies ExportedHandler<Env>;