import discord from 'discord.js'
import 'dotenv/config'
import log from '@gimjb/log'
import mongoose from 'mongoose'
import commands from './commands'
import config from './config'
import guildsController from './controllers/guilds'
import joinVC from './utils/joinVC'

mongoose
  .connect(process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/garb')
  .then(async () => {
    await log.info('Connected to MongoDB.')
  })
  .catch(async error => {
    await log.error(error)
    process.exit(1)
  })

const client = new discord.Client({
  intents: ['GuildVoiceStates'],
  presence: {
    activities: [
      {
        name: `/join | v${process.env['npm_package_version'] ?? '?.?.?'}`
      }
    ]
  }
})

client.on('error', message => { void log.error(message) })
client.on('warn', message => { void log.warn(message) })
client.on('shardError', async (error, shardId) => {
  await log.error(`Shard ${shardId} encountered an error:`)
  await log.error(error)
})

client.on('ready', async readyClient => {
  void log.info(`Logged in as ${readyClient.user?.tag ?? 'unknown'}.`)

  await commands.register(readyClient)

  for (const guild of await guildsController.getAll()) {
    readyClient.channels.fetch(guild.channelId).then(channel => {
      if (channel === null || !channel.isVoiceBased()) return

      joinVC(
        channel.id,
        channel.guildId,
        channel.guild.voiceAdapterCreator
      )
    }).catch(log.error)
  }
})

client.on('guildCreate', async guild => {
  const member = await guild.members.fetchMe()

  await member.setNickname(config.nickname)
})

client.on('shardDisconnect', async (closeEvent, shardId) => {
  void log.warn(`Shard ${shardId} disconnected with code ${closeEvent.code}.`)

  await client.shard?.respawnAll()
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  await commands.handle(interaction)
})

client.login(process.env['DISCORD_TOKEN']).catch(log.error)
