#!/bin/bash

# 运行前先确保您在运行该脚本之前给予执行权限
# 在本地的控制台执行 chmod +x zip.sh

# 获取当前分支名
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ -f "${current_branch}-app.zip" ]; then
  rm "${current_branch}-app.zip"
fi

zip -r "${current_branch}-app.zip" . -x "node_modules/*" -x ".git/*" -x "dist/*" -x "src/.umi/*"
