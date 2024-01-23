import discord from 'discord.js'
import 'dotenv/config'
import mongoose from 'mongoose'
import commands from './commands'
import config from './config'
import guildsController from './controllers/guilds'
import joinVC from './utils/joinVC'

mongoose
  .connect(process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/garb')
  .catch(error => {
    console.error(error)
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

client.on('ready', async readyClient => {
  await commands.register(readyClient)

  for (const guild of await guildsController.getAll()) {
    readyClient.channels.fetch(guild.channelId).then(channel => {
      if (channel === null || !channel.isVoiceBased()) return

      joinVC(
        channel.id,
        channel.guildId,
        channel.guild.voiceAdapterCreator
      )
    }).catch(console.error)
  }
})

client.on('guildCreate', async guild => {
  const member = await guild.members.fetchMe()

  await member.setNickname(config.nickname)
})

client.on('shardDisconnect', async (closeEvent, shardId) => {
  console.warn(`Shard ${shardId} disconnected with code ${closeEvent.code}.`)

  await client.shard?.respawnAll()
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  await commands.handle(interaction)
})

client.login(process.env['DISCORD_TOKEN']).catch(console.error)
