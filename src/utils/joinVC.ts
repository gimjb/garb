import type discord from 'discord.js'
import log from '@gimjb/log'
import * as voice from '@discordjs/voice'
import guildsController from '../controllers/guilds'

const player = voice.createAudioPlayer({
  behaviors: {
    noSubscriber: voice.NoSubscriberBehavior.Pause
  }
})

player.on('error', error => { void log.error(error) })
player.on('stateChange', (oldState, newState) => {
  void log.info(`Audio player transitioned from ${oldState.status} to ${newState.status}.`)
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
