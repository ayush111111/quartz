# Script to update blog posts with proper Quartz frontmatter and fix image paths

$notesDir = "C:\Users\lokar\quartz\content\notes"
$markdownFiles = Get-ChildItem "$notesDir\*.md" | Where-Object { $_.Name -match "^\d{4}-\d{2}-\d{2}-" }

foreach ($file in $markdownFiles) {
    Write-Host "Processing: $($file.Name)"
    
    # Extract date and title from filename
    if ($file.BaseName -match "^(\d{4}-\d{2}-\d{2})-(.+)$") {
        $date = $matches[1]
        $titleRaw = $matches[2]
        $title = $titleRaw -replace "-", " "
        
        $content = Get-Content $file.FullName -Raw
        
        # Check if file already has frontmatter
        if (-not $content.StartsWith("---")) {
            # Add frontmatter
            $frontmatter = @"
---
title: "$title"
date: $date
tags:
  - blog-post
---

"@
            $newContent = $frontmatter + $content
            Set-Content $file.FullName -Value $newContent -Encoding UTF8
        }
        
        # Fix image references - add leading slash for static assets
        $content = Get-Content $file.FullName -Raw
        $content = $content -replace 'src="([^"/][^"]*\.(png|jpg|jpeg|gif|svg))"', 'src="/$1"'
        $content = $content -replace 'src=''([^''/][^'']*\.(png|jpg|jpeg|gif|svg))''', 'src=''/$1'''
        Set-Content $file.FullName -Value $content -Encoding UTF8
    }
}

Write-Host "Processing complete!"
