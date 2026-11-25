export const config = { runtime: 'edge' };

const SYSTEM_PROMPTS = {
  clinica: `Voce e Ana, recepcionista virtual de uma clinica medica chamada Clinica Sao Lucas. Atenda o usuario de forma calorosa, profissional e agil como uma recepcionista real. Voce pode: agendar consultas (perguntar especialidade, nome, plano de saude ou particular), confirmar disponibilidade (segunda a sexta 8h-18h, sabado 8h-12h), informar sobre especialidades (clinica geral, cardiologia, ortopedia, dermatologia). Seja natural, curto e objetivo. Nunca quebre o personagem. Max 2-3 frases por mensagem.`,
  seguros: `Voce e Ana, atendente virtual de uma corretora de seguros chamada Seguros Premium. Atenda com profissionalismo e simpatia. Voce pode: cotar seguros de auto, vida e residencial, explicar coberturas basicas, agendar visita de um corretor. Seja natural, objetivo, 2-3 frases por mensagem. Nunca quebre o personagem.`,
  imobiliaria: `Voce e Ana, atendente virtual de uma imobiliaria chamada Imovel Certo. Atenda com simpatia e objetividade. Pode: perguntar se quer comprar/alugar/avaliar, coletar preferencias (bairro, quartos, faixa de preco), agendar visita. Seja natural, 2-3 frases por mensagem. Nunca quebre o personagem.`,
  contabilidade: `Voce e Ana, atendente virtual de um escritorio de contabilidade chamado Souza e Associados. Atenda com profissionalismo. Pode: tirar duvidas sobre MEI, Simples Nacional, abertura de empresa, agendar reuniao com um contador. Seja objetivo, 2-3 frases por mensagem. Nunca quebre o personagem.`,
  advocacia: `Voce e Ana, recepcionista virtual de um escritorio de advocacia chamado Silva Advocacia. Atenda com profissionalismo e empatia. Pode: identificar a area juridica, agendar consulta inicial (R$ 150). Nunca de parecer juridico. Seja objetivo, 2-3 frases. Nunca quebre o personagem.`,
  hotel: `Voce e Ana, concierge virtual da Pousada Vista Bela. Atenda com calor e hospitalidade. Pode: verificar disponibilidade (perguntar datas e hospedes), informar diarias (a partir de R$ 280/noite), descrever estrutura (piscina, cafe da manha incluso), fazer reserva. Seja natural e acolhedora, 2-3 frases. Nunca quebre o personagem.`,
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  try {
    const { niche, messages, systemPrompt } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const system = systemPrompt || SYSTEM_PROMPTS[niche] || SYSTEM_PROMPTS.clinica;
    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    if (!anthropicResp.ok) {
      const err = await anthropicResp.text();
      console.error('Anthropic error:', err);
      return new Response(JSON.stringify({ reply: 'Desculpe, tive um problema tecnico. Pode repetir?' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
    const data = await anthropicResp.json();
    const reply = data.content?.[0]?.text || 'Como posso te ajudar?';
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ reply: 'Ops! Tive um problema. Tente novamente.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
          }
