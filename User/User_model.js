"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    First_name: {
        type: String,
        required: [true, "Es necesario ingresar un primer nombre al ususario"],
    },
    Last_name: {
        type: String,
        required: [true, "Es necesario ingresar un apellido al usuario"],
    },
    email: {
        type: String,
        required: [true, "Es necesario ingresar un email al usuario"],
    },
    password: {
        type: String,
        required: [true, "Es necesario ingresar una contraseña al usuario"],
    },
    active: {
        type: Boolean,
        default: true,
    },
});
const UserModel = mongoose_2.default.model("UserI", userSchema);
exports.default = UserModel;
