const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
});

const User = mongoose.model("users", userSchema);

export default User;