using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: AssemblyTitle("Zero-to-Code Systems Lab")]
[assembly: AssemblyDescription("100% Offline First-Principles Computer Science, Touch-Typing, and Coding Trainer")]
[assembly: AssemblyCompany("Nahian Akhtar")]
[assembly: AssemblyProduct("Zero-to-Code Systems Lab")]
[assembly: AssemblyCopyright("Copyright (c) 2026 Nahian Akhtar. MIT License.")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace ZeroToCodeLab
{
    internal static class NativeMethods
    {
        [DllImport("user32.dll")]
        internal static extern bool SetProcessDpiAwarenessContext(IntPtr dpiFlag);

        [DllImport("user32.dll")]
        internal static extern bool SetProcessDPIAware();

        [DllImport("dwmapi.dll")]
        internal static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);
    }

    public sealed class LabWindow : Form
    {
        private const string VirtualHost = "app.zerotocode.local";
        private readonly WebView2 webView = new WebView2();
        private readonly string appDir;
        private readonly string webDir;
        private readonly string userDataDir;
        private readonly bool isPortable;

        public LabWindow()
        {
            appDir = AppDomain.CurrentDomain.BaseDirectory;
            webDir = Directory.Exists(Path.Combine(appDir, "web"))
                ? Path.Combine(appDir, "web")
                : appDir;

            isPortable = File.Exists(Path.Combine(appDir, "portable.mode"));
            userDataDir = isPortable
                ? Path.Combine(appDir, "portable-data", "webview2-profile")
                : Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "ZeroToCodeLab",
                    "webview2-profile");

            Text = isPortable
                ? "Zero-to-Code Systems Lab (Portable Offline Edition)"
                : "Zero-to-Code Systems Lab";

            StartPosition = FormStartPosition.CenterScreen;
            MinimumSize = new Size(920, 640);
            Rectangle workArea = Screen.PrimaryScreen != null
                ? Screen.PrimaryScreen.WorkingArea
                : new Rectangle(0, 0, 1360, 860);
            Width = Math.Min(1380, Math.Max(1040, workArea.Width - 60));
            Height = Math.Min(900, Math.Max(700, workArea.Height - 50));
            BackColor = Color.FromArgb(11, 15, 23);

            try
            {
                Icon exeIcon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
                if (exeIcon != null)
                {
                    Icon = exeIcon;
                }
            }
            catch (Exception)
            {
            }

            webView.Dock = DockStyle.Fill;
            webView.DefaultBackgroundColor = Color.FromArgb(11, 15, 23);
            Controls.Add(webView);

            Shown += OnWindowShown;
            FormClosing += OnWindowClosing;
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            ApplyDarkTitleBar(true);
        }

        private void ApplyDarkTitleBar(bool dark)
        {
            try
            {
                int flag = dark ? 1 : 0;
                if (NativeMethods.DwmSetWindowAttribute(Handle, 20, ref flag, sizeof(int)) != 0)
                {
                    NativeMethods.DwmSetWindowAttribute(Handle, 19, ref flag, sizeof(int));
                }
            }
            catch (Exception)
            {
            }
        }

        private async void OnWindowShown(object sender, EventArgs e)
        {
            try
            {
                Directory.CreateDirectory(userDataDir);
                CoreWebView2EnvironmentOptions opts = new CoreWebView2EnvironmentOptions("--disable-background-networking");
                CoreWebView2Environment env = await CoreWebView2Environment.CreateAsync(null, userDataDir, opts);
                await webView.EnsureCoreWebView2Async(env);

                CoreWebView2 core = webView.CoreWebView2;
                core.Settings.AreDevToolsEnabled = false;
                core.Settings.AreDefaultContextMenusEnabled = true;
                core.Settings.IsStatusBarEnabled = false;
                core.Settings.IsZoomControlEnabled = true;

                // Enforce strict 100% air-gapped local isolation at engine boundary
                core.SetVirtualHostNameToFolderMapping(
                    VirtualHost,
                    webDir,
                    CoreWebView2HostResourceAccessKind.Allow);

                core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
                core.WebResourceRequested += delegate(object s, CoreWebView2WebResourceRequestedEventArgs args)
                {
                    Uri uri;
                    if (!Uri.TryCreate(args.Request.Uri, UriKind.Absolute, out uri))
                    {
                        args.Response = core.Environment.CreateWebResourceResponse(Stream.Null, 403, "Offline Blocked", "");
                        return;
                    }
                    bool allowed =
                        String.Equals(uri.Host, VirtualHost, StringComparison.OrdinalIgnoreCase) ||
                        String.Equals(uri.Scheme, "blob", StringComparison.OrdinalIgnoreCase) ||
                        String.Equals(uri.Scheme, "data", StringComparison.OrdinalIgnoreCase);

                    if (!allowed)
                    {
                        args.Response = core.Environment.CreateWebResourceResponse(Stream.Null, 403, "Offline Blocked", "");
                    }
                };

                core.NewWindowRequested += delegate(object s, CoreWebView2NewWindowRequestedEventArgs args)
                {
                    args.Handled = true;
                };

                core.Navigate("https://" + VirtualHost + "/index.html");
                webView.Focus();
            }
            catch (Exception ex)
            {
                string fallbackHtml = Path.Combine(webDir, "index.html");
                DialogResult res = MessageBox.Show(
                    "Microsoft Edge WebView2 Runtime was not detected (" + ex.Message + ").\n\n" +
                    "Open the 100% offline trainer directly in your default web browser instead?",
                    "Zero-to-Code Systems Lab",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information);

                if (res == DialogResult.Yes && File.Exists(fallbackHtml))
                {
                    Process.Start(new ProcessStartInfo(fallbackHtml) { UseShellExecute = true });
                }
                Close();
            }
        }

        private void OnWindowClosing(object sender, FormClosingEventArgs e)
        {
            try
            {
                webView.Dispose();
            }
            catch (Exception)
            {
            }
        }

        [STAThread]
        public static int Main(string[] args)
        {
            bool createdNew;
            using (Mutex singleInstance = new Mutex(true, @"Local\ZeroToCodeSystemsLab_v1", out createdNew))
            {
                try
                {
                    NativeMethods.SetProcessDpiAwarenessContext(new IntPtr(-4));
                }
                catch (Exception)
                {
                    try { NativeMethods.SetProcessDPIAware(); } catch (Exception) { }
                }

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                // Headless smoke-test flag for automated build verification
                if (args != null && args.Length > 0 && args[0] == "--self-check")
                {
                    string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                    string indexCheck = File.Exists(Path.Combine(baseDir, "web", "index.html"))
                        ? Path.Combine(baseDir, "web", "index.html")
                        : Path.Combine(baseDir, "index.html");
                    return File.Exists(indexCheck) ? 0 : 2;
                }

                Application.Run(new LabWindow());
                return 0;
            }
        }
    }
}
