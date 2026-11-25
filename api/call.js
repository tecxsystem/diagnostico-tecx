export const config = { runtime: 'edge' };

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
    const { phone, niche, nome } = await req.json();
    const digits = phone.replace(/\D/g, '');
    const e164 = digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
    const vonoApiKey = process.env.VONO_API_KEY;
    if (vonoApiKey) {
      // Integration placeholder for Vono/OmniTechX outbound call
      // POST to Vono API with e164 phone, agent_id: agent_gwonk57gmsnp1dge
    }
    console.log(`[Demo] Call to ${e164}, niche: ${niche}, nome: ${nome}`);
    return new Response(JSON.stringify({
      success: true,
      message: 'Ligacao iniciada com sucesso',
      phone: e164
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('Call handler error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Erro ao iniciar ligacao' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
