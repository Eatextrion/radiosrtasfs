const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error")

module.exports = {
  info: {
    name: "nowplaying",
    description: "Para mostrar la música que se está reproduciendo actualmente en este servidor",
    usage: "",
    aliases: ["np"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return sendError("No hay nada reproduciendo en este servidor..", message.channel);
    let song = serverQueue.songs[0]
    let thing = new MessageEmbed()
      .setAuthor("Reproduciendo ahora!", "https://raw.githubusercontent.com/navaneethkm004/my-images/main/giphy.gif")
      .setThumbnail(song.img)
      .setColor("#fffdd0")
      .addField("Nombre", song.title, true)
      .addField("Duracion", song.duration, true)
      .addField("Pedido por", song.req.tag, true)
      .setFooter(`Visitas: ${song.views} | ${song.ago}`)
    return message.channel.send(thing)
  },
};
