# Apply one or more reviewed batches to production in one go (owner only; docs/import-workflow.md "Production importer").
# Asks for the service-role key once with hidden input, keeps it in this process only, then for each batch in the order given:
# rebuild the index from production, re-plan (each apply changes the index the next batch is planned against), FULL dry run,
# take the confirmation token from its output, apply (only if the dry run passed), verify. Stops at the first failure.
# Afterwards it rebuilds the index once more and regenerates sitemap.xml, api/_places.json and data/spots-fallback.json.
# Entering the key is the owner's go-ahead: run it only for batches whose PR/report the owner has reviewed. Nothing is saved anywhere.
#   powershell -ExecutionPolicy Bypass -File scripts\apply-batch.ps1 <batch-name> [<batch-name> ...]
param([Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)][string[]]$Batch)

Set-Location (Split-Path $PSScriptRoot -Parent)
foreach ($b in $Batch) {
  if (-not (Test-Path "import/batches/$b/records.ndjson")) { Write-Host "No batch at import/batches/$b (is the right branch checked out?)" -ForegroundColor Red; exit 1 }
}

$env:SUPABASE_URL = 'https://thayxaampaelvntoaido.supabase.co'
$secure = Read-Host 'Service-role key (input is hidden)' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $env:SUPABASE_SERVICE_ROLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  $n = 0
  foreach ($b in $Batch) {
    $n++
    $dir = "import/batches/$b"
    Write-Host "`n==== [$n/$($Batch.Count)] $b ====" -ForegroundColor Cyan

    & node scripts/gym-import.js build-index --live
    if ($LASTEXITCODE -ne 0) { Write-Host "Index rebuild failed. Stopped before $b; nothing written for it." -ForegroundColor Red; exit 1 }
    & node scripts/gym-import.js plan $dir
    if ($LASTEXITCODE -ne 0) { Write-Host "$b no longer plans cleanly (see above). Stopped; nothing written for it." -ForegroundColor Red; exit 1 }

    Write-Host "-- dry run (read-only)" -ForegroundColor Cyan
    $out = & node scripts/gym-import.js import $dir --dry-run
    $code = $LASTEXITCODE
    $out | ForEach-Object { Write-Host $_ }
    $m = $out | Select-String -Pattern 'Confirmation token \(required[^)]*\): (\S+)'
    if ($code -ne 0 -or -not $m) { Write-Host "`nThe dry run for $b did not pass or gave no token (see above). Stopped; nothing written for it." -ForegroundColor Red; exit 1 }
    $token = $m.Matches[0].Groups[1].Value

    Write-Host "-- apply" -ForegroundColor Cyan
    & node scripts/gym-import.js import $dir --apply --confirm $token --i-understand-this-writes-to-production
    if ($LASTEXITCODE -ne 0) { Write-Host "`nApply of $b refused or failed (see above). Stopped." -ForegroundColor Red; exit 1 }

    Write-Host "-- verify" -ForegroundColor Cyan
    & node scripts/gym-import.js import $dir --verify
    if ($LASTEXITCODE -ne 0) { Write-Host "`nVerification of $b FAILED (see above). Stopped." -ForegroundColor Red; exit 1 }
    Write-Host "$b applied and verified." -ForegroundColor Green
  }

  Write-Host "`n==== Refreshing the index, sitemap and offline list ====" -ForegroundColor Cyan
  & node scripts/gym-import.js build-index --live
  & node scripts/build-sitemap.js
  Write-Host "`nDone: all $($Batch.Count) batch(es) applied and verified." -ForegroundColor Green
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_URL -ErrorAction SilentlyContinue
}
