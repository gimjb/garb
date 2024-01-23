import type { ApplicationCommandOption, CommandInteraction } from 'discord.js'

/** Metadata of an application command. */
export interface CommandMetadata {
  name: string
  description: string
  options: ApplicationCommandOption[]
}

/** A function to represent the logic of an application command. */
export type CommandLogic = (interaction: CommandInteraction) => Promise<any>

/** A function to be called once all commands have been registered. */
export type CommandOnLoad = (commands: CommandMetadata[]) => void

/** An application command. */
export default interface ApplicationCommand {
  /** The metadata of the application command. */
  meta: CommandMetadata
  /** The logic of the application command. */
  execute: CommandLogic
  /** A function to be called once all commands have been registered. */
  onLoad?: CommandOnLoad
}
