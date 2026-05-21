import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  whatsappNumber: { type: String, default: '201000000000' },
  telegramUsername: { type: String, default: 'username' },
  vodafoneNumber: { type: String, default: '01000000000' },
  instaPayAccount: { type: String, default: 'killuadology@instapay' },
}, { timestamps: true });

// Singleton: only one settings doc exists
settingsSchema.statics.getOrCreate = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
