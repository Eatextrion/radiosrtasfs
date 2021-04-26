const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
    info: {
        name: "leave",
        aliases: ["goaway", "disconnect", "bye"],
        description: "Leave The Voice Channel!",
        usage: "Leave",
    },

    run: async function (client, message, args) {
        let channel = message.member.voice.channel;
        if (!channel) return sendError("Lo siento, pero debes estar en un canal de voz.", message.channel);
        if (!message.guild.me.voice.channel) return sendError("¡No estoy en ningún canal de voz!", message.channel);

        try {
            await message.guild.me.voice.channel.leave();
        } catch (error) {
            await message.guild.me.voice.kick(message.guild.me.id);
            return sendError("Intentando salir del canal de voz ...", message.channel);
        }

        const Embed = new MessageEmbed()
            .setAuthor("Salir del canal de voz", "https://raw.githubusercontent.com/navaneethkm004/my-images/main/giphy.gif")
            .setColor("#fffdd0")
            .setTitle("Success")
            .setDescription("🎶 Salió del canal de voz.")
            .setTimestamp();

        return message.channel.send(Embed).catch(() => message.channel.send("🎶 Salió del canal de voz :C"));
    },
};
