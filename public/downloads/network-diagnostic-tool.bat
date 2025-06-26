@echo off
title AramisTech Network Diagnostic Tool
echo ================================================================
echo              AramisTech Network Diagnostic Tool
echo                    www.aramistech.com
echo ================================================================
echo.
echo Running comprehensive network diagnostics...
echo.

echo [1/6] Checking IP Configuration...
ipconfig /all > network_report.txt
echo    - IP Configuration saved

echo [2/6] Testing DNS Resolution...
nslookup google.com >> network_report.txt
echo    - DNS test completed

echo [3/6] Pinging Gateway...
for /f "tokens=3" %%i in ('ipconfig ^| find "Default Gateway"') do ping -n 4 %%i >> network_report.txt
echo    - Gateway connectivity tested

echo [4/6] Testing Internet Connectivity...
ping -n 4 8.8.8.8 >> network_report.txt
echo    - Internet connectivity tested

echo [5/6] Checking Network Adapters...
wmic path win32_networkadapter get name,netenabled >> network_report.txt
echo    - Network adapters checked

echo [6/6] Generating Final Report...
echo. >> network_report.txt
echo Report generated on %date% at %time% >> network_report.txt
echo For technical support, contact AramisTech at (305) 814-4461 >> network_report.txt

echo.
echo ================================================================
echo  Diagnostic complete! Report saved as 'network_report.txt'
echo  Please email this file to support@aramistech.com for analysis
echo ================================================================
pause