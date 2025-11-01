export const handleSquirrelEvent = () => {
  if (process.platform !== "win32") {
    return false;
  }

  const squirrelCommand = process.argv[1];

  if (
    squirrelCommand &&
    (squirrelCommand.includes("--squirrel-install") ||
      squirrelCommand.includes("--squirrel-updated") ||
      squirrelCommand.includes("--squirrel-uninstall") ||
      squirrelCommand.includes("--squirrel-obsolete") ||
      squirrelCommand.includes("--createShortcut") ||
      squirrelCommand.includes("--removeShortcut"))
  ) {
    return true;
  }

  return false;
};
