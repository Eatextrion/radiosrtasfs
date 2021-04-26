const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "volume",
    description: "Para cambiar el volumen de la canción del servidor",
    usage: "[volume]",
    aliases: ["v", "vol"],
  },

  run: async function(client, message, args) {
    const channel = message.member.voice.channel;
    if (!channel) return sendError("Lo siento, pero debes estar en un canal de voz para reproducir música.", message.channel);
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return sendError("No hay nada reproduciendo en este servidor.", message.channel);
    if (!serverQueue.connection) return sendError("No hay nada reproduciendo en este servidor.", message.channel);
    if (!args[0]) return message.channel.send(`El volumen actual es: **${serverQueue.volume}**`);
    if (isNaN(args[0])) return message.channel.send(':notes: ¡Solo numeros!').catch(err => console.log(err));
    if (parseInt(args[0]) > 150 || (args[0]) < 0) return sendError('No puede ajustar el volumen a más de 150 o menos de 0', message.channel).catch(err => console.log(err));
    serverQueue.volume = args[0];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);
    let xd = new MessageEmbed()
      .setDescription(`Puse el volumen a: **${args[0] / 1}/100**`)
      .setAuthor("Administrador de volumen del servidor", "https://github.com/navaneethkm004/my-images/blob/main/giphy.gif?raw=true")
      .setColor("#fffdd0")
    return message.channel.send(xd);
  },
};
