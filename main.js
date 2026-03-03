const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const SAVE_FILE_NAME = "WorkTrackSave.txt";
const SAVE_FILE_PATH = path.join(app.getPath("userData"), SAVE_FILE_NAME);

ipcMain.on("close", async (event, args = []) => {
  try {
    const [arg0 = "", arg1 = "", arg2 = ""] = args;
    const today = getTodayDate();

    let fileContent = "";

    if (fs.existsSync(SAVE_FILE_PATH)) {
      fileContent = fs.readFileSync(SAVE_FILE_PATH, { encoding: "utf8" });
    }

    const lines = fileContent ? fileContent.split("\n").filter(Boolean) : [];

    // Remove the last entry if it's from today
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const [lastDate] = lastLine.split(":");

      if (lastDate === today) {
        lines.pop();
      }
    }

    lines.push(`${today}:${String(arg0)}:${String(arg1)}:${String(arg2)}`);

    fs.writeFileSync(SAVE_FILE_PATH, lines.join("\n") + "\n", "utf8");
  } catch (error) {
    console.error("Error while saving work track data:", error);
  } finally {
    app.quit();
  }
});

app.whenReady().then(createWindow);

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 130,
    resizable: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setAlwaysOnTop(true, "screen");
  win.loadFile("src/index.html");
}

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `${mm}/${dd}/${yyyy}`;
}