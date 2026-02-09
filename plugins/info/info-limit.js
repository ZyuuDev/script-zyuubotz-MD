import { checkUser } from "../../lib/checkUser.js";

let handler = async (m, { conn, senderKey }) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : senderKey;
  else who = senderKey;

  const quotedKey = await checkUser(conn, who);

  const user = global.db.data.users[quotedKey];
  if (typeof user == "undefined")
    return m.reply("Pengguna Tidak Ada Didalam Database");

  const devs = global.config.owner
    .filter(([_, __, isDeveloper]) => isDeveloper)
    .map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net");
  const nonDevs = global.config.owner
    .filter(([_, __, isDeveloper]) => !isDeveloper)
    .map(([num]) => num.replace(/\D/g, "") + "@s.whatsapp.net");
  const jadibotOwner = Object.values(global.db.data.bots.jadibot).map(
    (v) => v.owner.replace(/[^0-9]/g, "") + "@s.whatsapp.net",
  );

  const isMods = devs.includes(quotedKey);
  const isOwner =
    this?.__isSubBot ||
    m.fromMe ||
    isMods ||
    nonDevs.includes(quotedKey) ||
    jadibotOwner.includes(quotedKey);

  const isPrems =
    isOwner ||
    Date.now() <
      (global.db.data.users[quotedKey] || { premiumTime: 0 }).premiumTime;

  m.reply(
    `
╭─「 👤 *USER STATUS* 」
│ ▸ Username: ${user.registered ? user.name : await conn.getName(quotedKey)}
│ ▸ Status : ${isMods ? "Developer" : isOwner ? "Owner" : isPrems ? "Premium User" : user.level > 999 ? "Elite User" : "Free User"}
│ ▸ Limit : ${isPrems ? "Unlimited" : user.limit} / 1000
│ ▸ Daily Cmd : ${isPrems ? "Unlimited" : user.commandLimit - user.command} / ${user.commandLimit}
│ ▸ Total Cmd : ${user.command + user.commandTotal}
╰──────────────────╯
`.trim(),
  );
};
handler.help = ["limit"];
handler.tags = ["xp"];
handler.command = /^(limit)$/i;
export default handler;
