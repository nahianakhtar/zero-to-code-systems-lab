[CmdletBinding()]
param(
    [string]$WebView2LibDir = "",
    [string]$InnoCompiler = "",
    [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $RepoRoot "dist" }
[void][IO.Directory]::CreateDirectory($OutDir)

# 1. Locate .NET Framework x64 C# Compiler
$csc = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
    throw "csc.exe not found at $csc"
}

# 2. Download or reuse Microsoft.Web.WebView2 NuGet package if not explicitly supplied
if (-not $WebView2LibDir -or -not (Test-Path $WebView2LibDir)) {
    $pkgCache = Join-Path $OutDir "_webview2_pkg"
    if (-not (Test-Path (Join-Path $pkgCache "lib\net462\Microsoft.Web.WebView2.Core.dll"))) {
        [void][IO.Directory]::CreateDirectory($pkgCache)
        $nupkg = Join-Path $OutDir "_webview2.zip"
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2903.40" -OutFile $nupkg -UseBasicParsing
        Expand-Archive -LiteralPath $nupkg -DestinationPath $pkgCache -Force
        Remove-Item -LiteralPath $nupkg -Force -ErrorAction SilentlyContinue
    }
    $WebView2LibDir = $pkgCache
}

$coreDll = Join-Path $WebView2LibDir "lib\net462\Microsoft.Web.WebView2.Core.dll"
$formsDll = Join-Path $WebView2LibDir "lib\net462\Microsoft.Web.WebView2.WinForms.dll"
$loaderDll = Join-Path $WebView2LibDir "runtimes\win-x64\native\WebView2Loader.dll"

# 3. Assemble Installed Stage & Portable Stage
$installedStage = Join-Path $OutDir "installed-stage"
$portableStage = Join-Path $OutDir "ZeroToCode-Systems-Lab-Portable"

foreach ($dir in @($installedStage, $portableStage)) {
    if (Test-Path $dir) { Remove-Item -LiteralPath $dir -Recurse -Force }
    [void][IO.Directory]::CreateDirectory((Join-Path $dir "web\css"))
    [void][IO.Directory]::CreateDirectory((Join-Path $dir "web\js"))
}

$exeOut = Join-Path $installedStage "ZeroToCodeLab.exe"
$icoPath = Join-Path $PSScriptRoot "ZeroToCodeLab.ico"
if (-not (Test-Path -LiteralPath $icoPath)) {
    [IO.File]::WriteAllBytes($icoPath, [Convert]::FromBase64String("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"))
}
$csPath = Join-Path $PSScriptRoot "ZeroToCodeDesktop.cs"
$iconArg = if (Test-Path $icoPath) { "/win32icon:$icoPath" } else { $null }
if (-not (Test-Path $icoPath)) {
    # Remove SetupIconFile line from temporary iss copy if icon absent in minimal checkout
    $issClean = (Get-Content -LiteralPath (Join-Path $PSScriptRoot "ZeroToCode.iss") -Raw) -replace "(?m)^SetupIconFile=.*\r?\n", ""
    Set-Content -LiteralPath (Join-Path $OutDir "_ZeroToCode.noicon.iss") -Value $issClean -Encoding UTF8
}

$cscArgs = @("/nologo", "/utf8output", "/target:winexe", "/platform:x64", "/optimize+", "/debug-")
if ($iconArg) { $cscArgs += $iconArg }
$cscArgs += @(
    "/out:$exeOut",
    "/r:System.dll", "/r:System.Drawing.dll", "/r:System.Windows.Forms.dll",
    "/r:$coreDll", "/r:$formsDll",
    $csPath
)
& $csc @cscArgs

if ($LASTEXITCODE -ne 0) {
    throw "Compilation of ZeroToCodeLab.exe failed with exit code $LASTEXITCODE"
}

foreach ($stage in @($installedStage, $portableStage)) {
    if ($stage -ne $installedStage) {
        Copy-Item -LiteralPath $exeOut -Destination (Join-Path $stage "ZeroToCodeLab.exe") -Force
    }
    Copy-Item -LiteralPath $coreDll, $formsDll, $loaderDll -Destination $stage -Force
    Copy-Item -LiteralPath (Join-Path $RepoRoot "LICENSE") -Destination (Join-Path $stage "LICENSE.txt") -Force
    Copy-Item -LiteralPath (Join-Path $RepoRoot "README.md") -Destination (Join-Path $stage "README.md") -Force
    Copy-Item -LiteralPath (Join-Path $RepoRoot "index.html") -Destination (Join-Path $stage "web\index.html") -Force
    Copy-Item -LiteralPath (Join-Path $RepoRoot "css\styles.css") -Destination (Join-Path $stage "web\css\styles.css") -Force
    Get-ChildItem -LiteralPath (Join-Path $RepoRoot "js") -Filter "*.js" | Copy-Item -Destination (Join-Path $stage "web\js") -Force
}

# Mark Portable Edition so it keeps all WebView2 + localStorage data self-contained inside portable-data\
Set-Content -LiteralPath (Join-Path $portableStage "portable.mode") -Value "portable=1" -Encoding ASCII

# 4. Create Portable ZIP Archive
$portableZip = Join-Path $OutDir "ZeroToCode-Systems-Lab-Portable-win-x64.zip"
if (Test-Path $portableZip) { Remove-Item -LiteralPath $portableZip -Force }
Compress-Archive -Path $portableStage -DestinationPath $portableZip -CompressionLevel Optimal -Force

# 5. Compile Inno Setup x64 Installer if ISCC.exe is available
if (-not $InnoCompiler) {
    $candidates = @(
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 6\ISCC.exe",
        "${env:LOCALAPPDATA}\Programs\Inno Setup 6\ISCC.exe"
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path $c)) { $InnoCompiler = $c; break }
    }
}

if ($InnoCompiler -and (Test-Path $InnoCompiler)) {
    $issFile = if (Test-Path $icoPath) { Join-Path $PSScriptRoot "ZeroToCode.iss" } else { Join-Path $OutDir "_ZeroToCode.noicon.iss" }
    & $InnoCompiler /Qp "/DStagePath=$installedStage" "/DOutputDirPath=$OutDir" $issFile
    if ($LASTEXITCODE -ne 0) {
        throw "Inno Setup installer build failed with exit code $LASTEXITCODE"
    }
}

Write-Output "BUILD_COMPLETE: OutDir=$OutDir"
