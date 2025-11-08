$body = @{ email = 'proveedor@innovcircuit.com'; password = 'password123' } | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Method Post -Uri 'http://localhost:5173/api/v1/auth/login' -ContentType 'application/json' -Body $body
    Write-Output "STATUS: OK"
    $resp | ConvertTo-Json -Compress
} catch {
    Write-Output "STATUS: ERROR"
    Write-Output $_.Exception.Message
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $err = $reader.ReadToEnd()
        Write-Output "ERROR BODY: $err"
    }
}