const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

const VERIFY_URL = process.env.VERIFY_URL || 'https://brofinder.mywebcommunity.org/ajax_discord_verify.php';

client.once('ready', () => {
    console.log('✅ Bot online: ' + client.user.tag);
});

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;
    const text = msg.content.trim();

    if (/^!pomoc$/i.test(text) || /^!help$/i.test(text)) {
        msg.reply('Napiš: `!overit TVUJ_KOD` – kód získáš na BroFinderu v Nastavení → Ověření účtu.');
        return;
    }

    const m = text.match(/^!overit\s+(\S+)/i);
    if (!m) return;
    const code = m[1].toUpperCase();

    try {
        const res = await fetch(VERIFY_URL + '?code=' + encodeURIComponent(code));
        const body = await res.text();
        console.log('VERIFY [' + code + '] → status ' + res.status + ' | body: ' + body.slice(0, 300));

        let data = {};
        try { data = JSON.parse(body); } catch (e) {}

        if (data.ok) {
            msg.reply('✅ Tvůj účet na BroFinderu je nyní ověřený! Modrá fajfka už svítí.');
        } else {
            msg.reply('❌ Neplatný kód. Vygeneruj si nový v Nastavení a zkus to znovu.');
        }
    } catch (e) {
        console.error('VERIFY error:', e);
        msg.reply('⚠️ Nepodařilo se ověřit kód, zkus to prosím později.');
    }
});

client.login(process.env.DISCORD_TOKEN);
