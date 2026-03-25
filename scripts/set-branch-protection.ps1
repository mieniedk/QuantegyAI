param(
  [Parameter(Mandatory = $true)]
  [string]$Owner,
  [Parameter(Mandatory = $true)]
  [string]$Repo,
  [Parameter(Mandatory = $false)]
  [string]$Branch = "main",
  [Parameter(Mandatory = $true)]
  [string]$Token
)

$uri = "https://api.github.com/repos/$Owner/$Repo/branches/$Branch/protection"
$headers = @{
  Authorization = "Bearer $Token"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$body = @{
  required_status_checks = @{
    strict = $true
    contexts = @(
      "Lint",
      "Build",
      "Unit Tests",
      "API Integration Tests",
      "API Security Guardrails",
      "E2E Onboarding Wizard",
      "E2E Accessibility Smoke",
      "Docker Build"
    )
  }
  enforce_admins = $false
  required_pull_request_reviews = @{
    required_approving_review_count = 1
    dismiss_stale_reviews = $true
    require_code_owner_reviews = $false
  }
  restrictions = $null
  allow_force_pushes = $false
  allow_deletions = $false
  block_creations = $false
  required_conversation_resolution = $true
  lock_branch = $false
}

try {
  $json = $body | ConvertTo-Json -Depth 8
  $response = Invoke-RestMethod -Method Put -Uri $uri -Headers $headers -Body $json -ContentType "application/json"
  Write-Host "Branch protection updated for $Owner/$Repo ($Branch)."
  Write-Host "Required checks:"
  $body.required_status_checks.contexts | ForEach-Object { Write-Host "- $_" }
}
catch {
  Write-Error "Failed to update branch protection: $($_.Exception.Message)"
  if ($_.ErrorDetails.Message) {
    Write-Host "GitHub response: $($_.ErrorDetails.Message)"
  }
  exit 1
}
