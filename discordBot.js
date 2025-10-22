// === dependencies ===
// npm install discord.js axios dotenv

import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import { closeBrowser, initiateBrowser, scrapSchedule } from "./scrapper.js";
import { formatMessage } from "./messageFormatter.js";
dotenv.config();

// === CONFIGURATION ===
const TOKEN = process.env.DISCORD_TOKEN;        // Your bot token (in .env)
const CHANNEL_ID = process.env.CHANNEL_ID;      // Discord channel ID
const ENDPOINT = "https://api.github.com/repos/torvalds/linux"; // Replace with your endpoint

// === DISCORD CLIENT SETUP ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
// Run every 10 minutes
});

// === OPTIONAL: Periodic check every 10 minutes ===
async function periodicCheck(time) {
  try {
    // Ensure bot is ready before accessing channels
    if (!client.isReady()) return;

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      console.error("❌ Channel not found or bot has no access.");
      return;
    }

    const browser = await initiateBrowser();
    const currentFreeSlots = await scrapSchedule(browser);
    await closeBrowser(browser);

    await channel.send(`${formatMessage(currentFreeSlots, time)}`);

  } catch (error) {
    console.error("Periodic check failed:", error.message);
  }
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  console.log(message.content.length)
  // Check if the message starts with \badminton
  if (message.content.startsWith("\\badminton")) {
    // Split message into command + args
      await message.channel.send(`🏸 Sprawdzam...`);

    const args = message.content.trim().split(/\s+/); // split by whitespace
    const command = args[1]; // removes the command itself

    await periodicCheck(toMinutes(command) || 17 * 60);
    // args[0] will be the first parameter
    const param = args[0];

    // Example response using the parameter
  }
});

const toMinutes = (timeString) => {
  console.log(timeString)
  const [ hours, minutes ] = timeString.split(':');
  console.log((+hours * 60) + (+minutes))
  return (+hours * 60) + (+minutes)
}

// === LOGIN ===
client.login(TOKEN);