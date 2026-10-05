# Apply one maintenance/import batch to production in one go (owner only; docs/import-workflow.md "Production importer").
# Asks for the service-role key with hidden input, keeps it in this process only, runs the FULL dry run, takes the confirmation
# token from its output, applies (only if the dry run passed), verifies, then clears the key. Nothing is saved anywhere.
# Entering the key is the owner's go-ahead: run it only for a batch whose PR/report the owner has reviewed.
#   powershell -ExecutionPolicy Bypass -File scripts\apply-batch.ps1 <batch-name>
param([Parameter(Mandatory = $true)][string]$Batch)

Set-Location (Split-Path $PSScriptRoot -Parent)
$dir = "import/batches/$Batch"
if (-not (Test-Path "$dir/plan.json")) { Write-Host "No planned batch at $dir (is the right branch checked out?)" -ForegroundColor Red; exit 1 }

$env:SUPABASE_URL = 'https://thayxaampaelvntoaido.supabase.co'
$secure = Read-Host 'Service-role key (input is hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $env:SUPABASE_SERVICE_ROLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

  Write-Host "`n== 1/3 Dry run (read-only) ==" -ForegroundColor Cyan
  $out = & node scripts/gym-import.js import $dir --dry-run
  $code = $LASTEXITCODE
  $out | ForEach-Object { Write-Host $_ }
  $m = $out | Select-String -Pattern 'Confirmation token \(required[^)]*\): (\S+)'
  if ($code -ne 0 -or -not $m) { Write-Host "`nThe dry run did not pass or gave no token (see above). Nothing was written." -ForegroundColor Red; exit 1 }
  $token = $m.Matches[0].Groups[1].Value

  Write-Host "`n== 2/3 Apply ==" -ForegroundColor Cyan
  & node scripts/gym-import.js import $dir --apply --confirm $token --i-understand-this-writes-to-production
  if ($LASTEXITCODE -ne 0) { Write-Host "`nApply refused or failed (see above)." -ForegroundColor Red; exit 1 }

  Write-Host "`n== 3/3 Verify ==" -ForegroundColor Cyan
  & node scripts/gym-import.js import $dir --verify
  if ($LASTEXITCODE -ne 0) { Write-Host "`nVerification FAILED (see above)." -ForegroundColor Red; exit 1 }
  Write-Host "`nDone: applied and verified." -ForegroundColor Green
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_URL -ErrorAction SilentlyContinue
}
