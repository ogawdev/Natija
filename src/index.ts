import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config/config";
import { dataValidation } from "./vaidations/data-validation";
import User  from "./models/userSchema";
import TelegramBot from "node-telegram-bot-api";
import * as path from 'path';
// @ts-ignore
import * as xl from 'excel4node';

const app: Express = express();

// Settings
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
if (config.mongoUrl != null) {
  const ConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  };
  // @ts-ignore
  mongoose
    .connect(config.mongoUrl, ConnectOptions)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err.message);
    });
}

// Routes
app.post("/api", async (req: Request, res: Response) => {
  try {
    const { name, phone } = await dataValidation.validateAsync(req.body);

    const user = await User.create({
        name,
        phone,
    });

    res.status(200).json({
        ok: true,
        user,
    });
  } catch (e) {
    res.status(400).json({
      ok: false,
    });
  }
});

// Telegram bot
const bot = new TelegramBot("6327062958:AAGKBH0qgWiBDXKubKd2xFEYRLxhW704iZ4", { polling: true });

bot.on('message', async (msg) => {
    try {
      let wb = new xl.Workbook();
      const ws = wb.addWorksheet('Sheet 1');

      ws.cell(1, 1).string('№');
      ws.cell(1, 2).string('FISh');
      ws.cell(1, 3).string('Telefon');

      const userList = await User.find(); // Assuming User.find() returns an array of user objects.

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
      wb.write(filePath, async function (err: any, stats: any) {
        if (err) {
          // @ts-ignore
          await bot.sendMessage(msg.from.id, 'Xatolik yuz berdi');
        } else {
          // @ts-ignore
          await bot.sendDocument(msg.from.id, filePath);
        }
      });
    } catch (e) {
      // @ts-ignore
      await bot.sendMessage(msg.from.id, `Xatolik yuz berdi \n${e}`);
    }
});

app.listen(config.port, (): void => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${config.port}`
  );
});
