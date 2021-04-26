const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
    info: {
        name: "join",
        aliases: ["come", "connect", "hey"],
        description: "Unase al canal de voz.",
        usage: "Join",
    },

    run: async function (client, message, args) {
        let channel = message.member.voice.channel;
        if (!channel) return sendError("Lo siento, pero debes estar en un canal de voz.", message.channel);

        try {
            const connection = await channel.join();
            queueConstruct.connection = connection;
            play(queueConstruct.songs[0]);
        } catch (error) {
            console.error(`No pude unirme al canal de voz: ${error}`);
        }

        const Embed = new MessageEmbed()
            .setAuthor("Se unió al canal de voz", "https://raw.githubusercontent.com/navaneethkm004/my-images/main/giphy.gif")
            .setColor("#fffdd0")
            .setTitle("Éxito")
            .setDescription("🎶 Me uní al canal de voz.")
            .setTimestamp();

        return message.channel.send(Embed).catch(() => message.channel.send("🎶 Me uní al canal de voz. :C"));
    },
};
