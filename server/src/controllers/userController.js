import User from '../models/User.js';

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

export const updateProfile = async (req, res) => {
    const {
        name,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        specialization,
        experience,
        hospitalName,
        registrationNumber,
        bio,
    } = req.body;
 
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
        
        // Doctor specific updates
        if (specialization !== undefined) user.specialization = specialization;
        if (experience !== undefined) user.experience = experience;
        if (hospitalName !== undefined) user.hospitalName = hospitalName;
        if (registrationNumber !== undefined) user.registrationNumber = registrationNumber;
        if (bio !== undefined) user.bio = bio;
 
        if (user.role === 'doctor') {
            if (user.phone && user.specialization && user.registrationNumber) {
                user.isProfileComplete = true;
            }
        } else {
            if (user.phone && user.dateOfBirth && user.gender) {
                user.isProfileComplete = true;
            }
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
                isProfileComplete: user.isProfileComplete,
                specialization: user.specialization,
                experience: user.experience,
                hospitalName: user.hospitalName,
                registrationNumber: user.registrationNumber,
                bio: user.bio,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
};
