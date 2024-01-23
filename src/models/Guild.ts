import mongoose from 'mongoose'

export interface IGuild {
  /** The guild's Discord ID. */
  guildId: string
  /** The ID of the joined voice channel. */
  channelId: string
}

const guildSchema = new mongoose.Schema<IGuild>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true }
})

/** A Discord guild and its joined voice channel. */
export default mongoose.model('Guild', guildSchema)
