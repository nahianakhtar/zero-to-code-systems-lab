#ifndef StagePath
  #define StagePath "..\dist\installed-stage"
#endif
#ifndef OutputDirPath
  #define OutputDirPath "..\dist"
#endif

[Setup]
AppId={{8F4C2E91-52B7-4D3A-9C18-71E0A6B42D19}
AppName=Zero-to-Code Systems Lab
AppVersion=1.0.0
AppVerName=Zero-to-Code Systems Lab 1.0.0
AppPublisher=Nahian Akhtar
AppPublisherURL=https://github.com/nahianakhtar/zero-to-code-systems-lab
AppSupportURL=https://github.com/nahianakhtar/zero-to-code-systems-lab
AppUpdatesURL=https://github.com/nahianakhtar/zero-to-code-systems-lab/releases
AppComments=100% Offline First-Principles Computer Science, Touch-Typing, and Coding Trainer
VersionInfoProductName=Zero-to-Code Systems Lab
VersionInfoCompany=Nahian Akhtar
VersionInfoDescription=Zero-to-Code Systems Lab - Offline CS, Touch-Typing & Coding Trainer
VersionInfoVersion=1.0.0.0
DefaultDirName={localappdata}\Programs\ZeroToCodeLab
DefaultGroupName=Zero-to-Code Systems Lab
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\ZeroToCodeLab.exe
UninstallDisplayName=Zero-to-Code Systems Lab
OutputDir={#OutputDirPath}
OutputBaseFilename=ZeroToCode-Systems-Lab-Setup-x64
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
SetupIconFile=ZeroToCodeLab.ico
LicenseFile=..\LICENSE

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional shortcuts:"

[Files]
Source: "{#StagePath}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{userprograms}\Zero-to-Code Systems Lab"; Filename: "{app}\ZeroToCodeLab.exe"
Name: "{userdesktop}\Zero-to-Code Systems Lab"; Filename: "{app}\ZeroToCodeLab.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\ZeroToCodeLab.exe"; Description: "Launch Zero-to-Code Systems Lab"; Flags: postinstall nowait skipifsilent
