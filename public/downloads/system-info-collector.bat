@echo off
title AramisTech System Information Collector
echo ================================================================
echo            AramisTech System Information Collector
echo                    www.aramistech.com
echo ================================================================
echo.
echo Collecting system information for technical support...
echo.

echo [1/8] Basic System Information...
systeminfo > system_info_report.txt
echo    - System details collected

echo [2/8] Hardware Information...
echo. >> system_info_report.txt
echo ====== HARDWARE INFORMATION ====== >> system_info_report.txt
wmic computersystem get model,manufacturer,totalphysicalmemory >> system_info_report.txt
wmic cpu get name,maxclockspeed,numberofcores >> system_info_report.txt
echo    - Hardware specs collected

echo [3/8] Storage Information...
echo. >> system_info_report.txt
echo ====== STORAGE INFORMATION ====== >> system_info_report.txt
wmic logicaldisk get size,freespace,caption >> system_info_report.txt
echo    - Storage details collected

echo [4/8] Running Processes...
echo. >> system_info_report.txt
echo ====== RUNNING PROCESSES ====== >> system_info_report.txt
tasklist /svc >> system_info_report.txt
echo    - Process list collected

echo [5/8] Installed Programs...
echo. >> system_info_report.txt
echo ====== INSTALLED PROGRAMS ====== >> system_info_report.txt
wmic product get name,version >> system_info_report.txt
echo    - Software inventory collected

echo [6/8] Event Log Errors...
echo. >> system_info_report.txt
echo ====== RECENT SYSTEM ERRORS ====== >> system_info_report.txt
wevtutil qe System /c:10 /rd:true /f:text /q:"*[System[(Level=2)]]" >> system_info_report.txt
echo    - Error logs collected

echo [7/8] Network Configuration...
echo. >> system_info_report.txt
echo ====== NETWORK CONFIGURATION ====== >> system_info_report.txt
ipconfig /all >> system_info_report.txt
echo    - Network config collected

echo [8/8] Finalizing Report...
echo. >> system_info_report.txt
echo ====== REPORT METADATA ====== >> system_info_report.txt
echo Report generated on %date% at %time% >> system_info_report.txt
echo Computer: %computername% >> system_info_report.txt
echo User: %username% >> system_info_report.txt
echo For analysis, email to: support@aramistech.com >> system_info_report.txt

echo.
echo ================================================================
echo  Collection complete! Report saved as 'system_info_report.txt'
echo  Please email this file to support@aramistech.com
echo ================================================================
pause