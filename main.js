const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");

const SAVE_FILE_NAME = "WorkTrackSave.txt";

ipcMain.on("close", (event, args) => {
  try {
    const today = getTodayDate();
    let fileContent;

    try {
      fileContent = fs.readFileSync(SAVE_FILE_NAME, {
        encoding: "utf8",
        flag: "r",
      });
    } catch (readError) {
      // If the file does not exist yet, we'll create it when appending below.
      fileContent = null;
    }

    if (fileContent) {
      const lines = fileContent.split("\n");
      const lastDataLine = lines[lines.length - 2];

      if (lastDataLine) {
        const lastDate = lastDataLine.split(":")[0];

        if (today === lastDate) {
          const updatedContent = lines
            .splice(lines.length - 2, 0)
            .join("\n");
          fs.writeFileSync(SAVE_FILE_NAME, updatedContent, "utf-8");
        }
      }
    }

    const entry =
      today +
      ":" +
      String(args[0]) +
      ":" +
      String(args[1]) +
      ":" +
      String(args[2]) +
      "\n";

    fs.appendFileSync(SAVE_FILE_NAME, entry);
  } catch (error) {
    console.log(error);
  }

  app.quit();
});

app.whenReady().then(createWindow);

function createWindow() {
  const window = new BrowserWindow({
    width: 300,
    height: 130,
    resizable: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
    transparent: true,
  });

  window.setAlwaysOnTop(true, "screen");
  window.loadFile("src/index.html");
}

function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  return mm + "/" + dd + "/" + yyyy;
}