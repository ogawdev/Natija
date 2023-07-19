"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
});
const User = mongoose.model("users", userSchema);
exports.default = User;
