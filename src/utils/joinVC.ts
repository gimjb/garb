import type discord from 'discord.js'
import * as voice from '@discordjs/voice'
import guildsController from '../controllers/guilds'

const player = voice.createAudioPlayer({
  behaviors: {
    noSubscriber: voice.NoSubscriberBehavior.Pause
  }
})

const resource = voice.createAudioResource('https://s2.radio.co/s322c133da/listen')
player.play(resource)

export default function joinVC (
  channelId: string,
  guildId: string,
  adapterCreator: discord.InternalDiscordGatewayAdapterCreator
): voice.VoiceConnection {
  const connection = voice.joinVoiceChannel({ channelId, guildId, adapterCreator })

  connection.subscribe(player)

  connection.on(voice.VoiceConnectionStatus.Disconnected, () => {
    try { connection.destroy() } catch (error) {}

    void guildsController.remove(guildId ?? '')
  })

  return connection
}
