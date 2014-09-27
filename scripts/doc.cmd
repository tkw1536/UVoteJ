@echo off

REM Update the documentation.
SET rootdir=%~dp0
SET rootdir="%rootdir%/../"
cd "%rootdir%"

REM Remove old doc
rmdir "%rootdir%/static/api" /s

<nul set /p =Generating documentation ...
jsdoc -c "%rootdir%/jsdoc.json"
echo "Done. "
