import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  packagerConfig: {
    asar: false,
    name: "Integra",
    executableName: "Integra",
    icon: "./build/logo",
    prune: true,
    ignore: [
      /^\/src\//,
      /^\/\.git/,
      /^\/\.vscode/,
      /\.eslintrc/,
      /\.gitignore/,
      /README/,
      /\.md$/,
      /\.map$/,
      /\.d\.ts$/,
    ],
    extraResource: ["./build/logo.ico", "./public"],
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"],
      config: {
        name: "Integra-Win",
      },
    },
    // {
    //   name: "@electron-forge/maker-squirrel",
    //   platforms: ["win32"],
    //   config: {
    //     name: "SkartisanalWin",

    //     icon: path.resolve(__dirname, "build", "logo.ico"),
    //     setupIcon: path.resolve(__dirname, "build", "logo.ico"),
    //     loadingGif: path.resolve(__dirname, "build", "loading.gif"),

    //     setupExe: "SkartisanalInstaller.exe",
    //     setupMsi: "SkartisanalInstaller.msi",
    //     noMsi: false,
    //     allowToChangeInstallationDirectory: true,
    //     createDesktopShortcut: true,
    //     createStartMenuShortcut: true,
    //     skipUpdateIcon: false,
    //     description: "Skartisanal Application",
    //     version: "1.0.0",
    //   },
    // },
    // {
    //   name: "@electron-forge/maker-zip",
    //   platforms: ["darwin"],
    //   config: {
    //     name: "Skartisanal-Mac",
    //   },
    // },
    // {
    //   name: "@electron-forge/maker-deb",
    //   config: {
    //     options: {
    //       maintainer: "QuetraTech",
    //       homepage: "https://github.com/QuetraTechOrg/skartisanal",
    //       icon: "./build/logo.ico",
    //     },
    //   },
    // },
    // {
    //   name: "@electron-forge/maker-rpm",
    //   config: {
    //     options: {
    //       maintainer: "QuetraTech",
    //       homepage: "https://github.com/QuetraTechOrg/skartisanal",
    //       icon: "./build/logo.ico",
    //     },
    //   },
    // },
    // {
    //   name: "@electron-forge/maker-dmg",
    //   config: {
    //     name: "Skartisanal-Mac",
    //     icon: "./build/logo.ico",
    //   },
    // },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-vite",
      config: {
        build: [
          {
            entry: "electron/main.ts",
            config: "vite.main.config.ts",
          },
          {
            entry: "electron/preload.ts",
            config: "vite.preload.config.ts",
          },
        ],
        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.ts",
          },
        ],
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "Chamesss",
          name: "integra",
        },
      },
    },
  ],
};

export default config;
