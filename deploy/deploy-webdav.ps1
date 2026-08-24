<#
  Deploy this site to its cPanel docroot.

  Thin shim over the shared deployer at ops/webdav-deploy.ps1 in the "Israeli services sites" hub,
  which owns cross-site ops scripts. This file used to be a full copy of the upload logic, and the
  three copies (gagoline, netomazganim, myhomeplumber) had already drifted apart.

  The shared version uploads only the delta versus the live site, sends assets before HTML, and
  retries patiently enough to ride out the Web Disk connection-rate block. See its header for why
  each of those matters - a full 445-file re-upload of a 2-file change caused a partial outage on
  2026-07-30.

  SAFETY: a real run OVERWRITES files in the target. Use -DryRun to preview the delta first.
#>
[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$IncludeHtaccess,
  [int]$PaceSeconds = 3,
  [string]$OutDir = (Join-Path $PSScriptRoot '..\out')
)
$ErrorActionPreference = "Stop"

$hub = Join-Path $PSScriptRoot '..\..\Israeli services sites\ops\webdav-deploy.ps1'
if (-not (Test-Path $hub)) { throw "Shared deployer not found: $hub" }

& $hub -Prefix GAGOLINE -OutDir $OutDir -SiteUrl 'https://gagoline.co.il' `
  -DryRun:$DryRun -IncludeHtaccess:$IncludeHtaccess -PaceSeconds $PaceSeconds
