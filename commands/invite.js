const { MessageEmbed } = require("discord.js");

module.exports = {
  info: {
    name: "invite",
    description: "Para agregar / invitar al bot a tu servidor",
    usage: "[invite]",
    aliases: ["inv"],
  },

  run: async function (client, message, args) {
    
    var permissions = 37080128;
    
    let invite = new MessageEmbed()
    .setTitle(`Invita a ${client.user.username}`)
    .setDescription(`¿Me quieres en tu servidor? ¡Invítame hoy! \n\n [Invite Link](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=${permissions}&scope=bot)`)
    .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=${permissions}&scope=bot`)
    .setColor("#fffdd0")
    .setFooter("Invitame!!","https://raw.githubusercontent.com/navaneethkm004/my-images/main/giphy.gif")
    return message.channel.send(invite);
  },
};
