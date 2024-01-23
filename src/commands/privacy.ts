import type ApplicationCommand from './ApplicationCommand'

const command: ApplicationCommand = {
  meta: {
    name: 'privacy',
    description: 'Get a link to the privacy policy.',
    options: []
  },
  execute: async interaction => {
    await interaction.reply({
      content: 'You can read the privacy policy at https://github.com/gimjb/garb/blob/master/docs/privacy.md',
      ephemeral: true
    })
  }
}

export default command
