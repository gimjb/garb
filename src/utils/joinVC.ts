import { inspect } from 'util'
import type discord from 'discord.js'
import log from '@gimjb/log'
import * as voice from '@discordjs/voice'

const player = voice.createAudioPlayer({
  behaviors: {
    noSubscriber: voice.NoSubscriberBehavior.Play
  }
})

function play (): void {
  player.play(voice.createAudioResource('https://s2.radio.co/s322c133da/listen'))
}

player.on('error', error => { void log.error(error) })
player.on('stateChange', (oldState, newState) => {
  void log.info(`Audio player transitioned from ${oldState.status} to ${newState.status}.`)

  if (newState.status === voice.AudioPlayerStatus.Idle) {
    // We lost our connection; attempt to reconnect once every five seconds.
    setTimeout(play, 5000)
  }
})

play()

export default function joinVC (
  channelId: string,
  guildId: string,
  adapterCreator: discord.InternalDiscordGatewayAdapterCreator
): voice.VoiceConnection {
  const connection = voice.joinVoiceChannel({ channelId, guildId, adapterCreator })

  connection.subscribe(player)

  connection.on(voice.VoiceConnectionStatus.Disconnected, () => {
    try {
      void log.warn(
        `Disconnected from voice channel (guildId: ${guildId}, channelId: ${channelId}). Attempting to reconnect...`
      )
      connection.destroy(true)
      joinVC(channelId, guildId, adapterCreator)
    } catch (error) {
      void log.error(`Failed to reconnect (guildId: ${guildId}, channelId: ${channelId}). Error: ${inspect(error)}`)
    }
  })

  return connection
}
