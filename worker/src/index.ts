export interface Env {
  RATE_LIMIT: KVNamespace;
  ALLOWED_ORIGINS: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  RESEND_API_KEY: string;
}

interface ContactPayload {
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  // Campo honeypot: deve chegar vazio. Bots que preenchem todo campo do
  // formulário tendem a preencher este também, então usamos isso para
  // descartar o envio silenciosamente (sem revelar ao bot que foi barrado).
  empresa_site?: string;
}

const MAX_SUBMISSIONS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1 hora
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin: string | null, allowedOrigins: string[]): HeadersInit {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function jsonResponse(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin, allowedOrigins);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Método não permitido.' }, 405, headers);
    }

    if (!origin || !allowedOrigins.includes(origin)) {
      return jsonResponse({ error: 'Origem não permitida.' }, 403, headers);
    }

    let payload: ContactPayload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: 'Corpo da requisição inválido.' }, 400, headers);
    }

    // Honeypot: campo deve chegar vazio. Se vier preenchido, respondemos como
    // se tivesse dado certo, sem enviar e-mail nem sinalizar ao bot.
    if (payload.empresa_site) {
      return jsonResponse({ ok: true }, 200, headers);
    }

    const nome = payload.nome?.trim() ?? '';
    const email = payload.email?.trim() ?? '';
    const telefone = payload.telefone?.trim() ?? '';
    const mensagem = payload.mensagem?.trim() ?? '';

    if (!nome || !email || !mensagem) {
      return jsonResponse({ error: 'Preencha nome, e-mail e mensagem.' }, 400, headers);
    }
    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: 'E-mail inválido.' }, 400, headers);
    }
    if (nome.length > 200 || email.length > 200 || telefone.length > 50 || mensagem.length > 5000) {
      return jsonResponse({ error: 'Campo excede o tamanho máximo permitido.' }, 400, headers);
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'desconhecido';
    const rateLimitKey = `rl:${ip}`;
    const currentCount = Number((await env.RATE_LIMIT.get(rateLimitKey)) ?? '0');

    if (currentCount >= MAX_SUBMISSIONS_PER_WINDOW) {
      return jsonResponse(
        { error: 'Muitas tentativas em pouco tempo. Tente novamente mais tarde ou use o WhatsApp.' },
        429,
        headers
      );
    }

    await env.RATE_LIMIT.put(rateLimitKey, String(currentCount + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
    });

    const emailHtml = `
      <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(telefone || 'não informado')}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(mensagem).replace(/\n/g, '<br>')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `Novo contato pelo site: ${nome}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Falha ao enviar e-mail via Resend:', resendResponse.status, errorBody);
      return jsonResponse(
        { error: 'Não foi possível enviar sua mensagem agora. Tente novamente ou use o WhatsApp.' },
        502,
        headers
      );
    }

    return jsonResponse({ ok: true }, 200, headers);
  },
};
