import discord from 'discord.js'
import type ApplicationCommand from './ApplicationCommand'
import joinVC from '../utils/joinVC'
import guildsController from '../controllers/guilds'

const command: ApplicationCommand = {
  meta: {
    name: 'join',
    description: 'Join a voice channel.',
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

    // Only GuildMember has the voice property.
    if (!(interaction.member instanceof discord.GuildMember)) return

    const voiceState = interaction.member.voice

    if (voiceState.channelId === null) {
      await interaction.reply({
        content: 'You must be in a voice channel to use this command. If you are already in a voice channel, please rejoin it — and make sure I have the “View Channel” and “Connect” permissions.',
        ephemeral: true
      })

      return
    }

    joinVC(voiceState.channelId, voiceState.guild.id, voiceState.guild.voiceAdapterCreator)
    void interaction.reply({
      content: 'Joined the voice channel.',
      ephemeral: true
    })
    await guildsController.update({
      guildId: voiceState.guild.id,
      channelId: voiceState.channelId
    })
  }
}

export default command
