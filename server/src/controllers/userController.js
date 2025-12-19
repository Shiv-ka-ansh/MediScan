import User from '../models/User.js';

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get profile' });
    }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res) => {
    const { name, phone, dateOfBirth, gender, bloodGroup, address } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
        if (address !== undefined) user.address = address;

        // Simple check to mark profile as complete
        if (user.phone && user.dateOfBirth && user.gender) {
            user.isProfileComplete = true;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                address: user.address,
                isProfileComplete: user.isProfileComplete
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
};
