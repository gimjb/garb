import * as voice from '@discordjs/voice'
import type ApplicationCommand from './ApplicationCommand'
import guildsController from '../controllers/guilds'

const command: ApplicationCommand = {
  meta: {
    name: 'leave',
    description: 'Leave a voice channel.',
    options: []
  },
  async execute (interaction) {
    const perms = interaction.memberPermissions

    if (perms === null || (!perms.has('ManageGuild') && !perms.has('ManageChannels'))) {
      await interaction.reply({
        content: 'You must have the Manage Guild or Manage Channels permissions to use this command.',
        ephemeral: true
      })

      return
    }

    const connection = voice.getVoiceConnection(interaction.guildId ?? '')

    if (typeof connection === 'undefined') {
      await interaction.reply({
        content: 'I am not in a voice channel.',
        ephemeral: true
      })

      return
    }

    connection.destroy(true)

    await interaction.reply({
      content: 'Left the voice channel.',
      ephemeral: true
    })

    void guildsController.remove(interaction.guildId ?? '')
  }
}

export default command
