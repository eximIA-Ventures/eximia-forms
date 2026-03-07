import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = () => process.env.FROM_EMAIL || "eximIA Forms <noreply@eximiaventures.com.br>";
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Base64-encoded PNG logo (400px wide, compressed) for email client compatibility
const LOGO_BASE64 = "data:image/png;base64,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";

// ── Shared email layout ──────────────────────────────────────────────

function emailLayout(content: string) {
  const url = APP_URL();
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>eximIA Forms</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0C0C0E; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0C0C0E;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

          <!-- Header with logo -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: center;">
              <a href="${url}" target="_blank" style="text-decoration: none;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td style="padding-right: 12px; vertical-align: middle;">
                      <img src="${LOGO_BASE64}" alt="eximIA" width="120" height="26" style="display: block;" />
                    </td>
                    <td style="width: 1px; background-color: rgba(255,255,255,0.15); height: 22px; vertical-align: middle;"></td>
                    <td style="padding-left: 12px; vertical-align: middle;">
                      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #C4A882;">FORMS</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color: #161618; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #555;">
                eximIA Forms — AI-first form builder
              </p>
              <p style="margin: 0; font-size: 11px; color: #3a3a3a;">
                &copy; ${new Date().getFullYear()} eximIA Ventures. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
  <tr>
    <td style="background: linear-gradient(135deg, #C4A882, #D4BC9A); border-radius: 10px; text-align: center;">
      <a href="${href}" target="_blank"
         style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #000; text-decoration: none; letter-spacing: 0.02em;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function featureRow(icon: string, title: string, description: string) {
  return `
<tr>
  <td style="padding: 12px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="width: 40px; vertical-align: top; padding-top: 2px;">
          <div style="width: 32px; height: 32px; background-color: rgba(196,168,130,0.12); border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">
            ${icon}
          </div>
        </td>
        <td style="padding-left: 12px; vertical-align: top;">
          <p style="margin: 0 0 2px 0; font-size: 13px; font-weight: 600; color: #E8E0D4;">${title}</p>
          <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.5;">${description}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function divider() {
  return `<tr><td style="padding: 8px 0;"><div style="height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent);"></div></td></tr>`;
}

// ── Email: Welcome ───────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name?: string) {
  if (!process.env.RESEND_API_KEY) return;

  const url = APP_URL();
  const greeting = name ? `${name}, bem-vindo` : "Bem-vindo";

  const content = `
<!-- Gold accent line -->
<div style="height: 3px; background: linear-gradient(to right, #C4A882, #D4BC9A, #C4A882);"></div>

<!-- Body -->
<div style="padding: 40px 36px;">
  <!-- Heading -->
  <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
    ${greeting} ao eximIA Forms
  </h1>
  <p style="margin: 0 0 28px 0; font-size: 14px; color: #C4A882; font-weight: 500;">
    Sua conta está pronta. Vamos criar algo eximio.
  </p>

  <!-- Intro text -->
  <p style="margin: 0 0 32px 0; font-size: 14px; color: #999; line-height: 1.7;">
    Agora você tem acesso a um form builder com <strong style="color: #ccc;">inteligência artificial nativa</strong>
    — descreva o que precisa e receba formulários completos com campos avançados, lógica condicional e analytics em tempo real.
  </p>

  <!-- CTA -->
  ${ctaButton("Acessar meu dashboard &rarr;", `${url}/admin`)}

  <!-- Features section -->
  <div style="margin-top: 36px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.06);">
    <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #666;">
      O que você pode fazer agora
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${featureRow("&#10024;", "Gere formulários com IA", "Descreva seu objetivo em português e a IA cria tudo — campos, validações e lógica.")}
      ${featureRow("&#128202;", "Analytics em tempo real", "Acompanhe taxa de conclusão, drop-off por página e análise de sentimento.")}
      ${featureRow("&#128300;", "Campos de pesquisa avançados", "Likert, diferencial semântico, ranking, soma constante e verificação de atenção.")}
      ${featureRow("&#128737;", "LGPD built-in", "Bundle de consentimento pronto. Um clique e seu formulário está em compliance.")}
    </table>
  </div>

  <!-- Quick start steps -->
  <div style="margin-top: 28px; padding: 20px; background-color: rgba(196,168,130,0.06); border: 1px solid rgba(196,168,130,0.1); border-radius: 12px;">
    <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #C4A882;">
      Comece em 3 passos:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #999;">
          <span style="color: #C4A882; font-weight: 600;">1.</span> &nbsp;Clique em <strong style="color: #ccc;">"Novo formulário"</strong>
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #999;">
          <span style="color: #C4A882; font-weight: 600;">2.</span> &nbsp;Descreva o que precisa ou escolha um template
        </td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #999;">
          <span style="color: #C4A882; font-weight: 600;">3.</span> &nbsp;Publique e comece a coletar respostas
        </td>
      </tr>
    </table>
  </div>
</div>`;

  await getResend().emails.send({
    from: FROM(),
    to,
    subject: `${greeting} ao eximIA Forms!`,
    html: emailLayout(content),
  });
}

// ── Email: Subscription confirmed ────────────────────────────────────

export async function sendSubscriptionEmail(to: string, plan: string) {
  if (!process.env.RESEND_API_KEY) return;

  const url = APP_URL();
  const planLabels: Record<string, string> = {
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  };
  const planEmoji: Record<string, string> = {
    pro: "&#9889;",
    business: "&#128081;",
    enterprise: "&#127963;",
  };
  const planFeatures: Record<string, string[]> = {
    pro: [
      "25 formulários",
      "1.000 respostas/mês",
      "50 gerações com IA/mês",
      "Lógica condicional visual",
      "Temas customizados",
      "Modo piloto",
      "Exportação completa de dados",
    ],
    business: [
      "100 formulários",
      "10.000 respostas/mês",
      "500 gerações com IA/mês",
      "Campos avançados de pesquisa",
      "Detecção de order bias",
      "Analytics com IA",
      "Sem marca d'água",
    ],
    enterprise: [
      "Formulários ilimitados",
      "Respostas ilimitadas",
      "Gerações IA ilimitadas",
      "Self-hosted (Docker)",
      "API completa",
      "Suporte dedicado",
      "SLA 99.9%",
    ],
  };

  const label = planLabels[plan] || plan;
  const emoji = planEmoji[plan] || "&#11088;";
  const features = planFeatures[plan] || [];

  const featureListHtml = features
    .map(
      (f) =>
        `<tr><td style="padding: 6px 0; font-size: 13px; color: #999;">
          <span style="color: #C4A882; margin-right: 8px;">&#10003;</span>
          ${f}
        </td></tr>`
    )
    .join("");

  const content = `
<!-- Gold accent line -->
<div style="height: 3px; background: linear-gradient(to right, #C4A882, #D4BC9A, #C4A882);"></div>

<!-- Body -->
<div style="padding: 40px 36px;">
  <!-- Plan badge -->
  <div style="display: inline-block; padding: 6px 14px; background-color: rgba(196,168,130,0.12); border: 1px solid rgba(196,168,130,0.2); border-radius: 8px; margin-bottom: 20px;">
    <span style="font-size: 12px; font-weight: 600; color: #C4A882; letter-spacing: 0.05em;">${emoji} Plano ${label}</span>
  </div>

  <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
    Plano ${label} ativado!
  </h1>
  <p style="margin: 0 0 28px 0; font-size: 14px; color: #999; line-height: 1.7;">
    Obrigado por escolher o eximIA Forms. Todos os recursos do plano
    <strong style="color: #C4A882;">${label}</strong> já estão disponíveis na sua conta.
  </p>

  <!-- CTA -->
  ${ctaButton("Explorar novos recursos &rarr;", `${url}/admin`)}

  <!-- What's included -->
  <div style="margin-top: 36px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.06);">
    <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #666;">
      O que o plano ${label} inclui
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${featureListHtml}
    </table>
  </div>

  <!-- Manage subscription note -->
  <div style="margin-top: 28px; padding: 16px 20px; background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;">
    <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
      Gerencie sua assinatura a qualquer momento em
      <a href="${url}/admin/settings" style="color: #C4A882; text-decoration: none; font-weight: 500;">Configurações</a>.
      Você pode fazer upgrade, downgrade ou cancelar quando quiser.
    </p>
  </div>
</div>`;

  await getResend().emails.send({
    from: FROM(),
    to,
    subject: `Plano ${label} ativado! — eximIA Forms`,
    html: emailLayout(content),
  });
}

// ── Email: Payment failed ────────────────────────────────────────────

export async function sendPaymentFailedEmail(to: string) {
  if (!process.env.RESEND_API_KEY) return;

  const url = APP_URL();

  const content = `
<!-- Red accent line for urgency -->
<div style="height: 3px; background: linear-gradient(to right, #E5484D, #F76B6B, #E5484D);"></div>

<!-- Body -->
<div style="padding: 40px 36px;">
  <!-- Warning icon -->
  <div style="width: 48px; height: 48px; background-color: rgba(229,72,77,0.1); border-radius: 12px; text-align: center; line-height: 48px; font-size: 22px; margin-bottom: 20px;">
    &#9888;
  </div>

  <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
    Problema com seu pagamento
  </h1>
  <p style="margin: 0 0 28px 0; font-size: 14px; color: #999; line-height: 1.7;">
    Não conseguimos processar a cobrança da sua assinatura.
    Para <strong style="color: #ccc;">manter seu plano ativo</strong> e continuar acessando todos os recursos,
    atualize seus dados de pagamento.
  </p>

  <!-- CTA -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td style="background-color: #E5484D; border-radius: 10px; text-align: center;">
        <a href="${url}/admin/upgrade" target="_blank"
           style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; letter-spacing: 0.02em;">
          Atualizar pagamento &rarr;
        </a>
      </td>
    </tr>
  </table>

  <!-- What happens next -->
  <div style="margin-top: 36px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.06);">
    <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #666;">
      O que acontece agora?
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #999; line-height: 1.6;">
          <span style="color: #E5484D; font-weight: 600;">1.</span> &nbsp;Vamos tentar cobrar novamente nos próximos dias
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #999; line-height: 1.6;">
          <span style="color: #E5484D; font-weight: 600;">2.</span> &nbsp;Se a cobrança falhar novamente, sua assinatura será pausada
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #999; line-height: 1.6;">
          <span style="color: #E5484D; font-weight: 600;">3.</span> &nbsp;Seus dados e formulários <strong style="color: #ccc;">nunca são deletados</strong> — basta regularizar
        </td>
      </tr>
    </table>
  </div>

  <!-- Help note -->
  <div style="margin-top: 28px; padding: 16px 20px; background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;">
    <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.6;">
      Se acredita que isso é um engano ou precisa de ajuda,
      responda este email que nossa equipe vai resolver.
    </p>
  </div>
</div>`;

  await getResend().emails.send({
    from: FROM(),
    to,
    subject: "Ação necessária: problema com seu pagamento — eximIA Forms",
    html: emailLayout(content),
  });
}
