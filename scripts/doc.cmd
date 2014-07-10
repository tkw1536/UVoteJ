@echo off

REM Update the documentation.
SET rootdir=%~dp0
SET rootdir="%rootdir%/../"
cd "%rootdir%"

<nul set /p =Generating documentation ...
jsdoc -c "%rootdir%/jsdoc.json"
echo "Done. "
