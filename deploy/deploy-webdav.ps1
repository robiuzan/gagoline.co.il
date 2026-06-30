<#
  Deploy the gagoline static export (out/) to the cPanel docroot over Web Disk (WebDAV).

  Credentials are read from the Sys Admin control-plane .env (never hardcoded):
    GAGOLINE_WEBDAV_URL, GAGOLINE_WEBDAV_USER, GAGOLINE_WEBDAV_PASS
    GAGOLINE_WEBDAV_REMOTE_BASE (optional) — subpath under the Web Disk root.

  Uses raw HttpWebRequest (PowerShell 5.1's Invoke-WebRequest -Method rejects WebDAV
  verbs like MKCOL) with preemptive HTTP Basic auth over TLS.

  SAFETY: a real run OVERWRITES files in the target. Back up first. Use -DryRun to preview.
#>
[CmdletBinding()]
param(
  [switch]$DryRun,
  [string]$EnvPath = "C:\Users\robiu\antigravity\Projects\Sys Admin\secrets\.env",
  [string]$OutDir = (Join-Path $PSScriptRoot "..\out"),
  [string]$RemoteBase = ""
)
$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvPath)) { throw ".env not found: $EnvPath" }
$cfg = @{}
Get-Content $EnvPath | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$') { $cfg[$matches[1]] = $matches[2].Trim() }
}
$baseUrl = $cfg['GAGOLINE_WEBDAV_URL']
$user = $cfg['GAGOLINE_WEBDAV_USER']
$pass = $cfg['GAGOLINE_WEBDAV_PASS']
if (-not $RemoteBase -and $cfg.ContainsKey('GAGOLINE_WEBDAV_REMOTE_BASE')) { $RemoteBase = $cfg['GAGOLINE_WEBDAV_REMOTE_BASE'] }
if (-not $baseUrl -or -not $user) { throw "Missing GAGOLINE_WEBDAV_URL / GAGOLINE_WEBDAV_USER in .env" }
$baseUrl = $baseUrl.TrimEnd('/') + '/'
$OutDir = (Resolve-Path $OutDir).Path

$files = @(Get-ChildItem -Path $OutDir -Recurse -File -Force)
$dirs = @(Get-ChildItem -Path $OutDir -Recurse -Directory -Force | Sort-Object { $_.FullName.Length })

function Get-RemoteUrl([string]$relPath) {
  $parts = New-Object System.Collections.Generic.List[string]
  if ($RemoteBase) { foreach ($p in $RemoteBase.Trim('/').Split('/')) { if ($p) { $parts.Add($p) } } }
  foreach ($p in ($relPath -replace '\\', '/').Split('/')) { if ($p) { $parts.Add([uri]::EscapeDataString($p)) } }
  return $baseUrl + ($parts -join '/')
}

$targetDesc = $baseUrl
if ($RemoteBase) { $targetDesc += $RemoteBase.Trim('/') + '/' }
Write-Host "Deploy plan:"
Write-Host "  Source : $OutDir"
Write-Host "  Target : $targetDesc"
Write-Host "  Dirs   : $($dirs.Count)"
Write-Host "  Files  : $($files.Count)"

if ($DryRun) {
  Write-Host "  [DRY RUN] no network changes."
  return
}
if (-not $pass) { throw "GAGOLINE_WEBDAV_PASS is empty in .env - set it before a real upload." }

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
$basic = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${user}:${pass}"))

function Dav-Send([string]$method, [string]$url, [string]$infile) {
  $attempt = 0
  while ($true) {
    $attempt++
    try {
      $r = [Net.HttpWebRequest]::Create($url); $r.Method = $method; $r.Headers['Authorization'] = $basic
      $r.Timeout = 120000; $r.ReadWriteTimeout = 120000; $r.KeepAlive = $false
      if ($infile) {
        $bytes = [IO.File]::ReadAllBytes($infile); $r.ContentLength = $bytes.Length
        $s = $r.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()
      } elseif ($method -eq 'MKCOL') { $r.ContentLength = 0 }
      $resp = $r.GetResponse(); $c = [int]$resp.StatusCode; $resp.Close(); return $c
    } catch [Net.WebException] {
      if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }  # real HTTP status (e.g. 405)
      if ($attempt -ge 5) { throw }
      Start-Sleep -Milliseconds (400 * $attempt)  # connect/timeout failure -> back off and retry
    }
  }
}

foreach ($d in $dirs) {
  $rel = $d.FullName.Substring($OutDir.Length).TrimStart('\')
  $null = Dav-Send 'MKCOL' (Get-RemoteUrl $rel) $null  # 201 new, 405/301 already exists
}
Write-Host "Directories ensured."

$ok = 0; $fail = 0; $i = 0
foreach ($f in $files) {
  $i++
  $rel = $f.FullName.Substring($OutDir.Length).TrimStart('\')
  $c = Dav-Send 'PUT' (Get-RemoteUrl $rel) $f.FullName
  if ($c -ge 200 -and $c -lt 300) { $ok++ } else { $fail++; Write-Host "  FAIL ($c): $rel" }
  if ($i % 25 -eq 0) { Write-Host "  ...$i/$($files.Count)" }
}
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = $null
Write-Host "Upload complete: $ok ok, $fail failed (of $($files.Count))."
if ($fail -gt 0) { throw "$fail file(s) failed to upload." }
