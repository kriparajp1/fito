const userDb = require("../../models/usermodel");
const addressDatabase = require("../../models/addressModel");
const userPanel = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await userDb.findOne({ email: user });
    const addresses = await addressDatabase.find({ user: userData._id });

    res.render("user/userPanel", {
      userData,
      addresses,
      status: true,
      cartCount: res.locals.cartCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const user = req.session.user;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const userData = await userDb.findOne({ email: user });
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentPassword !== userData.password) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    userData.password = newPassword;
    await userData.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const addAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await userDb.findOne({ email: user });

    const newAddress = new addressDatabase({
      user: userData._id,
      name: req.body.name,
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      address: req.body.address,
      district: req.body.district,
      state: req.body.state,
      landmark: req.body.landmark,
    });

    await newAddress.save();
    res.status(200).json({ message: "Address added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to update an existing address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    await addressDatabase.findByIdAndUpdate(addressId, {
      name: req.body.name,
      mobile: req.body.mobile,
      pincode: req.body.pincode,
      address: req.body.address,
      district: req.body.district,
      state: req.body.state,
      landmark: req.body.landmark,
    });

    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  userPanel,
  updateUserProfile,
  addAddress,
  updateAddress,
};
