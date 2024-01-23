import type ApplicationCommand from './ApplicationCommand'

const command: ApplicationCommand = {
  meta: {
    name: 'terms',
    description: 'Get a link to the terms of service.',
    options: []
  },
  execute: async interaction => {
    await interaction.reply({
      content: 'You can read the terms of service at https://github.com/gimjb/garb/blob/master/docs/terms.md',
      ephemeral: true
    })
  }
}

export default command
