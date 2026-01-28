# OmniHR Bulk Redesign Script
# This PowerShell script performs bulk find-and-replace operations to convert the design system

# Color class replacements - Emerald to Indigo
$replacements = @{
    # Primary colors (emerald -> indigo/primary)
    "bg-emerald-50" = "bg-primary-50"
    "bg-emerald-100" = "bg-primary-100"
    "bg-emerald-500" = "bg-primary-500"
    "bg-emerald-600" = "bg-primary-600"
    "bg-emerald-700" = "bg-primary-700"
    "text-emerald-500" = "text-primary-500"
    "text-emerald-600" = "text-primary-600"
    "text-emerald-700" = "text-primary-700"
    "border-emerald-500" = "border-primary-500"
    "border-emerald-600" = "border-primary-600"
    "ring-emerald-500" = "ring-primary-500"
    "hover:bg-emerald-600" = "hover:bg-primary-600"
    "hover:bg-emerald-700" = "hover:bg-primary-700"
    
    # Slate to Gray conversions for consistency
    "bg-slate-50" = "bg-gray-50"
    "bg-slate-100" = "bg-gray-100"
    "bg-slate-900" = "bg-gray-900"
    "text-slate-400" = "text-gray-400"
    "text-slate-500" = "text-gray-500"
    "text-slate-600" = "text-gray-600"
    "text-slate-700" = "text-gray-700"
    "text-slate-900" = "text-gray-900"
    "border-slate-200" = "border-gray-200"
    "border-slate-300" = "border-gray-300"
    "hover:bg-slate-50" = "hover:bg-gray-50"
    "hover:bg-slate-100" = "hover:bg-gray-100"
    
    # Remove dark mode variants
    "dark:bg-slate-900" = ""
    "dark:bg-slate-950" = ""
    "dark:text-slate-100" = ""
    "dark:text-slate-200" = ""
    "dark:border-slate-800" = ""
    "dark:hover:bg-slate-800" = ""
}

# Get all JSX files in features directory
$files = Get-ChildItem -Path "frontend\src\features" -Recurse -Filter "*.jsx"

$totalFiles = $files.Count
$currentFile = 0

Write-Host "Starting OmniHR Design Conversion..." -ForegroundColor Cyan
Write-Host "Total files to process: $totalFiles" -ForegroundColor Yellow

foreach ($file in $files) {
    $currentFile++
    Write-Host "[$currentFile/$totalFiles] Processing: $($file.Name)" -ForegroundColor Gray
    
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($find in $replacements.Keys) {
        $replace = $replacements[$find]
        if ($content -match [regex]::Escape($find)) {
            $content = $content -replace [regex]::Escape($find), $replace
            $modified = $true
        }
    }
    
    if ($modified) {
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "  ✓ Updated" -ForegroundColor Green
    }
}

Write-Host "`nConversion complete!" -ForegroundColor Green
Write-Host "Files processed: $totalFiles" -ForegroundColor Cyan
