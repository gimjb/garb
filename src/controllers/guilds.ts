import Guild, { IGuild } from '../models/Guild'

/** Create a new guild. */
export async function create (data: IGuild): Promise<void> {
  await new Guild(data).save()
}

/** Get a guild's joined voice channel. */
export async function get (guildId: string): Promise<any> {
  return await Guild.findOne({ guildId })
}

export async function getAll (): Promise<any> {
  return await Guild.find()
}

export async function remove (guildId: string): Promise<void> {
  await Guild.deleteOne({ guildId })
}

/** Set a new voice channel for a guild. */
export async function update (data: IGuild): Promise<void> {
  const { guildId, channelId } = data

  let guild = await Guild.findOne({ guildId })
  if (guild === null) guild = new Guild({ guildId })

  guild.channelId = channelId
  await guild.save()
}

export default {
  create,
  get,
  getAll,
  remove,
  update
}
