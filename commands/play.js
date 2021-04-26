const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");
const yts = require("yt-search");
const fs = require("fs");
const sendError = require("../util/error");

module.exports = {
    info: {
        name: "play",
        description: "Para reproducir canciones: D",
        usage: "<Youtube_Live_URL>",
        aliases: ["p"],
    },

    run: async function (client, message, args) {
        let channel = message.member.voice.channel;
        if (!channel) return sendError("Lo siento, pero debes estar en un canal de voz para reproducir música.", message.channel);

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT")) return sendError("No puedo conectarme a tu canal de voz, ¡asegúrate de tener los permisos adecuados!", message.channel);
        if (!permissions.has("SPEAK")) return sendError("No puedo hablar en este canal de voz, ¡asegúrese de tener los permisos adecuados!", message.channel);

        var searchString = args.join(" ");
        if (!searchString) return sendError("¡No proporcionaste una canción para tocar!", message.channel);
        const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
        var serverQueue = message.client.queue.get(message.guild.id);

        let songInfo = null;
        let song = null;
        if (url.match(/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi)) {
            try {
                songInfo = await ytdl.getInfo(url);
                if (!songInfo) return sendError("Parece que no pude encontrar la canción en YouTube.", message.channel);
                song = {
                    id: songInfo.videoDetails.videoId,
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    img: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
                    duration: songInfo.videoDetails.lengthSeconds,
                    ago: songInfo.videoDetails.publishDate,
                    views: String(songInfo.videoDetails.viewCount).padStart(10, " "),
                    req: message.author,
                };
            } catch (error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            }
        } else {
            try {
                var searched = await yts.search(searchString);
                if (searched.videos.length === 0) return sendError("Parece que no pude encontrar la canción en YouTube.", message.channel);

                songInfo = searched.videos[0];
                song = {
                    id: songInfo.videoId,
                    title: Util.escapeMarkdown(songInfo.title),
                    views: String(songInfo.views).padStart(10, " "),
                    url: songInfo.url,
                    ago: songInfo.ago,
                    img: songInfo.image,
                    req: message.author,
                };
            } catch (error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            let thing = new MessageEmbed()
                .setAuthor("La canción se ha añadido a la cola.", "https://raw.githubusercontent.com/navaneethkm004/my-images/main/giphy.gif")
                .setThumbnail(song.img)
                .setColor("#fffdd0")
                .addField("Nombre", song.title, true)
                .addField("Duracion", song.duration, true)
                .addField("Pedida por", song.req.tag, true)
                .setFooter(`Visitas: ${song.views} | ${song.ago}`);
            return message.channel.send(thing);
        }

        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel: channel,
            connection: null,
            songs: [],
            volume: 80,
            playing: true,
            loop: true,
        };
        message.client.queue.set(message.guild.id, queueConstruct);
        queueConstruct.songs.push(song);

        const play = async (song) => {
            const queue = message.client.queue.get(message.guild.id);
            if (!song) {
                sendError(
                    "Jmmmm!",
                    message.channel
                );
                message.client.queue.delete(message.guild.id);
                return;
            }
            let stream = null;
            if (song.url.includes("youtube.com")) {
                stream = await ytdl(song.url);
                stream.on("error", function (er) {
                    if (er) {
                        if (queue) {
                            queue.songs.shift();
                            play(queue.songs[0]);
                            return sendError(`Ha ocurrido un error inesperado.\nTipo posible \`${er}\``, message.channel);
                        }
                    }
                });
            }
            queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

            const dispatcher = queue.connection.play(ytdl(song.url, { quality: "highestaudio", highWaterMark: 1 << 25, type: "opus" })).on("finish", () => {
                const shiffed = queue.songs.shift();
                if (queue.loop === true) {
                    queue.songs.push(shiffed);
                }
                play(queue.songs[0]);
            });

            dispatcher.setVolumeLogarithmic(queue.volume / 100);
            let thing = new MessageEmbed()
                .setAuthor("¡Comenzó a reproducir música!", "https://raw.githubusercontent.com/navaneethkm004/my-images/main/giphy.gif")
                .setThumbnail(song.img)
                .setColor("#fffdd0")
                .addField("Nombre", song.title, true)
                .addField("Duración", song.duration, true)
                .addField("Pedida por", song.req.tag, true)
                .setFooter(`Visitas: ${song.views} | ${song.ago}`);
            queue.textChannel.send(thing);
        };

        try {
            const connection = await channel.join();
            queueConstruct.connection = connection;
            play(queueConstruct.songs[0]);
        } catch (error) {
            console.error(`No pude unirme al canal de voz: ${error}`);
            message.client.queue.delete(message.guild.id);
            await channel.leave();
            return sendError(`No pude unirme al canal de voz: ${error}`, message.channel);
        }
    },
};
