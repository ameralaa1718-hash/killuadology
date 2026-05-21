import Settings from '../models/Settings.js';

// @desc    Get platform settings
// @route   GET /api/settings OR GET /api/admin/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getOrCreate();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getOrCreate();

    if (req.body.whatsappNumber !== undefined) settings.whatsappNumber = req.body.whatsappNumber;
    if (req.body.telegramUsername !== undefined) settings.telegramUsername = req.body.telegramUsername;
    if (req.body.vodafoneNumber !== undefined) settings.vodafoneNumber = req.body.vodafoneNumber;
    if (req.body.instaPayAccount !== undefined) settings.instaPayAccount = req.body.instaPayAccount;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
