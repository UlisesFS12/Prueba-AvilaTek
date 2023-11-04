"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUser = exports.findOne = exports.SingIn = exports.checkActiveUsers = exports.SearchUser = exports.createOne = void 0;
const User_model_1 = __importDefault(require("./User_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function createOne(id, active, First_name, Last_name, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = new User_model_1.default({
            _id: id,
            active: active,
            firstName: First_name,
            lastName: Last_name,
            email: email,
            password: password,
        });
        yield user.save();
        return user;
    });
}
exports.createOne = createOne;
function SearchUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_model_1.default.findOne({ email: email, password: password });
        if (user) {
            return user;
        }
        else {
            ("Usuario no existe");
            return null;
        }
    });
}
exports.SearchUser = SearchUser;
function checkActiveUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const activeUsers = yield User_model_1.default.find({ active: true });
        if (activeUsers.length > 0) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.checkActiveUsers = checkActiveUsers;
function SingIn(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const status = yield checkActiveUsers();
        const user = yield SearchUser(email, password);
        if (user == null) {
            return null;
        }
        else {
            if (status == false) {
                user.active = true;
                yield user.save();
                return user;
            }
            else {
                ("Ya hay otro usuario iniciado");
            }
        }
    });
}
exports.SingIn = SingIn;
function findOne(id, active) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_model_1.default.findOne({ _id: id, active: active });
        return user;
    });
}
exports.findOne = findOne;
function currentUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!token)
            return null;
        const payload = jsonwebtoken_1.default.decode(token);
        const user = yield User_model_1.default.findOne({ _id: payload.id, active: true });
        if (user) {
            yield user.save();
            return { user };
        }
        else {
            return null;
        }
    });
}
exports.currentUser = currentUser;
