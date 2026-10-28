import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';
import { validateEnquiry } from '../src/lib/enquiry';

interface Env {
  ASSETS: Fetcher;
  ENQUIRY_EMAIL: SendEmail;
  SITE_ORIGIN?: string;
  EMAIL_FROM?: string;
  EMAIL_TO?: string;
  TURNSTILE_SECRET_KEY?: string;
}
const json = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname !== '/api/enquiry') return json({ error: 'Not found.' }, 404);
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    if (!env.SITE_ORIGIN || !env.EMAIL_FROM || !env.EMAIL_TO || !env.TURNSTILE_SECRET_KEY) return json({ error: 'Enquiries are not available yet. Please try again later.' }, 503);
    if (request.headers.get('Origin') !== env.SITE_ORIGIN) return json({ error: 'Please submit the form from our website.' }, 403);
    if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data') && !request.headers.get('Content-Type')?.startsWith('application/x-www-form-urlencoded')) return json({ error: 'Unsupported form format.' }, 415);
    // Enforce the actual streamed size, even when Content-Length is absent.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Missing form data.' }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20000) { await reader.cancel(); return json({ error: 'Your enquiry is too long.' }, 413); }
      chunks.push(value);
    }
    let form: FormData;
    let enquiry;
    try {
      const body = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
      form = await new Response(body, { headers: { 'Content-Type': request.headers.get('Content-Type')! } }).formData();
      if (form.get('website')) return json({ error: 'Unable to submit this enquiry.' }, 400);
      enquiry = validateEnquiry(form);
    } catch (error) { return json({ error: error instanceof Error ? error.message : 'Please check your form.' }, 400); }
    const token = form.get('cf-turnstile-response');
    if (typeof token !== 'string' || !token || token.length > 2048) return json({ error: 'Please complete the spam protection.' }, 400);
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get('CF-Connecting-IP') || '' }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await verification.json() as { success: boolean; hostname?: string; action?: string };
      if (!verification.ok || !result.success || result.hostname !== new URL(env.SITE_ORIGIN).hostname || result.action !== 'enquiry') return json({ error: 'Spam protection expired or failed. Please try again.' }, 400);
      const message = createMimeMessage();
      message.setSender({ name: 'Website enquiries', addr: env.EMAIL_FROM });
      message.setRecipient(env.EMAIL_TO);
      message.setHeader('Reply-To', enquiry.email);
      message.setSubject(`Booking enquiry: ${enquiry.services.join(', ')} — ${enquiry.registration}`);
      message.addMessage({ contentType: 'text/plain', data: `New website enquiry\n\nName: ${enquiry.name}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nRegistration: ${enquiry.registration}\nServices: ${enquiry.services.join(', ')}\nTiming: ${enquiry.urgency}\nPreferred date: ${enquiry.date || 'Not specified'}\n\n${enquiry.message}\n\nThis is a booking request, not a confirmed appointment.` });
      await env.ENQUIRY_EMAIL.send(new EmailMessage(env.EMAIL_FROM, env.EMAIL_TO, message.asRaw()));
      return json({ ok: true });
    } catch {
      // Do not log contact details, message bodies, tokens, or email provider errors.
      return json({ error: 'We couldn’t send your enquiry. Please try again shortly.' }, 502);
    }
  },
} satisfies ExportedHandler<Env>;
