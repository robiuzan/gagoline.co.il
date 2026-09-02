<#
  RETIRED. This script no longer deploys anything and will refuse to run.

  gagoline.co.il moved to CLOUDFLARE PAGES on 2026-08-02 (project 'gagoline'). Apex and www are
  proxied CNAMEs to gagoline.pages.dev; the Cloudflare API confirms the project serves both.
  The cPanel/WebDAV host (server.websquadinc.com) stopped being the origin on that date - the
  domain record in Sys Admin/inventory/domains.json states the cutover "Retires the WebDAV
  deploy path."

  Why this file still exists, refusing loudly, rather than being deleted:

  The identical script on the sibling site netomazganim.co.il was run repeatedly after its own
  cutover. It reported "Upload complete: NNN ok, 0 failed" every time and changed NOTHING public,
  because a 2xx from the Web Disk means "the file was accepted", not "the file is served". Four
  weeks of merged work sat invisible in production before anyone noticed.

  A deleted file gives "command not found" and an obvious retry. A file that silently succeeds
  gives false confidence. This one gives an explanation.

  Original preserved at deploy-webdav.ps1.retired-2026-09-01.bak (and in git history).
#>
[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$IncludeHtaccess,
  [int]$PaceSeconds = 3,
  [string]$OutDir
)

Write-Host ""
Write-Host "  REFUSED - this deploy path was retired on 2026-08-02." -ForegroundColor Red
Write-Host ""
Write-Host "  gagoline.co.il is served by Cloudflare Pages (project 'gagoline'), not cPanel/WebDAV." -ForegroundColor Yellow
Write-Host "  Uploading here changes nothing public - and reports success while doing it." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Use the fleet Pages deployer instead. It drift-checks against the Cloudflare API" -ForegroundColor Cyan
Write-Host "  first, so it REFUSES when the project does not serve the domain:" -ForegroundColor Cyan
Write-Host ""
Write-Host '    powershell -File "<hub>/ops/deploy-site.ps1" -Domain gagoline.co.il -DryRun' -ForegroundColor Green
Write-Host '    powershell -File "<hub>/ops/deploy-site.ps1" -Domain gagoline.co.il -Confirm' -ForegroundColor Green
Write-Host ""

exit 1
