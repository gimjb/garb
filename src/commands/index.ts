import fs from 'fs'
import discord from 'discord.js'
import log from '@gimjb/log'
import type {
  CommandLogic,
  CommandMetadata,
  CommandOnLoad
} from './ApplicationCommand'

const commandsMetadata: CommandMetadata[] = []
const commandsLogic: Record<string, CommandLogic> = {}
const commandsOnLoad: CommandOnLoad[] = []

const files = fs.readdirSync(__dirname)

async function loadCommandsFromFiles (): Promise<void> {
  for (const file of files) {
    if (
      !file.endsWith('.js') ||
      file === 'index.js' ||
      file === 'ApplicationCommand.js'
    ) {
      continue
    }

    const command = require(`./${file}`).default

    commandsMetadata.push(command.meta)
    commandsLogic[command.meta.name] = command.execute
    if (typeof command.onLoad === 'function') {
      commandsOnLoad.push(command.onLoad)
    }
  }
}

loadCommandsFromFiles().catch(log.error)

/** All application commands. */
export default {
  /** Metadata of all application commands. */
  metadata: commandsMetadata,
  /** Logic of all application commands. */
  logic: commandsLogic,
  /** Register all application commands to Discord. */
  register: async (client: discord.Client<true>) => {
    const rest = new discord.REST({ version: '10' }).setToken(client.token)

    await rest.put(discord.Routes.applicationCommands(client.user.id), {
      body: commandsMetadata
    })

    for (const onLoad of commandsOnLoad) {
      onLoad(commandsMetadata)
    }
  },
  /** Handle any command interaction. */
  handle: async (interaction: discord.CommandInteraction) => {
    const command = commandsLogic[interaction.commandName]

    if (typeof command === 'undefined') return

    try {
      await command(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({
        content: ':x: Sorry, an unexpected error occurred. Please try again.',
        ephemeral: true
      })
    }
  }
} as const
