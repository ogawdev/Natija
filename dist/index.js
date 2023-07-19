"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const data_validation_1 = require("./vaidations/data-validation");
const userSchema_1 = __importDefault(require("./models/userSchema"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const path = __importStar(require("path"));
// @ts-ignore
const xl = __importStar(require("excel4node"));
const app = (0, express_1.default)();
// Settings
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Database
if (config_1.config.mongoUrl != null) {
    const ConnectOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
    };
    // @ts-ignore
    mongoose_1.default
        .connect(config_1.config.mongoUrl, ConnectOptions)
        .then(() => {
        console.log("Connected to MongoDB");
    })
        .catch((err) => {
        console.error("Error connecting to MongoDB:", err.message);
    });
}
// Routes
app.post("/api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone } = yield data_validation_1.dataValidation.validateAsync(req.body);
        const user = yield userSchema_1.default.create({
            name,
            phone,
        });
        res.status(200).json({
            ok: true,
            user,
        });
    }
    catch (e) {
        res.status(400).json({
            ok: false,
        });
    }
}));
// Telegram bot
const bot = new node_telegram_bot_api_1.default("6327062958:AAGKBH0qgWiBDXKubKd2xFEYRLxhW704iZ4", { polling: true });
bot.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let wb = new xl.Workbook();
        const ws = wb.addWorksheet('Sheet 1');
        ws.cell(1, 1).string('№');
        ws.cell(1, 2).string('FISh');
        ws.cell(1, 3).string('Telefon');
        const userList = yield userSchema_1.default.find(); // Assuming User.find() returns an array of user objects.
        for (let i = 0; i < userList.length; i++) {
            ws.cell(i + 2, 1).number(i + 1);
            ws.cell(i + 2, 2).string(`${userList[i].name}`);
            ws.cell(i + 2, 3).string(`${userList[i].phone}`);
        }
        ws.column(1).setWidth(5);
        ws.column(2).setWidth(40);
        ws.column(3).setWidth(30);
        // Save the Excel file to disk
        const filePath = path.join(__dirname, 'Excel.xlsx');
        wb.write(filePath, function (err, stats) {
            return __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    // @ts-ignore
                    yield bot.sendMessage(msg.from.id, 'Xatolik yuz berdi');
                }
                else {
                    // @ts-ignore
                    yield bot.sendDocument(msg.from.id, filePath);
                }
            });
        });
    }
    catch (e) {
        // @ts-ignore
        yield bot.sendMessage(msg.from.id, `Xatolik yuz berdi \n${e}`);
    }
}));
app.listen(config_1.config.port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${config_1.config.port}`);
});
